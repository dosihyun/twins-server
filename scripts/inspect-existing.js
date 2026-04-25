/* eslint-disable */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const text = fs.readFileSync(envPath, 'utf8');
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

(async () => {
  const env = loadEnv();
  const targetDb = process.argv[2] || 'twins staging';
  const cfg = {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    port: Number(env.DB_PORT || 3306),
    connectTimeout: 10000,
  };
  const conn = await mysql.createConnection(cfg);
  try {
    const [tables] = await conn.query(
      'SELECT TABLE_NAME, TABLE_ROWS, ENGINE, TABLE_COMMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [targetDb],
    );
    console.log(`[db] "${targetDb}" tables=${tables.length}`);
    for (const t of tables) {
      console.log(
        `- ${t.TABLE_NAME}  rows≈${t.TABLE_ROWS ?? '?'}  engine=${t.ENGINE}  comment="${t.TABLE_COMMENT || ''}"`,
      );
    }
    for (const t of tables) {
      const [cols] = await conn.query(
        'SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
        [targetDb, t.TABLE_NAME],
      );
      console.log(`\n[columns] ${t.TABLE_NAME}`);
      for (const c of cols) {
        console.log(
          `  ${c.COLUMN_NAME}  ${c.COLUMN_TYPE}  null=${c.IS_NULLABLE}  key=${c.COLUMN_KEY || '-'}  default=${c.COLUMN_DEFAULT ?? 'NULL'}  extra=${c.EXTRA || '-'}  // ${c.COLUMN_COMMENT || ''}`,
        );
      }
    }
  } finally {
    await conn.end();
  }
})();
