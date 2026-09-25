/**
 * Comprehensive Database Seeder for LCIT Meal System
 * Tự động tạo dữ liệu thực tế: Người dùng (4 roles), Cấu hình hệ thống,
 * Lịch bếp & thực đơn tháng 09/2026, Đăng ký suất ăn (completed/confirmed/pending/cancelled),
 * Yêu cầu cắt suất theo khoảng, Hóa đơn thanh toán (paid/unpaid) & Thông báo.
 */

const bcrypt = require('bcrypt');
const pool = require('../config/database');

const MENUS = [
  'Cơm sườn nướng mật ong, canh cải cúc thịt bằm, dưa chua xào',
  'Cá basa kho tộ, rau muống xào tỏi, canh ngao nấu chua dứa',
  'Thịt ba chỉ kho trứng, canh bí đỏ sườn heo, đậu hũ sốt cà chua',
  'Gà rang lá chanh, bắp cải xào tỏi, canh cua rau đay mướp mồng tơi',
  'Bò xào cần tỏi, trứng cuộn ngũ sắc, canh chua cá lóc miền Tây',
];

const CORE_DEMO_USERS = [
  { fullName: 'Nguyễn Văn An', username: 'nv_an', phone: '0901234567', email: 'an.nv@lcit.vn', roleId: 3 },
  { fullName: 'Trần Quang Minh', username: 'ql_minh', phone: '0912345678', email: 'minh.tq@lcit.vn', roleId: 2 },
  { fullName: 'Quản Trị Hệ Thống', username: 'admin', phone: '0988888888', email: 'admin@lcit.vn', roleId: 1 },
  { fullName: 'Lê Thị Bếp', username: 'bep_truong', phone: '0933333333', email: 'bep@lcit.vn', roleId: 4 },
];

const SAMPLE_EMPLOYEES = [
  { fullName: 'Nguyễn Văn Cán Bộ', username: 'user1', phone: '0901234567', email: 'canbo@lcit.vn' },
  { fullName: 'Trần Quản Lý', username: 'manager', phone: '0912345678', email: 'manager@lcit.vn', roleId: 2 },
  { fullName: 'Lê Đầu Bếp', username: 'kitchen', phone: '0933333333', email: 'kitchen@lcit.vn', roleId: 4 },
  { fullName: 'Kim Mạnh Cường', username: 'cuongkm', phone: '0912345678', email: 'cuongkm@lcit.vn' },
  { fullName: 'Vũ Lê Duy', username: 'duyvl', phone: '0923456789', email: 'duyvl@lcit.vn' },
  { fullName: 'Trần Duy Khánh', username: 'khanhtd', phone: '0934567890', email: 'khanhtd@lcit.vn' },
  { fullName: 'Bùi Minh Hiệp', username: 'hiepbm', phone: '0945678901', email: 'hiepbm@lcit.vn' },
  { fullName: 'Đinh Thị Hằng', username: 'hangdt', phone: '0956789012', email: 'hangdt@lcit.vn' },
  { fullName: 'Đinh Thị Hải', username: 'haidt', phone: '0967890123', email: 'haidt@lcit.vn' },
  { fullName: 'Tô Ngọc Anh', username: 'anhnt', phone: '0978901234', email: 'anhnt@lcit.vn' },
  { fullName: 'Dương Quang Huy', username: 'huytd', phone: '0989012345', email: 'huytd@lcit.vn' },
  { fullName: 'Nguyễn Thế Hùng', username: 'hungnt', phone: '0990123456', email: 'hungnt@lcit.vn' },
  { fullName: 'Hoàng Minh Tuân', username: 'tuanhm', phone: '0909876543', email: 'tuanhm@lcit.vn' },
];

async function seed() {
  console.log('====================================================');
  console.log(' SEEDING COMPREHENSIVE DATA INTO MYSQL DATABASE');
  console.log('====================================================\n');

  const connection = await pool.getConnection();

  try {
    const passwordHash = await bcrypt.hash('123456', 10);

    // 1. Roles
    console.log('1. Ensuring Roles...');
    const roles = [
      { id: 1, name: 'Quản trị viên', code: 'admin', desc: 'Toàn quyền quản trị hệ thống' },
      { id: 2, name: 'Quản lý bếp ăn', code: 'manager', desc: 'Duyệt đăng ký/cắt suất, quản lý thanh toán' },
      { id: 3, name: 'Cán bộ nhân viên', code: 'employee', desc: 'Đăng ký ăn, cắt suất, xem thanh toán cá nhân' },
      { id: 4, name: 'Nhân viên bếp', code: 'kitchen', desc: 'Phục vụ nấu nướng và xem lịch bếp' },
    ];

    for (const r of roles) {
      const [existing] = await connection.query('SELECT id FROM role WHERE id = ? OR code = ?', [r.id, r.code]);
      if (!existing.length) {
        await connection.query(
          'INSERT INTO role (id, display_name, code, description, status) VALUES (?, ?, ?, ?, ?)',
          [r.id, r.name, r.code, r.desc, 'active']
        );
      }
    }

    // 2. Users (Core Demo Users: admin, nv_an, ql_minh, bep_truong + other employees)
    console.log('2. Seeding Users (Password: 123456)...');
    
    let adminId;
    const employeeIds = [];

    // Seed Core Demo Users first
    for (const u of CORE_DEMO_USERS) {
      const [check] = await connection.query('SELECT id FROM user WHERE username = ?', [u.username]);
      let uid;
      if (!check.length) {
        const [res] = await connection.query(
          'INSERT INTO user (full_name, username, password_hash, auth_key, status) VALUES (?, ?, ?, ?, ?)',
          [u.fullName, u.username, passwordHash, `auth_${u.username}_key`, '1']
        );
        uid = res.insertId;
        await connection.query('INSERT INTO user_role (user_id, role_id, status) VALUES (?, ?, ?)', [uid, u.roleId, 'active']);
      } else {
        uid = check[0].id;
        await connection.query(
          "UPDATE user SET full_name = ?, password_hash = ?, status = '1' WHERE id = ?",
          [u.fullName, passwordHash, uid]
        );
        // Ensure role
        const [roleCheck] = await connection.query('SELECT id FROM user_role WHERE user_id = ?', [uid]);
        if (!roleCheck.length) {
          await connection.query('INSERT INTO user_role (user_id, role_id, status) VALUES (?, ?, ?)', [uid, u.roleId, 'active']);
        } else {
          await connection.query('UPDATE user_role SET role_id = ? WHERE user_id = ?', [u.roleId, uid]);
        }
      }

      if (u.username === 'admin') adminId = uid;
      if (u.roleId === 3) employeeIds.push(uid);
    }

    // Seed Additional Employees
    for (const emp of SAMPLE_EMPLOYEES) {
      const roleId = emp.roleId || 3;
      const [check] = await connection.query('SELECT id FROM user WHERE username = ?', [emp.username]);
      let uid;
      if (!check.length) {
        const [res] = await connection.query(
          'INSERT INTO user (full_name, username, password_hash, auth_key, status) VALUES (?, ?, ?, ?, ?)',
          [emp.fullName, emp.username, passwordHash, `auth_${emp.username}_key`, '1']
        );
        uid = res.insertId;
        await connection.query('INSERT INTO user_role (user_id, role_id, status) VALUES (?, ?, ?)', [uid, roleId, 'active']);
      } else {
        uid = check[0].id;
        await connection.query(
          "UPDATE user SET full_name = ?, password_hash = ?, status = '1' WHERE id = ?",
          [emp.fullName, passwordHash, uid]
        );
      }
      if (roleId === 3) {
        employeeIds.push(uid);
      }
    }
    console.log(`✓ Seeded ${CORE_DEMO_USERS.length + SAMPLE_EMPLOYEES.length} users with exact credentials.`);

    // 3. System Settings
    console.log('3. Seeding System Settings...');
    const settings = [
      { key: 'meal_price', value: '30000', name: 'Giá suất cán bộ', type: 'integer', desc: 'Đơn giá suất ăn của cán bộ (VNĐ)' },
      { key: 'guest_meal_price', value: '35000', name: 'Giá suất khách', type: 'integer', desc: 'Đơn giá suất ăn của khách ăn kèm (VNĐ)' },
      { key: 'registration_close_time', value: '09:00', name: 'Giờ đóng báo suất', type: 'string', desc: 'Giờ chốt đăng ký và cắt suất hàng ngày' },
      { key: 'meal_completion_time', value: '12:00', name: 'Giờ hoàn thành suất', type: 'string', desc: 'Giờ tự động hoàn thành suất ăn' },
      { key: 'payment_qr_image', value: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=2|99|0987654321|NGUYEN%20VAN%20ADMIN||0|0|30000|DONG%20TIEN%20AN', name: 'Mã QR thanh toán', type: 'string', desc: 'Link ảnh QR ngân hàng nhận tiền ăn' },
      { key: 'auto_register_start_day', value: '1', name: 'Ngày bắt đầu tự động', type: 'integer', desc: 'Ngày trong tháng bắt đầu tạo lịch tự động' },
      { key: 'payment_due_day', value: '10', name: 'Ngày đến hạn thanh toán', type: 'integer', desc: 'Ngày trong tháng nhắc thanh toán' },
      { key: 'payment_reminder_enabled', value: '1', name: 'Nhắc thanh toán', type: 'boolean', desc: 'Bật thông báo nhắc thanh toán' },
    ];

    for (const s of settings) {
      await connection.query(
        `INSERT INTO system_setting (setting_key, setting_value, display_name, data_type, description)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), display_name = VALUES(display_name)`,
        [s.key, s.value, s.name, s.type, s.desc]
      );
    }
    console.log('✓ System Settings updated.');

    // 4. Meal Schedule Days (0-6)
    console.log('4. Seeding Weekly Schedule Days...');
    const scheduleDays = [
      { day: 0, enabled: 0, notes: 'Chủ nhật nghỉ' },
      { day: 1, enabled: 1, notes: 'Bữa trưa thứ 2 đầu tuần' },
      { day: 2, enabled: 1, notes: 'Bữa trưa thứ 3' },
      { day: 3, enabled: 1, notes: 'Bữa trưa thứ 4' },
      { day: 4, enabled: 1, notes: 'Bữa trưa thứ 5' },
      { day: 5, enabled: 1, notes: 'Bữa trưa thứ 6' },
      { day: 6, enabled: 0, notes: 'Thứ 7 nghỉ cuối tuần' },
    ];

    for (const d of scheduleDays) {
      await connection.query(
        `INSERT INTO meal_schedule_config (day_of_week, is_enabled, notes)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE is_enabled = VALUES(is_enabled), notes = VALUES(notes)`,
        [d.day, d.enabled, d.notes]
      );
    }
    console.log('✓ Weekly schedule configured.');

    // 5. Meals for September 2026
    console.log('5. Seeding Meals & Daily Menus for September 2026...');
    const createdMealMap = new Map(); // dateStr -> mealId

    for (let day = 1; day <= 30; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `2026-09-${dayStr}`;
      const dt = new Date(2026, 8, day);
      const dayOfWeek = dt.getDay(); // 0=Sun, 6=Sat

      if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

      const isHoliday = (dateStr === '2026-09-02');
      const menuIdx = (day - 1) % MENUS.length;
      const note = isHoliday ? 'Nghỉ lễ Quốc khánh 2/9' : MENUS[menuIdx];

      await connection.query(
        `INSERT INTO meal (meal_date, is_cancelled, note, status)
         VALUES (?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE is_cancelled = VALUES(is_cancelled), note = VALUES(note)`,
        [dateStr, isHoliday ? 1 : 0, note]
      );

      const [mealRow] = await connection.query('SELECT id FROM meal WHERE meal_date = ?', [dateStr]);
      if (mealRow.length) {
        createdMealMap.set(dateStr, mealRow[0].id);
      }
    }
    console.log(`✓ Seeded ${createdMealMap.size} meals for September 2026.`);

    // 6. Meal Registrations (Status: completed for past, confirmed for today/future, pending for sample approvals)
    console.log('6. Seeding Meal Registrations...');
    let regCount = 0;
    const todayStr = '2026-09-25';

    for (const [dateStr, mealId] of createdMealMap.entries()) {
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;
      const isHoliday = (dateStr === '2026-09-02');

      if (isHoliday) continue;

      for (let i = 0; i < employeeIds.length; i++) {
        const uid = employeeIds[i];

        // Determine status and guests
        let status = 'confirmed';
        let guests = 0;

        if (isPast) {
          // In the past: most completed, a few cancelled
          status = (i % 7 === 0) ? 'cancelled' : 'completed';
          guests = (i % 5 === 0) ? 1 : 0;
        } else if (isToday) {
          // Today: 2 pending requests waiting for manager approval
          if (i === 1 || i === 2) {
            status = 'pending'; // Yêu cầu cắt suất chờ duyệt
            guests = 0;
          } else {
            status = 'confirmed';
            guests = (i === 0) ? 2 : (i === 4 ? 1 : 0); // user1 has 2 guests today!
          }
        } else {
          // Future: confirmed, a few cancelled
          status = (i === 3) ? 'cancelled' : 'confirmed';
          guests = (i % 4 === 0) ? 1 : 0;
        }

        await connection.query(
          `INSERT INTO meal_registration (user_id, meal_id, guest_count, status)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE guest_count = VALUES(guest_count), status = VALUES(status)`,
          [uid, mealId, guests, status]
        );
        regCount++;
      }
    }
    console.log(`✓ Seeded ${regCount} meal registrations with various statuses.`);

    // 7. Meal Options (Cắt suất theo khoảng ngày)
    console.log('7. Seeding Meal Options (Leave/Business Trip requests)...');
    const sampleOptions = [
      { uid: employeeIds[1], type: 'business_trip', from: '2026-09-28', to: '2026-09-30', note: 'Đi công tác chi nhánh Đà Nẵng', status: 'pending' },
      { uid: employeeIds[2], type: 'leave', from: '2026-09-15', to: '2026-09-18', note: 'Nghỉ phép thường niên', status: 'approved' },
      { uid: employeeIds[5], type: 'training', from: '2026-09-10', to: '2026-09-12', note: 'Tập huấn chuyên môn', status: 'rejected' },
    ];

    for (const opt of sampleOptions) {
      await connection.query(
        `INSERT INTO meal_option (user_id, type, from_date, to_date, note, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [opt.uid, opt.type, opt.from, opt.to, opt.note, opt.status]
      );
    }
    console.log(`✓ Seeded ${sampleOptions.length} meal options requests.`);

    // 8. Payments (Hóa đơn thanh toán)
    console.log('8. Seeding Payments (August paid & September unpaid)...');
    
    // August payments (Paid)
    for (const uid of employeeIds) {
      await connection.query(
        `INSERT INTO payment (user_id, payment_date, amount, is_paid, paid_at, paid_amount, status, bill_img)
         VALUES (?, '2026-08-31', 660000.00, 1, '2026-08-30 14:20:00', 660000.00, 'paid', 'https://picsum.photos/400/600')`,
        [uid]
      );
    }

    // September payments (Unpaid / Pending)
    for (const uid of employeeIds) {
      await connection.query(
        `INSERT INTO payment (user_id, payment_date, amount, is_paid, paid_at, paid_amount, status)
         VALUES (?, '2026-09-30', 660000.00, 0, NULL, 0.00, 'unpaid')`,
        [uid]
      );
    }
    console.log(`✓ Seeded ${employeeIds.length * 2} payment records (Tháng 8 đã đóng, Tháng 9 chưa đóng).`);

    // 9. Notifications
    console.log('9. Seeding Notifications...');
    const notifs = [
      {
        title: 'Thực đơn cơm trưa tuần mới (28/09 - 02/10/2026)',
        content: 'Nhà bếp cơ quan xin thông báo thực đơn dinh dưỡng cho tuần tới đã được cập nhật. Cán bộ vui lòng kiểm tra và báo suất đúng giờ quy định (trước 09:00 hàng ngày).',
        url: '',
      },
      {
        title: 'Nhắc nhở quyết toán tiền ăn tháng 09/2026',
        content: 'Khoản tiền ăn tháng 09/2026 đã được lập. Đề nghị cán bộ nhân viên thanh toán qua quét mã QR hoặc nộp thủ công cho bộ phận quản lý trước ngày 10/10.',
        url: '',
      },
      {
        title: 'Lịch nghỉ lễ Quốc khánh 02/09/2026',
        content: 'Nhà bếp tạm ngừng phục vụ suất ăn trong ngày Quốc khánh 02/09/2026. Chúc toàn thể cán bộ công nhân viên có kỳ nghỉ lễ vui vẻ và an toàn.',
        url: '',
      },
    ];

    for (const n of notifs) {
      const [res] = await connection.query(
        'INSERT INTO notification (title, content, url, status) VALUES (?, ?, ?, ?)',
        [n.title, n.content, n.url, 'active']
      );
      const nid = res.insertId;

      // Broadcast to all employees and user1
      for (const uid of employeeIds) {
        await connection.query(
          'INSERT INTO notification_recipient (user_id, notification_id, is_seen) VALUES (?, ?, ?)',
          [uid, nid, 0]
        );
      }
    }
    console.log('✓ Seeded broadcast notifications with unread states.');

    // 10. Audit Logs
    console.log('10. Seeding System Audit Logs...');
    const auditLogs = [
      { action: 'login', target: 'auth:login', result: 'success', detail: 'Quản trị viên đăng nhập hệ thống' },
      { action: 'create_meal', target: 'meal:schedule', result: 'success', detail: 'Tự động tạo lịch bếp tháng 09/2026' },
      { action: 'update_setting', target: 'setting:meal_price', result: 'success', detail: 'Cập nhật giá suất cán bộ: 30000 VNĐ' },
      { action: 'mark_paid', target: 'payment:month_08', result: 'success', detail: 'Xác nhận thu tiền ăn tháng 08/2026' },
    ];

    for (const a of auditLogs) {
      await connection.query(
        `INSERT INTO audit_log (log_actor, log_action, log_target, log_result, log_detail, ip_address, status)
         VALUES (?, ?, ?, ?, ?, '127.0.0.1', ?)`,
        [adminId, a.action, a.target, a.result, a.detail, 'success']
      );
    }
    console.log('✓ Seeded Audit logs.');

    console.log('\n====================================================');
    console.log(' ALL DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    throw err;
  } finally {
    connection.release();
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
