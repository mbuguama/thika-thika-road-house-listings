const Payment = require('../models/Payment');
const Property = require('../models/Property');
const { query } = require('../config/db');
const { isMpesaConfigured } = require('../config/mpesa');
const { asyncHandler } = require('../middleware/errorMiddleware');
const {
  initiateStkPush,
  normalizeMpesaPhone,
  parseCallbackMetadata,
  queryStkPush,
} = require('../services/mpesaService');

function paymentProducts() {
  return {
    landlord_verification: {
      label: 'Verification fee',
      amount: Number(process.env.PLATFORM_VERIFICATION_FEE || 300),
      description: 'Pay landlord, agent or broker verification fee.',
    },
    featured_listing: {
      label: 'Featured listing',
      amount: Number(process.env.FEATURED_LISTING_FEE || 500),
      days: Number(process.env.FEATURED_LISTING_DAYS || 7),
      description: 'Promote one listing above normal results.',
    },
  };
}

function callbackUrlForRequest(req) {
  if (process.env.MPESA_CALLBACK_URL) return process.env.MPESA_CALLBACK_URL;

  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  return `${protocol}://${req.get('host')}/api/payments/mpesa/callback`;
}

function ensurePaymentOwner(user, payment) {
  if (!payment) {
    const error = new Error('Payment not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== 'admin' && payment.user_id !== user.id) {
    const error = new Error('You do not have permission to view this payment.');
    error.statusCode = 403;
    throw error;
  }
}

async function resolvePaymentProduct(user, body) {
  const products = paymentProducts();

  if (body.purpose === 'landlord_verification') {
    return {
      purpose: body.purpose,
      amount: products.landlord_verification.amount,
      description: 'Thika House Hunter verification',
      metadata: {
        product_label: products.landlord_verification.label,
      },
    };
  }

  if (body.purpose === 'featured_listing') {
    const property = await Property.findById(body.property_id);

    if (!property) {
      const error = new Error('Property not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role !== 'admin' && property.landlord_id !== user.id) {
      const error = new Error('You can only promote your own listings.');
      error.statusCode = 403;
      throw error;
    }

    return {
      purpose: body.purpose,
      amount: products.featured_listing.amount,
      property_id: property.id,
      description: `Feature listing for ${products.featured_listing.days} days`,
      metadata: {
        product_label: products.featured_listing.label,
        featured_days: products.featured_listing.days,
        property_title: property.title,
      },
    };
  }

  const error = new Error('Choose a valid M-Pesa payment purpose.');
  error.statusCode = 400;
  throw error;
}

async function applySuccessfulPayment(payment) {
  if (!payment || payment.status !== 'paid' || payment.applied_at) return payment;

  if (payment.purpose === 'featured_listing' && payment.property_id) {
    const days = Number(payment.metadata?.featured_days || process.env.FEATURED_LISTING_DAYS || 7);
    await query(
      `UPDATE properties
       SET featured_until = CASE
           WHEN featured_until IS NOT NULL AND featured_until > NOW()
             THEN featured_until + ($2::text || ' days')::interval
           ELSE NOW() + ($2::text || ' days')::interval
         END,
         updated_at = NOW()
       WHERE id = $1`,
      [payment.property_id, days],
    );
  }

  return Payment.markApplied(payment.id);
}

const getPaymentConfig = asyncHandler(async (req, res) => {
  res.json({
    mpesa_configured: isMpesaConfigured(),
    callback_url_configured: Boolean(process.env.MPESA_CALLBACK_URL),
    products: paymentProducts(),
  });
});

const listMyPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.listForUser(req.user.id);
  res.json({ payments });
});

const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  ensurePaymentOwner(req.user, payment);
  res.json({ payment });
});

const startMpesaPayment = asyncHandler(async (req, res) => {
  if (!isMpesaConfigured()) {
    res.status(503);
    throw new Error('M-Pesa is not configured yet. Add Daraja credentials to the .env file.');
  }

  const product = await resolvePaymentProduct(req.user, req.body);
  const phone = normalizeMpesaPhone(req.body.phone || req.user.phone || '');
  const accountReference = `THIKA${Date.now().toString(36).slice(-7).toUpperCase()}`;
  const payment = await Payment.create({
    user_id: req.user.id,
    property_id: product.property_id,
    purpose: product.purpose,
    amount: product.amount,
    phone,
    account_reference: accountReference,
    description: product.description,
    metadata: product.metadata,
  });

  try {
    const result = await initiateStkPush({
      amount: product.amount,
      phone,
      accountReference,
      description: product.description,
      callbackUrl: callbackUrlForRequest(req),
    });

    const accepted = String(result.response.ResponseCode) === '0';
    const updatedPayment = await Payment.markProcessing(payment.id, {
      merchant_request_id: result.response.MerchantRequestID,
      checkout_request_id: result.response.CheckoutRequestID,
      raw_request: result.payload,
      raw_response: result.response,
    });

    if (!accepted) {
      const failed = await Payment.markFailed(payment.id, result.response.ResponseDescription, result.response);
      res.status(400).json({ payment: failed, mpesa: result.response });
      return;
    }

    res.status(201).json({ payment: updatedPayment, mpesa: result.response });
  } catch (error) {
    await Payment.markFailed(payment.id, error.message, error.details || {});
    throw error;
  }
});

const queryMpesaPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findRawById(req.params.id);
  ensurePaymentOwner(req.user, payment);

  if (!payment.checkout_request_id) {
    res.status(400);
    throw new Error('This payment does not have an M-Pesa checkout request yet.');
  }

  const result = await queryStkPush(payment.checkout_request_id);
  const updatedPayment = await Payment.updateFromQuery(payment.id, result.response);
  const appliedPayment = updatedPayment?.status === 'paid'
    ? await applySuccessfulPayment(updatedPayment)
    : updatedPayment;

  res.json({
    payment: Payment.toClientPayment(appliedPayment || updatedPayment),
    mpesa: result.response,
  });
});

const handleMpesaCallback = asyncHandler(async (req, res) => {
  const callback = req.body?.Body?.stkCallback;

  if (callback?.CheckoutRequestID) {
    const metadata = parseCallbackMetadata(callback);
    const existingPayment = await Payment.findRawByCheckoutRequestId(callback.CheckoutRequestID);
    let callbackToSave = callback;

    if (existingPayment && Number(callback.ResultCode) === 0) {
      const amountMatches = Math.round(Number(metadata.Amount || 0)) === Math.round(Number(existingPayment.amount || 0));
      const hasReceipt = Boolean(metadata.MpesaReceiptNumber);

      if (!amountMatches || !hasReceipt) {
        callbackToSave = {
          ...callback,
          ResultCode: 1,
          ResultDesc: 'M-Pesa callback metadata did not match this payment.',
        };
      }
    }

    const payment = await Payment.updateFromCallback(callback.CheckoutRequestID, callbackToSave, metadata);

    if (payment?.status === 'paid') {
      await applySuccessfulPayment(payment);
    }
  }

  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

module.exports = {
  getPayment,
  getPaymentConfig,
  handleMpesaCallback,
  listMyPayments,
  queryMpesaPayment,
  startMpesaPayment,
};
