const bcrypt = require('bcryptjs');
const { jwtCookieName, nodeEnv } = require('../config/env');
const { query } = require('../config/db');
const { CSRF_COOKIE } = require('../middleware/csrfMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { cleanEmail, cleanString } = require('../utils/sanitize');
const { hashToken, randomToken, signToken } = require('../services/tokenService');
const { sendEmail } = require('../services/emailService');
const { profileCompletionScore } = require('../services/rankingService');

function setAuthCookie(res, token) {
  const csrfToken = randomToken();
  res.cookie(jwtCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return csrfToken;
}

function userResponse(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    status: user.status,
    is_email_verified: user.is_email_verified,
    is_phone_verified: user.is_phone_verified,
  };
}

const register = asyncHandler(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');
  const displayName = cleanString(req.body.display_name || req.body.name, 80);
  const age = Number(req.body.age);
  const town = cleanString(req.body.town, 80);

  if (!email || !password || !displayName || !age) {
    res.status(400);
    throw new Error('Email, password, display name, and age are required.');
  }

  if (age < 18) {
    res.status(400);
    throw new Error('Connect254 is only for adults aged 18 and above.');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters.');
  }

  const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
  if (existing[0]) {
    res.status(409);
    throw new Error('An account already exists with that email.');
  }

  const verificationToken = randomToken();
  const passwordHash = await bcrypt.hash(password, 12);
  const users = await query(
    `INSERT INTO users (email, password_hash, email_verification_hash, email_verification_expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')
     RETURNING id, email, role, status, is_email_verified, is_phone_verified`,
    [email, passwordHash, hashToken(verificationToken)],
  );

  const profile = {
    display_name: displayName,
    age,
    town,
    gender: cleanString(req.body.gender, 40),
    relationship_goal: cleanString(req.body.relationship_goal, 80),
    bio: cleanString(req.body.bio, 600),
  };
  profile.profile_completion = profileCompletionScore(profile);

  await query(
    `INSERT INTO profiles (user_id, display_name, age, town, gender, relationship_goal, bio, profile_completion)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [users[0].id, profile.display_name, profile.age, profile.town, profile.gender, profile.relationship_goal, profile.bio, profile.profile_completion],
  );
  await query('INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)', [users[0].id, 'free', 'active']);

  const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Connect254 account',
    text: `Verify your account: ${verifyUrl}`,
    html: `<p>Welcome to Connect254.</p><p><a href="${verifyUrl}">Verify your account</a></p>`,
  });

  const token = signToken(users[0]);
  const csrfToken = setAuthCookie(res, token);
  res.status(201).json({ user: userResponse(users[0]), token, csrfToken, email_verification_sent: true });
});

const login = asyncHandler(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');

  const rows = await query(
    `SELECT id, email, password_hash, role, status, is_email_verified, is_phone_verified
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  const user = rows[0];
  const matches = user ? await bcrypt.compare(password, user.password_hash) : false;
  if (!user || !matches || user.status !== 'active') {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
  await query('UPDATE profiles SET last_active_at = NOW(), activity_score = activity_score + 1 WHERE user_id = $1', [user.id]);

  const token = signToken(user);
  const csrfToken = setAuthCookie(res, token);
  res.json({ user: userResponse(user), token, csrfToken });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(jwtCookieName);
  res.clearCookie(CSRF_COOKIE);
  res.json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT u.id, u.email, u.role, u.status, u.is_email_verified, u.is_phone_verified,
            p.display_name, p.age, p.town, p.gender, p.profile_completion, p.verification_badge
     FROM users u
     LEFT JOIN profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [req.user.id],
  );
  res.json({ user: rows[0] });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const token = randomToken();
  await query(
    `UPDATE users
     SET password_reset_hash = $1, password_reset_expires_at = NOW() + INTERVAL '1 hour'
     WHERE email = $2`,
    [hashToken(token), email],
  );

  const resetUrl = `${req.protocol}://${req.get('host')}/pages/forgot-password.html?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Connect254 password',
    text: `Reset your password: ${resetUrl}`,
    html: `<p><a href="${resetUrl}">Reset your password</a></p>`,
  });

  res.json({ ok: true, message: 'If the email exists, reset instructions have been sent.' });
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const tokenHash = hashToken(String(req.body.token || ''));
  const password = String(req.body.password || '');

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters.');
  }

  const rows = await query(
    `SELECT id FROM users
     WHERE email = $1 AND password_reset_hash = $2 AND password_reset_expires_at > NOW()
     LIMIT 1`,
    [email, tokenHash],
  );

  if (!rows[0]) {
    res.status(400);
    throw new Error('Reset link is invalid or expired.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await query(
    `UPDATE users
     SET password_hash = $1, password_reset_hash = NULL, password_reset_expires_at = NULL
     WHERE id = $2`,
    [passwordHash, rows[0].id],
  );
  res.json({ ok: true });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const email = cleanEmail(req.query.email);
  const tokenHash = hashToken(String(req.query.token || ''));
  const rows = await query(
    `UPDATE users
     SET is_email_verified = TRUE, email_verification_hash = NULL, email_verification_expires_at = NULL
     WHERE email = $1 AND email_verification_hash = $2 AND email_verification_expires_at > NOW()
     RETURNING id`,
    [email, tokenHash],
  );

  if (!rows[0]) {
    res.status(400);
    throw new Error('Verification link is invalid or expired.');
  }

  res.json({ ok: true, message: 'Email verified.' });
});

module.exports = {
  login,
  logout,
  me,
  register,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
};
