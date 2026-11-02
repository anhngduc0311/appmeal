const fs = require('node:fs');
const path = require('node:path');

async function migrate(pool) {
  if (pool.dialect !== 'postgres') throw new Error('DATABASE_URL must point to PostgreSQL');
  const client = await pool.native.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('appmeal_schema'))");
    await client.query(fs.readFileSync(path.join(__dirname, '../sql/postgres.sql'), 'utf8'));
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
  await new (require('../src/repos/SystemSettingRepository'))().ensureDefaults();
  await new (require('../src/repos/MealScheduleConfigRepository'))().ensureDefaults();
}

module.exports = migrate;
if (require.main === module) {
  const pool = require('../src/config/database');
  migrate(pool).then(() => console.log('PostgreSQL schema ready.'))
    .catch(error => { console.error(error.message); process.exitCode = 1; })
    .finally(() => pool.end());
}
