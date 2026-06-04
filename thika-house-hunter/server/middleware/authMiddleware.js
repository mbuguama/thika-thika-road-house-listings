const User = require('../models/User');
const { verifyToken } = require('../config/jwt');
const { asyncHandler } = require('./errorMiddleware');

function extractToken(req) {
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return req.cookies?.token;
}

const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    res.status(401);
    throw new Error('Authentication required.');
  }

  const payload = verifyToken(token);
  const user = await User.findById(payload.id);

  if (!user) {
    res.status(401);
    throw new Error('User account no longer exists.');
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
