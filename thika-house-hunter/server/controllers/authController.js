const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authCookieOptions, signToken } = require('../config/jwt');
const { asyncHandler } = require('../middleware/errorMiddleware');

function sendAuthResponse(res, user, statusCode = 200) {
  const token = signToken(user);

  res
    .status(statusCode)
    .cookie('token', token, authCookieOptions())
    .json({
      token,
      user,
    });
}

const register = asyncHandler(async (req, res) => {
  const { name, full_name, email, password, phone, role } = req.body;
  const displayName = full_name || name;

  if (!displayName || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required.');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters.');
  }

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    res.status(409);
    throw new Error('An account with that email already exists.');
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    full_name: displayName,
    email,
    password_hash,
    phone,
    role,
    privacy_consent_at: req.body.privacy_consent ? new Date().toISOString() : null,
  });

  sendAuthResponse(res, user, 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const userWithPassword = await User.findByEmail(email, { includePassword: true });
  const passwordMatches = userWithPassword
    ? await bcrypt.compare(password, userWithPassword.password_hash)
    : false;

  if (!passwordMatches) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  sendAuthResponse(res, User.toPublicUser(userWithPassword));
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', authCookieOptions()).json({ message: 'Logged out.' });
});

module.exports = {
  login,
  logout,
  me,
  register,
};
