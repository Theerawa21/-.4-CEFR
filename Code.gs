const SPREADSHEET_ID = '1nWx67QzADBblnF_hjlO64FYekmMsaLjiaFBBdXXRs30';
const DATA_SHEET_NAME = 'ข้อมูลรหัสสอบ';
const DEFAULT_EXAM_URL = 'https://www.oxfordenglishtesting.com';

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = sanitizeCallback_(params.callback || '');
  const studentId = String(params.id || '').replace(/\D/g, '').trim();

  if (!studentId) {
    return respond_({
      ok: false,
      message: 'กรุณาระบุเลขประจำตัวนักเรียน'
    }, callback);
  }

  if (studentId.length < 4 || studentId.length > 10) {
    return respond_({
      ok: false,
      message: 'รูปแบบเลขประจำตัวนักเรียนไม่ถูกต้อง'
    }, callback);
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(DATA_SHEET_NAME);

    if (!sheet) {
      throw new Error('ไม่พบชีตข้อมูลรหัสสอบ');
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      return respond_({
        ok: false,
        message: 'ยังไม่มีข้อมูลนักเรียนในระบบ'
      }, callback);
    }

    const idRange = sheet.getRange(2, 1, lastRow - 1, 1);
    const foundCell = idRange
      .createTextFinder(studentId)
      .matchEntireCell(true)
      .useRegularExpression(false)
      .findNext();

    if (!foundCell) {
      return respond_({
        ok: false,
        message: 'ไม่พบข้อมูลเลขประจำตัวนักเรียนนี้'
      }, callback);
    }

    const row = sheet.getRange(foundCell.getRow(), 1, 1, 9).getDisplayValues()[0];

    const payload = {
      ok: true,
      data: {
        studentId: row[0] || '',
        name: row[1] || '',
        className: row[2] || '',
        order: row[3] || '',
        group: row[4] || '',
        username: row[5] || '',
        password: row[6] || '',
        orgId: row[7] || '',
        examUrl: row[8] || DEFAULT_EXAM_URL
      }
    };

    return respond_(payload, callback);
  } catch (error) {
    return respond_({
      ok: false,
      message: 'ระบบไม่สามารถค้นหาข้อมูลได้ในขณะนี้'
    }, callback);
  }
}

function respond_(payload, callback) {
  const json = JSON.stringify(payload);

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function sanitizeCallback_(callback) {
  const value = String(callback || '').trim();
  return /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(value) ? value : '';
}
