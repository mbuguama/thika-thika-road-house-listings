const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { cleanArray, cleanString } = require('../utils/sanitize');
const { uploadImageBuffer } = require('../services/cloudinaryService');
const { profileCompletionScore } = require('../services/rankingService');

function publicProfileSelect() {
  return `p.*, u.is_email_verified, u.is_phone_verified,
    COALESCE((
      SELECT image_url FROM photos ph
      WHERE ph.profile_id = p.id AND ph.moderation_status = 'approved'
      ORDER BY ph.is_primary DESC, ph.created_at ASC
      LIMIT 1
    ), '') AS primary_photo`;
}

const listProfiles = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const rows = await query(
    `SELECT ${publicProfileSelect()}
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.is_discoverable = TRUE AND u.status = 'active'
     ORDER BY p.activity_score DESC, p.popularity_score DESC, p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  res.json({ profiles: rows, page, limit });
});

const getProfile = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT ${publicProfileSelect()}
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1
     LIMIT 1`,
    [req.params.id],
  );

  if (!rows[0]) {
    res.status(404);
    throw new Error('Profile not found.');
  }

  await query('INSERT INTO profile_views (viewer_id, profile_id) VALUES ($1, $2)', [req.user?.id || null, req.params.id]);
  res.json({ profile: rows[0] });
});

const getMyProfile = asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM profiles WHERE user_id = $1 LIMIT 1', [req.user.id]);
  res.json({ profile: rows[0] || null });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const data = {
    display_name: cleanString(req.body.display_name, 80),
    bio: cleanString(req.body.bio, 800),
    gender: cleanString(req.body.gender, 40),
    age: Number(req.body.age),
    town: cleanString(req.body.town, 80),
    occupation: cleanString(req.body.occupation, 120),
    education: cleanString(req.body.education, 120),
    relationship_goal: cleanString(req.body.relationship_goal, 120),
    interests: cleanArray(req.body.interests),
    preferences: req.body.preferences && typeof req.body.preferences === 'object' ? req.body.preferences : {},
  };

  if (!data.display_name || data.age < 18) {
    res.status(400);
    throw new Error('Display name and adult age are required.');
  }

  const completion = profileCompletionScore(data);
  const rows = await query(
    `UPDATE profiles
     SET display_name = $1, bio = $2, gender = $3, age = $4, town = $5,
         occupation = $6, education = $7, relationship_goal = $8,
         interests = $9, preferences = $10::jsonb, profile_completion = $11,
         last_active_at = NOW()
     WHERE user_id = $12
     RETURNING *`,
    [
      data.display_name,
      data.bio,
      data.gender,
      data.age,
      data.town,
      data.occupation,
      data.education,
      data.relationship_goal,
      data.interests,
      JSON.stringify(data.preferences),
      completion,
      req.user.id,
    ],
  );

  res.json({ profile: rows[0] });
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Image file is required.');
  }

  const profileRows = await query('SELECT id FROM profiles WHERE user_id = $1 LIMIT 1', [req.user.id]);
  if (!profileRows[0]) {
    res.status(404);
    throw new Error('Profile not found.');
  }

  const result = await uploadImageBuffer(req.file);
  const rows = await query(
    `INSERT INTO photos (user_id, profile_id, image_url, public_id, moderation_status, is_primary)
     VALUES ($1, $2, $3, $4, 'pending', NOT EXISTS (SELECT 1 FROM photos WHERE profile_id = $2))
     RETURNING *`,
    [req.user.id, profileRows[0].id, result.secure_url, result.public_id],
  );

  res.status(201).json({ photo: rows[0] });
});

const favoriteProfile = asyncHandler(async (req, res) => {
  const rows = await query(
    `INSERT INTO favorites (user_id, profile_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, profile_id) DO NOTHING
     RETURNING *`,
    [req.user.id, req.params.id],
  );
  res.status(201).json({ favorite: rows[0] || null });
});

const listFavorites = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT f.created_at AS saved_at, ${publicProfileSelect()}
     FROM favorites f
     JOIN profiles p ON p.id = f.profile_id
     JOIN users u ON u.id = p.user_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [req.user.id],
  );
  res.json({ favorites: rows });
});

const listRecentlyViewed = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT MAX(v.created_at) AS viewed_at, ${publicProfileSelect()}
     FROM profile_views v
     JOIN profiles p ON p.id = v.profile_id
     JOIN users u ON u.id = p.user_id
     WHERE v.viewer_id = $1
     GROUP BY p.id, u.id
     ORDER BY viewed_at DESC
     LIMIT 20`,
    [req.user.id],
  );
  res.json({ profiles: rows });
});

module.exports = {
  favoriteProfile,
  getMyProfile,
  getProfile,
  listFavorites,
  listProfiles,
  listRecentlyViewed,
  updateMyProfile,
  uploadProfilePhoto,
};
