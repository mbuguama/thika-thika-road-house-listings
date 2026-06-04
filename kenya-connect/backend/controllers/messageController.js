const { query } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');
const { cleanString } = require('../utils/sanitize');

async function ensureMatchAccess(matchId, userId) {
  const rows = await query(
    `SELECT * FROM matches
     WHERE id = $1 AND (user_one_id = $2 OR user_two_id = $2) AND status = 'matched'
     LIMIT 1`,
    [matchId, userId],
  );
  return rows[0] || null;
}

const listMessages = asyncHandler(async (req, res) => {
  const match = await ensureMatchAccess(req.params.matchId, req.user.id);
  if (!match) {
    res.status(404);
    throw new Error('Match not found.');
  }

  const { limit, offset, page } = getPagination(req.query);
  const rows = await query(
    `SELECT * FROM messages
     WHERE match_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [match.id, limit, offset],
  );
  res.json({ messages: rows.reverse(), page, limit });
});

const sendMessage = asyncHandler(async (req, res) => {
  const match = await ensureMatchAccess(req.params.matchId, req.user.id);
  if (!match) {
    res.status(404);
    throw new Error('Match not found.');
  }

  const body = cleanString(req.body.body, 2000);
  const mediaUrl = cleanString(req.body.media_url, 500);
  if (!body && !mediaUrl) {
    res.status(400);
    throw new Error('Message body or media is required.');
  }

  const rows = await query(
    `INSERT INTO messages (match_id, sender_id, body, media_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [match.id, req.user.id, body, mediaUrl || null],
  );

  const recipientId = match.user_one_id === req.user.id ? match.user_two_id : match.user_one_id;
  await query(
    `INSERT INTO notifications (user_id, type, title, body, data)
     VALUES ($1, 'message', 'New message', 'You have a new message.', $2::jsonb)`,
    [recipientId, JSON.stringify({ match_id: match.id, message_id: rows[0].id })],
  );

  res.status(201).json({ message: rows[0] });
});

const markRead = asyncHandler(async (req, res) => {
  await query(
    `UPDATE messages SET read_at = NOW()
     WHERE match_id = $1 AND sender_id <> $2 AND read_at IS NULL`,
    [req.params.matchId, req.user.id],
  );
  res.json({ ok: true });
});

module.exports = {
  listMessages,
  markRead,
  sendMessage,
};
