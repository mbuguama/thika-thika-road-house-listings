const { getMpesaConfig, isMpesaConfigured } = require('../config/mpesa');

let cachedToken = null;
let tokenExpiresAt = 0;

function formatDarajaTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const value = (type) => parts.find((part) => part.type === type)?.value || '';
  return `${value('year')}${value('month')}${value('day')}${value('hour')}${value('minute')}${value('second')}`;
}

function normalizeMpesaPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  let normalized = digits;

  if (digits.startsWith('0')) {
    normalized = `254${digits.slice(1)}`;
  } else if (digits.startsWith('7') || digits.startsWith('1')) {
    normalized = `254${digits}`;
  }

  if (!/^254[17]\d{8}$/.test(normalized)) {
    const error = new Error('Enter a valid M-Pesa phone number, for example 07xx xxx xxx.');
    error.statusCode = 400;
    throw error;
  }

  return normalized;
}

function assertMpesaConfigured() {
  if (!isMpesaConfigured()) {
    const error = new Error('M-Pesa is not configured yet. Add Daraja credentials to the .env file.');
    error.statusCode = 503;
    throw error;
  }
}

async function readSafaricomResponse(response) {
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const error = new Error(data.errorMessage || data.error_description || data.ResponseDescription || 'M-Pesa request failed.');
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function getAccessToken() {
  assertMpesaConfigured();

  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const config = getMpesaConfig();
  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const response = await fetch(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });
  const data = await readSafaricomResponse(response);

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + Math.max(Number(data.expires_in || 3600) - 60, 60) * 1000;

  return cachedToken;
}

function buildPassword(shortCode, passkey, timestamp) {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
}

async function initiateStkPush({ amount, phone, accountReference, description, callbackUrl }) {
  assertMpesaConfigured();

  const config = getMpesaConfig();
  const token = await getAccessToken();
  const timestamp = formatDarajaTimestamp();
  const normalizedPhone = normalizeMpesaPhone(phone);
  const roundedAmount = Math.max(1, Math.round(Number(amount || 0)));
  const payload = {
    BusinessShortCode: config.shortCode,
    Password: buildPassword(config.shortCode, config.passkey, timestamp),
    Timestamp: timestamp,
    TransactionType: config.transactionType,
    Amount: roundedAmount,
    PartyA: normalizedPhone,
    PartyB: config.partyB,
    PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl || config.callbackUrl,
    AccountReference: String(accountReference || 'THIKA').slice(0, 12),
    TransactionDesc: String(description || 'Thika payment').slice(0, 100),
  };

  const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return {
    payload,
    response: await readSafaricomResponse(response),
  };
}

async function queryStkPush(checkoutRequestId) {
  assertMpesaConfigured();

  const config = getMpesaConfig();
  const token = await getAccessToken();
  const timestamp = formatDarajaTimestamp();
  const payload = {
    BusinessShortCode: config.shortCode,
    Password: buildPassword(config.shortCode, config.passkey, timestamp),
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await fetch(`${config.baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return {
    payload,
    response: await readSafaricomResponse(response),
  };
}

function parseCallbackMetadata(callback = {}) {
  const items = callback.CallbackMetadata?.Item || [];

  return items.reduce((metadata, item) => {
    if (item?.Name) {
      metadata[item.Name] = item.Value;
    }
    return metadata;
  }, {});
}

module.exports = {
  formatDarajaTimestamp,
  initiateStkPush,
  normalizeMpesaPhone,
  parseCallbackMetadata,
  queryStkPush,
};
