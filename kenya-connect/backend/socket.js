const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { clientOrigin, jwtSecret } = require('./config/env');
const { query } = require('./config/db');

function attachSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: clientOrigin,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('Socket authentication required.');
      socket.user = jwt.verify(token, jwtSecret);
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', async (socket) => {
    const room = `user:${socket.user.id}`;
    socket.join(room);
    socket.broadcast.emit('presence:online', { user_id: socket.user.id });

    socket.on('message:send', async (payload, callback) => {
      try {
        const rows = await query(
          `INSERT INTO messages (match_id, sender_id, body, media_url)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [payload.match_id, socket.user.id, String(payload.body || '').slice(0, 2000), payload.media_url || null],
        );
        const message = rows[0];
        io.to(`user:${payload.recipient_id}`).emit('message:new', message);
        socket.emit('message:new', message);
        if (callback) callback({ ok: true, message });
      } catch (error) {
        if (callback) callback({ ok: false, message: error.message });
      }
    });

    socket.on('typing:start', (payload) => {
      io.to(`user:${payload.recipient_id}`).emit('typing:start', { user_id: socket.user.id, match_id: payload.match_id });
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('presence:offline', { user_id: socket.user.id });
    });
  });

  return io;
}

module.exports = {
  attachSocketServer,
};
