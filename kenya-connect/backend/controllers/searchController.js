const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { cleanString } = require('../utils/sanitize');

const searchProfiles = asyncHandler(async (req, res) => {
  const { limit, offset, page } = getPagination(req.query);
  const town = cleanString(req.query.town, 80);
  const gender = cleanString(req.query.gender, 40);
  const goal = cleanString(req.query.relationship_goal, 120);
  const education = cleanString(req.query.education, 120);
  const occupation = cleanString(req.query.occupation, 120);
  const interest = cleanString(req.query.interest, 80);
  const minAge = Number(req.query.min_age) || 18;
  const maxAge = Number(req.query.max_age) || 99;
  const verifiedOnly = req.query.verified === 'true';
  const sort = ['active', 'newest', 'popular', 'nearest'].includes(req.query.sort) ? req.query.sort : 'active';
  const orderBy = {
    active: 'p.last_active_at DESC',
    newest: 'p.created_at DESC',
    popular: 'p.popularity_score DESC',
    nearest: 'p.town ASC, p.last_active_at DESC',
  }[sort];

  const rows = await query(
    `SELECT p.*,
            COALESCE((SELECT image_url FROM photos ph WHERE ph.profile_id = p.id AND ph.moderation_status = 'approved' ORDER BY ph.is_primary DESC LIMIT 1), '') AS primary_photo
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.is_discoverable = TRUE
       AND u.status = 'active'
       AND p.age BETWEEN $1 AND $2
       AND ($3 = '' OR p.town = $3)
       AND ($4 = '' OR p.gender = $4)
       AND ($5 = '' OR p.relationship_goal = $5)
       AND ($6 = FALSE OR p.verification_badge <> 'none')
       AND ($7 = '' OR p.education ILIKE '%' || $7 || '%')
       AND ($8 = '' OR p.occupation ILIKE '%' || $8 || '%')
       AND ($9 = '' OR EXISTS (
         SELECT 1 FROM unnest(p.interests) AS item
         WHERE item ILIKE '%' || $9 || '%'
       ))
     ORDER BY ${orderBy}
     LIMIT $10 OFFSET $11`,
    [minAge, maxAge, town, gender, goal, verifiedOnly, education, occupation, interest, limit, offset],
  );

  res.json({ profiles: rows, page, limit, sort });
});

module.exports = {
  searchProfiles,
};
