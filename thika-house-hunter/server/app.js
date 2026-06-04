const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const adRoutes = require('./routes/adRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const landlordRoutes = require('./routes/landlordRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const userRoutes = require('./routes/userRoutes');
const { isDatabaseConfigured, pingDatabase } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const clientPath = path.join(__dirname, '..', 'client');

app.disable('x-powered-by');

const defaultOrigins = [
  'http://localhost:5000',
  'https://thika-road-house-hunter.vercel.app',
  'https://thika-house-hunter-mbuguamas-projects.vercel.app',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean);

const allowedOrigins = [
  ...defaultOrigins,
  ...(process.env.CLIENT_ORIGIN || '').split(','),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin || allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    return (
      process.env.VERCEL === '1'
      && originUrl.protocol === 'https:'
      && originUrl.hostname.endsWith('.vercel.app')
    );
  } catch (error) {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS.'));
    },
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=()');
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(clientPath));

app.get('/api/health', async (req, res, next) => {
  try {
    const database = isDatabaseConfigured() ? await pingDatabase() : null;

    res.json({
      ok: true,
      app: 'Thika House Hunter',
      database: database ? { connected: true, now: database.now } : { connected: false },
    });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
