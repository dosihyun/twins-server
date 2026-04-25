/* eslint-disable */
// One-off script to inspect schema of the staging DB.
// Reads credentials from twins-server/.env

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
  const targetDb = env.DB_NAME;
  const baseCfg = {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    port: Number(env.DB_PORT || 3306),
    connectTimeout: 10000,
  };
  console.log(`[connect] ${baseCfg.user}@${baseCfg.host}:${baseCfg.port} (no db)`);
  let conn;
  try {
    conn = await mysql.createConnection(baseCfg);
  } catch (err) {
    console.error('[error] connection failed:', err.code || err.message);
    process.exit(1);
  }

  try {
    const [dbs] = await conn.query(
      'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA ORDER BY SCHEMA_NAME',
    );
    console.log(`\n[databases]`);
    for (const d of dbs) console.log(`- ${d.SCHEMA_NAME}`);

    const exists = dbs.some((d) => d.SCHEMA_NAME === targetDb);
    console.log(`\n[target] ${targetDb} exists=${exists}`);

    if (!exists) {
      console.log(`[hint] target db missing. Run with CREATE_DB=1 to create it.`);
      if (process.env.CREATE_DB === '1') {
        await conn.query(
          `CREATE DATABASE \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        );
        console.log(`[ok] created database ${targetDb}`);
      }
      return;
    }

    await conn.query(`USE \`${targetDb}\``);
    const [tables] = await conn.query(
      'SELECT TABLE_NAME, TABLE_ROWS, ENGINE, TABLE_COMMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      [targetDb],
    );
    console.log(`\n[tables] count=${tables.length}`);
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
