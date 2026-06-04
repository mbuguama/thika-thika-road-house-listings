const jwt = require('jsonwebtoken');
const { jwtCookieName, jwtSecret } = require('../config/env');
const { query } = require('../config/db');

function getToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[jwtCookieName] || '';
}

async function protect(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      res.status(401);
      throw new Error('Authentication required.');
    }

    const payload = jwt.verify(token, jwtSecret);
    const rows = await query(
      `SELECT id, email, role, status, is_email_verified, is_phone_verified, created_at
       FROM users
       WHERE id = $1 AND status <> 'banned'
       LIMIT 1`,
      [payload.id],
    );

    if (!rows[0]) {
      res.status(401);
      throw new Error('Invalid session.');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    res.status(403);
    next(new Error('Admin access required.'));
    return;
  }

  next();
}

module.exports = {
  protect,
  requireAdmin,
};
