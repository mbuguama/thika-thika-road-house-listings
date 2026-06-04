const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { clientOrigin, nodeEnv } = require('./config/env');
const { configureCloudinary } = require('./config/cloudinary');
const { isDatabaseConfigured, pingDatabase } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { csrfProtection } = require('./middleware/csrfMiddleware');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const matchRoutes = require('./routes/matchRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reportRoutes = require('./routes/reportRoutes');
const searchRoutes = require('./routes/searchRoutes');
const userRoutes = require('./routes/userRoutes');

configureCloudinary();

const app = express();
const frontendPath = path.join(__dirname, '..', 'frontend');
const allowedOrigins = [
  clientOrigin,
  'http://localhost:5100',
  'http://127.0.0.1:5100',
  ...(process.env.EXTRA_CLIENT_ORIGINS || '').split(','),
].map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", clientOrigin, ...(process.env.EXTRA_CLIENT_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiLimiter);
app.use('/api', csrfProtection);
app.get('/service-worker.js', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(frontendPath, 'service-worker.js'));
});
app.use(express.static(frontendPath, {
  etag: true,
  maxAge: nodeEnv === 'production' ? '1h' : 0,
}));

app.get('/api/health', async (req, res, next) => {
  try {
    const databaseConfigured = isDatabaseConfigured();
    const database = databaseConfigured ? await pingDatabase() : null;
    res.json({
      ok: true,
      app: 'Connect254',
      database: database
        ? { connected: true, now: database.now }
        : {
            connected: false,
            configured: databaseConfigured,
            requiredEnv: 'DATABASE_URL',
            setupCommand: 'npm run db:setup',
          },
      cloudinary: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
