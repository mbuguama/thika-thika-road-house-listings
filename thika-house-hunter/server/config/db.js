const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

let sqlClient;

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  if (!isDatabaseConfigured()) {
    const error = new Error('DATABASE_URL is not set. Add your Neon connection string to .env.');
    error.statusCode = 503;
    throw error;
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

async function query(text, params = []) {
  return getSql().query(text, params);
}

async function pingDatabase() {
  const rows = await query('SELECT NOW() AS now');
  return rows[0];
}

module.exports = {
  getSql,
  isDatabaseConfigured,
  pingDatabase,
  query,
};
