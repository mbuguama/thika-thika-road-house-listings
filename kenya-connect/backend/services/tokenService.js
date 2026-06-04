const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtExpiresIn, jwtSecret } = require('../config/env');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  hashToken,
  randomToken,
  signToken,
};
