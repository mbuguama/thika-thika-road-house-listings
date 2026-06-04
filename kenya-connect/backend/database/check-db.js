const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { isDatabaseConfigured, pingDatabase, query } = require('../config/db');

const requiredTables = [
  'users',
  'profiles',
  'photos',
  'matches',
  'likes',
  'messages',
  'notifications',
  'favorites',
  'profile_views',
  'reports',
  'subscriptions',
  'verification_requests',
  'admin_logs',
];

async function main() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is missing. Copy .env.example to .env and paste your Neon connection string.');
  }

  const ping = await pingDatabase();
  const placeholders = requiredTables.map((_, index) => `$${index + 1}`).join(', ');
  const rows = await query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (${placeholders})`,
    requiredTables,
  );
  const found = new Set(rows.map((row) => row.table_name));
  const missing = requiredTables.filter((table) => !found.has(table));

  console.log(`Connected to Neon at ${ping.now}.`);

  if (missing.length) {
    throw new Error(`Missing database tables: ${missing.join(', ')}. Run npm run db:schema first.`);
  }

  console.log(`Database ready. Found ${requiredTables.length} required tables.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
