const { neon } = require('@neondatabase/serverless');

let sqlClient;

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not set. Add your Neon connection string to .env.');
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

async function query(text, params = []) {
  const sql = getSql();
  return sql.query(text, params);
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
