const fs = require('node:fs');
const path = require('node:path');

async function migrate(connection) {
  const sql = fs.readFileSync(path.join(__dirname, '../sql/migrations/001_holiday_restore.sql'), 'utf8');
  for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) {
    await connection.query(statement);
  }
}

module.exports = migrate;
if (require.main === module) {
  const pool = require('../src/config/database');
  migrate(pool).then(() => console.log('Holiday restoration migration applied.'))
    .catch(error => { console.error(error.message); process.exitCode = 1; })
    .finally(() => pool.end());
}
