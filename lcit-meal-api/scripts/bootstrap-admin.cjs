// One-time production setup: no shared/default passwords and no demo records.
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const pool = require('../src/config/database');

async function bootstrap() {
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!password || password.length < 16) throw new Error('INITIAL_ADMIN_PASSWORD must have at least 16 characters');
  const [[existing]] = await pool.query('SELECT id FROM user LIMIT 1');
  if (existing) throw new Error('Database already has users; bootstrap will not alter existing accounts');
  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    const [created] = await db.query(`INSERT INTO user(full_name,username,password_hash,auth_key,status)
      VALUES(?,?,?,?,?)`, ['Quản trị viên', 'admin', await bcrypt.hash(password, 12), crypto.randomBytes(16).toString('hex'), '1']);
    const [[role]] = await db.query("SELECT id FROM role WHERE code='admin'");
    await db.query('INSERT INTO user_role(user_id,role_id,status) VALUES(?,?,?)', [created.insertId, role.id, 'active']);
    await db.commit();
    console.log('Administrator account created.');
  } catch (error) { await db.rollback(); throw error; }
  finally { db.release(); }
}
if (require.main === module) bootstrap().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
module.exports = bootstrap;
