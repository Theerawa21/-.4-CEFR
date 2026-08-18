const API_URL = 'https://script.google.com/macros/s/AKfycbyWpXSyET8FUWWFxHzrS71hqCjqrNjNRdSGDuBGcvooCc-eAzUuyhjZRF8Wh4EC21eIzw/exec';
const EXAM_URL = 'https://www.oxfordenglishtesting.com';

const form = document.getElementById('lookup-form');
const studentIdInput = document.getElementById('student-id');
const searchButton = document.getElementById('search-button');
const systemMessage = document.getElementById('system-message');
const resultPanel = document.getElementById('result-panel');
const setupPanel = document.getElementById('setup-panel');
const clearButton = document.getElementById('clear-button');
const examLink = document.getElementById('exam-link');
const toast = document.getElementById('toast');

const fields = {
  studentName: document.getElementById('student-name'),
  studentClass: document.getElementById('student-class'),
  studentId: document.getElementById('student-id-result'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  orgId: document.getElementById('org-id'),
  group: document.getElementById('group-id'),
};

let autoClearTimer;

const isConfigured = () =>
  /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(API_URL);

function normalizeStudentId(value) {
  return String(value || '').replace(/\D/g, '').trim();
}

function setMessage(message, type = 'error') {
  systemMessage.textContent = message;
  systemMessage.className = `system-message ${type}`;
  systemMessage.hidden = false;
}

function hideMessage() {
  systemMessage.hidden = true;
  systemMessage.textContent = '';
}

function setLoading(loading) {
  searchButton.disabled = loading;
  searchButton.textContent = loading ? 'กำลังค้นหา...' : 'ค้นหารหัส';
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function clearResult({ focus = false } = {}) {
  window.clearTimeout(autoClearTimer);
  resultPanel.hidden = true;
  hideMessage();

  Object.values(fields).forEach((element) => {
    element.textContent = '-';
  });

  examLink.href = EXAM_URL;

  if (focus) {
    studentIdInput.value = '';
    studentIdInput.focus();
  }
}

function renderResult(data) {
  fields.studentName.textContent = data.name || '-';
  fields.studentClass.textContent = data.className || '-';
  fields.studentId.textContent = data.studentId || '-';
  fields.username.textContent = data.username || '-';
  fields.password.textContent = data.password || '-';
  fields.orgId.textContent = data.orgId || '-';
  fields.group.textContent = data.group || '-';
  examLink.href = data.examUrl || EXAM_URL;

  resultPanel.hidden = false;
  setMessage('พบข้อมูลนักเรียนแล้ว กรุณาตรวจสอบชื่อและชั้นเรียนก่อนนำรหัสไปใช้', 'success');

  window.clearTimeout(autoClearTimer);
  autoClearTimer = window.setTimeout(() => {
    clearResult({ focus: true });
    showToast('ล้างข้อมูลบนหน้าจออัตโนมัติเพื่อความเป็นส่วนตัวแล้ว');
  }, 3 * 60 * 1000);
}

function jsonpRequest(url, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `__cefrCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('หมดเวลาการเชื่อมต่อ กรุณาลองใหม่'));
    }, 12000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    const query = new URLSearchParams({ ...params, callback: callbackName });
    script.src = `${url}${url.includes('?') ? '&' : '?'}${query.toString()}`;
    script.async = true;
    script.onerror = () => {
      cleanup();
      reject(new Error('ไม่สามารถเชื่อมต่อระบบค้นหารหัสได้'));
    };

    document.head.appendChild(script);
  });
}

async function lookupStudent(studentId) {
  if (!isConfigured()) {
    setupPanel.hidden = false;
    throw new Error('ระบบยังไม่ได้เชื่อม Google Apps Script');
  }

  setupPanel.hidden = true;
  return jsonpRequest(API_URL, { id: studentId });
}

async function copyText(targetId) {
  const target = document.getElementById(targetId);
  const value = target?.textContent?.trim();

  if (!value || value === '-') {
    showToast('ยังไม่มีข้อมูลให้คัดลอก');
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const temp = document.createElement('textarea');
    temp.value = value;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    temp.remove();
  }

  showToast(`คัดลอก ${targetId === 'username' ? 'Username' : 'Password'} แล้ว`);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMessage();
  resultPanel.hidden = true;

  const studentId = normalizeStudentId(studentIdInput.value);
  studentIdInput.value = studentId;

  if (!studentId) {
    setMessage('กรุณากรอกเลขประจำตัวนักเรียน');
    studentIdInput.focus();
    return;
  }

  if (studentId.length < 4 || studentId.length > 10) {
    setMessage('รูปแบบเลขประจำตัวนักเรียนไม่ถูกต้อง');
    studentIdInput.focus();
    return;
  }

  setLoading(true);

  try {
    const response = await lookupStudent(studentId);

    if (!response?.ok) {
      throw new Error(response?.message || 'ไม่พบข้อมูลนักเรียน');
    }

    renderResult(response.data);
  } catch (error) {
    clearResult();
    setMessage(error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
  } finally {
    setLoading(false);
  }
});

document.querySelectorAll('[data-copy-target]').forEach((button) => {
  button.addEventListener('click', () => copyText(button.dataset.copyTarget));
});

clearButton.addEventListener('click', () => clearResult({ focus: true }));

studentIdInput.addEventListener('input', () => {
  studentIdInput.value = normalizeStudentId(studentIdInput.value);
});

window.addEventListener('pagehide', () => {
  clearResult();
});

if (!isConfigured()) {
  setupPanel.hidden = false;
}
