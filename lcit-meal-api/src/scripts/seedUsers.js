const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function seed() {
  const connection = await pool.getConnection();
  try {
    const passwordHash = await bcrypt.hash('123456', 10);
    console.log('Generated hash for 123456:', passwordHash);

    // Update admin password
    await connection.query(
      `UPDATE user SET password_hash = ? WHERE username = 'admin'`,
      [passwordHash]
    );

    // Seed Manager
    const [mgr] = await connection.query(`SELECT id FROM user WHERE username = 'manager'`);
    let managerId;
    if (!mgr.length) {
      const [res] = await connection.query(
        `INSERT INTO user (full_name, username, password_hash, auth_key, status) VALUES (?, ?, ?, ?, ?)`,
        ['Trần Quản Lý', 'manager', passwordHash, 'auth_manager_key', '1']
      );
      managerId = res.insertId;
      await connection.query(
        `INSERT INTO user_role (user_id, role_id, status) VALUES (?, 2, 'active')`,
        [managerId]
      );
      console.log('Created manager account (id:', managerId, ')');
    } else {
      managerId = mgr[0].id;
      await connection.query(`UPDATE user SET password_hash = ? WHERE id = ?`, [passwordHash, managerId]);
    }

    // Seed User1 (Employee)
    const [emp] = await connection.query(`SELECT id FROM user WHERE username = 'user1'`);
    let empId;
    if (!emp.length) {
      const [res] = await connection.query(
        `INSERT INTO user (full_name, username, password_hash, auth_key, status) VALUES (?, ?, ?, ?, ?)`,
        ['Nguyễn Văn Cán Bộ', 'user1', passwordHash, 'auth_user1_key', '1']
      );
      empId = res.insertId;
      await connection.query(
        `INSERT INTO user_role (user_id, role_id, status) VALUES (?, 3, 'active')`,
        [empId]
      );
      console.log('Created employee account user1 (id:', empId, ')');
    } else {
      empId = emp[0].id;
      await connection.query(`UPDATE user SET password_hash = ?, status = '1' WHERE id = ?`, [passwordHash, empId]);
    }

    // Ensure Kitchen role exists
    const [kRole] = await connection.query(`SELECT id FROM role WHERE code = 'kitchen'`);
    let kitchenRoleId;
    if (!kRole.length) {
      const [res] = await connection.query(
        `INSERT INTO role (display_name, code, description, status) VALUES (?, ?, ?, ?)`,
        ['Nhân viên bếp', 'kitchen', 'Nhân viên phục vụ bếp', 'active']
      );
      kitchenRoleId = res.insertId;
    } else {
      kitchenRoleId = kRole[0].id;
    }

    // Seed Kitchen
    const [kit] = await connection.query(`SELECT id FROM user WHERE username = 'kitchen'`);
    let kitId;
    if (!kit.length) {
      const [res] = await connection.query(
        `INSERT INTO user (full_name, username, password_hash, auth_key, status) VALUES (?, ?, ?, ?, ?)`,
        ['Lê Đầu Bếp', 'kitchen', passwordHash, 'auth_kitchen_key', '1']
      );
      kitId = res.insertId;
      await connection.query(
        `INSERT INTO user_role (user_id, role_id, status) VALUES (?, ?, 'active')`,
        [kitId, kitchenRoleId]
      );
      console.log('Created kitchen account (id:', kitId, ')');
    } else {
      kitId = kit[0].id;
      await connection.query(`UPDATE user SET password_hash = ? WHERE id = ?`, [passwordHash, kitId]);
    }

    console.log('All test accounts seeded successfully with password 123456!');
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
