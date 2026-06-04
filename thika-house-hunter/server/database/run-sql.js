const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let quote = null;
  let dollarTag = null;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (!quote && !dollarTag && char === '-' && next === '-') {
      while (i < sql.length && sql[i] !== '\n') i += 1;
      current += '\n';
      continue;
    }

    if (!quote && char === '$') {
      const rest = sql.slice(i);
      const match = rest.match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        const tag = match[0];
        current += tag;
        i += tag.length - 1;
        dollarTag = dollarTag === tag ? null : tag;
        continue;
      }
    }

    if (!dollarTag && (char === "'" || char === '"')) {
      if (quote === char && next !== char) {
        quote = null;
      } else if (!quote) {
        quote = char;
      }
    }

    if (!quote && !dollarTag && char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const last = current.trim();
  if (last) statements.push(last);
  return statements;
}

async function main() {
  const file = process.argv[2];

  if (!file) {
    throw new Error('Provide a SQL file path.');
  }

  const fullPath = path.resolve(process.cwd(), file);
  const sql = fs.readFileSync(fullPath, 'utf8');
  const statements = splitSqlStatements(sql);

  for (const statement of statements) {
    await query(statement);
  }

  console.log(`Ran ${statements.length} SQL statements from ${file}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
