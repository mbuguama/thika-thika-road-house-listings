require('dotenv').config();

function numberEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

module.exports = {
  port: numberEnv('PORT', 5100),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5100',
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieName: process.env.JWT_COOKIE_NAME || 'kenya_connect_token',
  freeDailyLikeLimit: numberEnv('FREE_DAILY_LIKE_LIMIT', 30),
  superLikeLimit: numberEnv('SUPER_LIKE_LIMIT', 3),
  premiumPriceKes: numberEnv('PREMIUM_PRICE_KES', 799),
};
