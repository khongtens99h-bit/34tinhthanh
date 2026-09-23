/**
 * VN/34 ORDER RECEIVER
 *
 * 1. Tạo một Google Sheet để quản lý đơn.
 * 2. Trong Sheet, vào Extensions > Apps Script; dán toàn bộ tệp này vào Code.gs.
 * 3. Thay NOTIFICATION_EMAIL bằng email nhận thông báo của bạn.
 * 4. Deploy > New deployment > Web app. Chọn: Execute as Me; Who has access: Anyone.
 * 5. Dán URL Web app vào ORDER_WEBHOOK_URL trong app.js.
 */
// Để trống nếu không muốn nhận email thông báo; nếu có, dùng một địa chỉ email hợp lệ.
const NOTIFICATION_EMAIL = 'dnymarketing1708@gmail.com';
const DRIVE_FOLDER_NAME = 'VN34 - Mau ao khach hang';
const SPREADSHEET_ID = '1TE5GsGGBtXlLJW4mwc2Z4UmdbqRqjTqtOxkt9n6QaF8';

function doPost(event) {
  const data = JSON.parse(event.postData.contents);
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  ensureHeaders_(sheet);
  const folder = getOrCreateFolder_();
  const orderFolder = folder.createFolder(data.orderReference);
  const frontUrl = savePreview_(orderFolder, data.previews.front, 'mat-truoc.png');
  const backUrl = savePreview_(orderFolder, data.previews.back, 'mat-sau.png');
  const shortsUrl = savePreview_(orderFolder, data.previews.shorts, 'quan.png');
  const design = data.design || {};
  const customer = data.customer || {};
  sheet.appendRow([
    new Date(), data.orderReference, 'Mới', customer.fullName || '', customer.phone || '', customer.address || '',
    design.province || '', design.printName || '', design.printNumber || '', frontUrl, backUrl, shortsUrl,
    JSON.stringify(design.printPositions || {}), JSON.stringify(design.logos || {})
  ]);
  if (NOTIFICATION_EMAIL) {
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: `[VN/34] Đơn mới ${data.orderReference}`,
      htmlBody: `<p>Có mẫu áo mới cần xác nhận.</p><p><b>Khách:</b> ${escapeHtml_(customer.fullName)} — ${escapeHtml_(customer.phone)}<br><b>Mẫu:</b> ${escapeHtml_(design.province)}<br><b>In áo:</b> ${escapeHtml_(design.printName)} / ${escapeHtml_(design.printNumber)}</p><p><a href="${frontUrl}">Mặt trước</a> · <a href="${backUrl}">Mặt sau</a> · <a href="${shortsUrl}">Quần</a></p>`
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, orderReference: data.orderReference })).setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow()) return;
  sheet.appendRow(['Thời gian', 'Mã đơn', 'Trạng thái', 'Họ tên', 'Số điện thoại', 'Địa chỉ', 'Tỉnh / mẫu', 'Tên in', 'Số áo', 'Mặt trước', 'Mặt sau', 'Quần', 'Vị trí in', 'Logo']);
  sheet.setFrozenRows(1);
}

function getOrCreateFolder_() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function savePreview_(folder, dataUrl, fileName) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) throw new Error('Ảnh mẫu không đúng định dạng.');
  const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(match[2]), match[1], fileName));
  return file.getUrl();
}

function escapeHtml_(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}
