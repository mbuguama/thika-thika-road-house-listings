const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { compatibilityScore } = require('../services/rankingService');

async function getProfileByUser(userId) {
  const rows = await query('SELECT * FROM profiles WHERE user_id = $1 LIMIT 1', [userId]);
  return rows[0] || null;
}

const actOnProfile = asyncHandler(async (req, res) => {
  const type = ['like', 'super_like', 'pass'].includes(req.body.type) ? req.body.type : 'like';
  const target = await query('SELECT user_id FROM profiles WHERE id = $1 LIMIT 1', [req.params.profileId]);
  if (!target[0]) {
    res.status(404);
    throw new Error('Profile not found.');
  }

  const targetUserId = target[0].user_id;
  if (targetUserId === req.user.id) {
    res.status(400);
    throw new Error('You cannot match with yourself.');
  }

  await query(
    `INSERT INTO likes (from_user_id, to_user_id, type)
     VALUES ($1, $2, $3)
     ON CONFLICT (from_user_id, to_user_id)
     DO UPDATE SET type = EXCLUDED.type, created_at = NOW()`,
    [req.user.id, targetUserId, type],
  );

  let match = null;
  if (type !== 'pass') {
    const reciprocal = await query(
      `SELECT id FROM likes
       WHERE from_user_id = $1 AND to_user_id = $2 AND type IN ('like', 'super_like')
       LIMIT 1`,
      [targetUserId, req.user.id],
    );

    if (reciprocal[0]) {
      const myProfile = await getProfileByUser(req.user.id);
      const otherProfile = await getProfileByUser(targetUserId);
      const score = compatibilityScore(otherProfile, myProfile);
      const userOne = req.user.id < targetUserId ? req.user.id : targetUserId;
      const userTwo = req.user.id < targetUserId ? targetUserId : req.user.id;
      const rows = await query(
        `INSERT INTO matches (user_one_id, user_two_id, compatibility_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_one_id, user_two_id)
         DO UPDATE SET status = 'matched', compatibility_score = EXCLUDED.compatibility_score, updated_at = NOW()
         RETURNING *`,
        [userOne, userTwo, score],
      );
      match = rows[0];

      await query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, 'match', 'New match', 'You have a new mutual match.', $2::jsonb),
                ($3, 'match', 'New match', 'You have a new mutual match.', $2::jsonb)`,
        [req.user.id, JSON.stringify({ match_id: match.id }), targetUserId],
      );
    }
  }

  res.json({ ok: true, type, match });
});

const listMatches = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT m.*,
            CASE WHEN m.user_one_id = $1 THEN p2.display_name ELSE p1.display_name END AS matched_name,
            CASE WHEN m.user_one_id = $1 THEN p2.town ELSE p1.town END AS matched_town,
            CASE WHEN m.user_one_id = $1 THEN p2.id ELSE p1.id END AS matched_profile_id
     FROM matches m
     JOIN profiles p1 ON p1.user_id = m.user_one_id
     JOIN profiles p2 ON p2.user_id = m.user_two_id
     WHERE (m.user_one_id = $1 OR m.user_two_id = $1) AND m.status = 'matched'
     ORDER BY m.matched_at DESC`,
    [req.user.id],
  );
  res.json({ matches: rows });
});

module.exports = {
  actOnProfile,
  listMatches,
};
