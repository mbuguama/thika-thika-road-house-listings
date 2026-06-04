const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { query } = require('../config/db');

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let state = 'normal';
  let dollarTag = '';

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];

    if (state === 'lineComment') {
      current += char;
      if (char === '\n') state = 'normal';
      continue;
    }

    if (state === 'blockComment') {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        index += 1;
        state = 'normal';
      }
      continue;
    }

    if (state === 'singleQuote') {
      current += char;
      if (char === "'" && next === "'") {
        current += next;
        index += 1;
      } else if (char === "'") {
        state = 'normal';
      }
      continue;
    }

    if (state === 'doubleQuote') {
      current += char;
      if (char === '"') state = 'normal';
      continue;
    }

    if (state === 'dollarQuote') {
      if (sql.startsWith(dollarTag, index)) {
        current += dollarTag;
        index += dollarTag.length - 1;
        state = 'normal';
      } else {
        current += char;
      }
      continue;
    }

    if (char === '-' && next === '-') {
      current += char + next;
      index += 1;
      state = 'lineComment';
      continue;
    }

    if (char === '/' && next === '*') {
      current += char + next;
      index += 1;
      state = 'blockComment';
      continue;
    }

    if (char === "'") {
      current += char;
      state = 'singleQuote';
      continue;
    }

    if (char === '"') {
      current += char;
      state = 'doubleQuote';
      continue;
    }

    if (char === '$') {
      const match = sql.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);
      if (match) {
        dollarTag = match[0];
        current += dollarTag;
        index += dollarTag.length - 1;
        state = 'dollarQuote';
        continue;
      }
    }

    if (char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const finalStatement = current.trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    throw new Error('Usage: node backend/database/run-sql.js <file.sql>');
  }

  const sqlPath = path.resolve(process.cwd(), file);
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = splitSqlStatements(sql);

  for (const statement of statements) {
    await query(statement);
  }

  console.log(`Executed ${file} (${statements.length} statements)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
