const { jwtCookieName } = require('../config/env');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_COOKIE = 'kenya_connect_csrf';

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const bearer = req.headers.authorization || '';
  const usesBearerToken = bearer.startsWith('Bearer ');
  const hasSessionCookie = Boolean(req.cookies?.[jwtCookieName]);

  if (!hasSessionCookie || usesBearerToken) {
    next();
    return;
  }

  const expected = req.cookies?.[CSRF_COOKIE];
  const received = req.headers['x-csrf-token'];

  if (expected && received === expected) {
    next();
    return;
  }

  res.status(403);
  next(new Error('Invalid CSRF token.'));
}

module.exports = {
  CSRF_COOKIE,
  csrfProtection,
};
