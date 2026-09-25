const ExcelJS = require("exceljs");

/**
 * Tạo và gửi 1 file Excel (.xlsx) về client.
 *
 * @param {import('express').Response} res
 * @param {string} filename - tên file (không cần đuôi .xlsx)
 * @param {string} sheetName - tên sheet
 * @param {{ header: string, key: string, width?: number }[]} columns
 * @param {object[]} rows - dữ liệu, mỗi object có field khớp với `key` của columns
 */
async function sendExcel(res, filename, sheetName, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true };
  rows.forEach((row) => sheet.addRow(row));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.xlsx"`,
  );

  await workbook.xlsx.write(res);
  res.end();
}

module.exports = { sendExcel };
