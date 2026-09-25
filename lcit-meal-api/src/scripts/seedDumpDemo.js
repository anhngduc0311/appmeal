const bcrypt = require("bcrypt");
const crypto = require("crypto");
const XLSX = require("xlsx");
const path = require("path");
const pool = require("../config/database");
const { runAutoSchedule } = require("../jobs/autoScheduleJob");

const NAMES = [
  "Kim Mạnh Cường",
  "Vũ Lê Duy",
  "Trần Duy Khánh",
  "Bùi Minh Hiệp",
  "Đinh Thị Hằng",
  "Đinh Thị Hải",
  "Tô Ngọc Anh",
  "Dương Quang Huy",
  "Nguyễn Thế Hùng",
  "Hoàng Minh Tuân",
  "Đàm Phan Hạnh",
  "Trần Minh Đức",
  "Hoàng Đức Thắng",
  "Đỗ Hồng Quân",
  "Nông Lâm Hiếu",
  "Phạm Trung Nghĩa",
  "Đỗ Minh Ngọc",
  "Nguyễn Thắng Nghĩa",
  "Nguyễn Hải Vinh",
  "Hoàng Văn Quang",
  "Vũ Đức Hiếu",
  "Nguyễn Đức Trọng",
  "Nguyễn Việt Hà",
  "Lê Duy Long",
  "Nguyễn Tiến Đạt",
  "Nguyễn Thành Long",
  "Nguyễn Quang Việt",
  "Trịnh Đức Thọ",
  "Bùi Thị Hương Giang",
  "Nguyễn Linh Giang",
  "Nguyễn Công Tuấn Dũng",
  "Phạm Văn Trường",
  "Đoàn Thu Thủy",
  "Hà Thị Xuân Thủy",
  "Tường T. Lan Hương",
  "Hà Tuyết Nhung",
  "Trần Thị Hương",
  "Hồ Minh Hiền",
  "Trần Đình Hiếu",
  "Trần Xuân Phong",
  "Đặng Quyết Thắng",
  "Khổng Văn Thắng",
  "Lê Anh Tuấn",
  "Phan Tiến Dũng",
  "Phạm Hoàng Cường",
  "Đặng Thị Bảy",
  "Nguyễn Thị Thảo",
  "Nguyễn Thị Minh Phương",
];

const DUMP_FILE = path.join(
  __dirname,
  "../../dump_data/meal-registration-example.xlsx",
);

const removeMarks = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d");
const usernameBase = (fullName) => {
  const words = removeMarks(fullName).toLowerCase().split(/\s+/);
  const given = words[words.length - 1];
  const initials = words
    .slice(0, -1)
    .map((word) => word[0])
    .join("");
  return `${given}${initials}`;
};

const getOrCreateUser = async (connection, fullName, roleId) => {
  const base = usernameBase(fullName);
  let username = base;
  let suffix = 1;
  while (true) {
    const [rows] = await connection.query(
      "SELECT id FROM user WHERE username = ? LIMIT 1",
      [username],
    );
    if (!rows.length) break;
    suffix += 1;
    username = `${base}${suffix}`;
  }

  const [existing] = await connection.query(
    "SELECT id FROM user WHERE full_name = ? LIMIT 1",
    [fullName],
  );
  if (existing.length) return { id: existing[0].id, username };

  const passwordHash = await bcrypt.hash("123456", 10);
  const authKey = crypto.randomBytes(16).toString("hex");
  const [result] = await connection.query(
    `INSERT INTO user (full_name, username, password_hash, auth_key, status, created_at)
     VALUES (?, ?, ?, ?, '1', NOW())`,
    [fullName, username, passwordHash, authKey],
  );
  await connection.query(
    `INSERT IGNORE INTO user_role (user_id, role_id, status, created_at) VALUES (?, ?, 'active', NOW())`,
    [result.insertId, roleId],
  );
  return { id: result.insertId, username };
};

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [roles] = await connection.query(
      "SELECT id FROM role WHERE code = 'employee' LIMIT 1",
    );
    if (!roles.length) throw new Error("Không tìm thấy role employee");

    const users = [];
    for (const name of NAMES)
      users.push(await getOrCreateUser(connection, name, roles[0].id));

    const mealIds = new Map();
    for (let day = 1; day <= 31; day += 1) {
      const date = `2026-08-${String(day).padStart(2, "0")}`;
      const [mealResult] = await connection.query(
        `INSERT IGNORE INTO meal (meal_date, is_cancelled, status, created_at) VALUES (?, 0, 'active', NOW())`,
        [date],
      );
      const [mealRows] = await connection.query(
        "SELECT id FROM meal WHERE meal_date = ?",
        [date],
      );
      mealIds.set(day, mealRows[0].id);
    }

    const workbook = XLSX.readFile(DUMP_FILE);
    const sheet = workbook.Sheets["Sheet chấm cơm TTCNTT"];
    const sourceRows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
    });
    const sourceNames = sourceRows[2]
      .slice(1, 1 + NAMES.length)
      .map((name) => String(name || "").trim());
    const userByName = new Map();
    for (const name of NAMES) {
      const [rows] = await connection.query(
        "SELECT id FROM user WHERE full_name = ? LIMIT 1",
        [name],
      );
      if (rows.length) userByName.set(name, rows[0].id);
    }

    let importedRegistrations = 0;
    for (const row of sourceRows.slice(6)) {
      const match = String(row[0] || "").match(/, (\d{2})\/\d{2}\/\d{4}/);
      if (!match) continue;
      const day = Number(match[1]);
      const mealId = mealIds.get(day);
      if (!mealId) continue;
      for (let index = 0; index < sourceNames.length; index += 1) {
        if (row[index + 1] !== true) continue;
        const userId = userByName.get(sourceNames[index]);
        if (!userId) continue;
        const [result] = await connection.query(
          `INSERT IGNORE INTO meal_registration (user_id, meal_id, guest_count, status, created_at)
           VALUES (?, ?, 0, 'confirmed', NOW())`,
          [userId, mealId],
        );
        importedRegistrations += result.affectedRows;
      }
    }

    const optionUsers = users.slice(0, 3);
    await connection.query(
      `INSERT INTO meal_option (user_id, type, from_date, to_date, note, status, created_at)
       VALUES (?, 'cancel_schedule', '2026-08-10', '2026-08-12', 'Demo nghỉ phép tháng 8', 'approved', NOW()),
              (?, 'cancel_today', '2026-09-03', '2026-09-03', 'Demo cắt suất một ngày', 'approved', NOW()),
              (?, 'cancel_permanent', '2026-09-20', '9999-12-31', 'Demo cắt suất từ ngày 20/09', 'approved', NOW())`,
      [optionUsers[0].id, optionUsers[1].id, optionUsers[2].id],
    );

    await connection.commit();
    console.log(
      `Đã seed ${users.length} người dùng, 31 meal và ${importedRegistrations} registration tháng 08/2026.`,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  const result = await runAutoSchedule("2026-09");
  console.log("Kết quả tạo lịch tháng 09/2026:", result);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => setTimeout(() => pool.end(), 200));
