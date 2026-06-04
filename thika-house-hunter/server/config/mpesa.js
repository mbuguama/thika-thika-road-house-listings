require('dotenv').config();

const MPESA_BASE_URLS = {
  production: 'https://api.safaricom.co.ke',
  sandbox: 'https://sandbox.safaricom.co.ke',
};

function getMpesaConfig() {
  const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox';
  const shortCode = process.env.MPESA_SHORTCODE || '';

  return {
    env,
    baseUrl: process.env.MPESA_BASE_URL || MPESA_BASE_URLS[env],
    consumerKey: process.env.MPESA_CONSUMER_KEY || '',
    consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
    shortCode,
    passkey: process.env.MPESA_PASSKEY || '',
    partyB: process.env.MPESA_PARTY_B || shortCode,
    transactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
    callbackUrl: process.env.MPESA_CALLBACK_URL || '',
  };
}

function isMpesaConfigured() {
  const config = getMpesaConfig();
  return Boolean(
    config.consumerKey &&
      config.consumerSecret &&
      config.shortCode &&
      config.passkey &&
      config.partyB,
  );
}

module.exports = {
  getMpesaConfig,
  isMpesaConfigured,
};
