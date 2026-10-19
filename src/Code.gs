/**
 * Industrial Maintenance Request & Work Order Management System
 * Backend — Google Apps Script
 *
 * NOTE: This is a prototype. It is NOT deployed or connected to any
 * live spreadsheet until YOU run setup() and deploy it.
 */

const CONFIG = {
  SPREADSHEET_ID: '', // set after setup(), or leave blank to auto-create
  SHEETS: {
    REQUESTS: 'Requests',
    USERS: 'Users',
    EQUIPMENT: 'Equipment',
    AUDIT: 'AuditLog'
  },
  DRIVE_FOLDER_NAME: 'MaintenancePhotos',
  ROLES: { ADMIN: 'admin', SUPERVISOR: 'supervisor', TECHNICIAN: 'technician', REQUESTER: 'requester' }
};

const REQUEST_HEADERS = [
  'WorkOrderID','Timestamp','RequesterEmail','RequesterName','Department',
  'EquipmentName','Location','Category','Priority','Description',
  'Status','AssignedTechnician','StartTime','CompletionTime',
  'ActionTaken','Remarks','BeforePhotoURL','AfterPhotoURL','Shift','DueDate'
];

const USER_HEADERS = ['Email','Name','Role','Department','Active'];
const EQUIPMENT_HEADERS = ['EquipmentID','Name','Location','Department','Category','Status'];
const AUDIT_HEADERS = ['Timestamp','User','Action','WorkOrderID','Details'];

/* ============ SETUP ============ */
function setup() {
  let ss;
  if (CONFIG.SPREADSHEET_ID) {
    ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  } else {
    ss = SpreadsheetApp.create('Industrial Maintenance System');
    const props = PropertiesService.getScriptProperties();
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  ensureSheet_(ss, CONFIG.SHEETS.REQUESTS, REQUEST_HEADERS);
  ensureSheet_(ss, CONFIG.SHEETS.USERS, USER_HEADERS);
  ensureSheet_(ss, CONFIG.SHEETS.EQUIPMENT, EQUIPMENT_HEADERS);
  ensureSheet_(ss, CONFIG.SHEETS.AUDIT, AUDIT_HEADERS);

  const users = ss.getSheetByName(CONFIG.SHEETS.USERS);
  if (users.getLastRow() === 1) {
    users.appendRow([Session.getActiveUser().getEmail(), 'Admin', CONFIG.ROLES.ADMIN, 'Maintenance', true]);
  }
  getOrCreateFolder_(CONFIG.DRIVE_FOLDER_NAME);
  return ss.getUrl();
}

function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#1f4e78').setFontColor('#fff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function getSS_() {
  const id = CONFIG.SPREADSHEET_ID || PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('Run setup() first.');
  return SpreadsheetApp.openById(id);
}

function getOrCreateFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

/* ============ WEB APP ENTRY ============ */
function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Industrial Maintenance System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/* ============ USER / ROLE ============ */
function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  const sh = getSS_().getSheetByName(CONFIG.SHEETS.USERS);
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === email.toLowerCase() && rows[i][4]) {
      return { email, name: rows[i][1], role: rows[i][2], department: rows[i][3] };
    }
  }
  return { email, name: email.split('@')[0], role: CONFIG.ROLES.REQUESTER, department: '' };
}

function requireRole_(allowed) {
  const u = getCurrentUser();
  if (!allowed.includes(u.role)) throw new Error('Permission denied for role: ' + u.role);
  return u;
}

/* ============ REQUESTS ============ */
function generateWorkOrderId_() {
  const d = new Date();
  const ymd = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyyMMdd');
  const sh = getSS_().getSheetByName(CONFIG.SHEETS.REQUESTS);
  const count = Math.max(0, sh.getLastRow() - 1) + 1;
  return 'WO-' + ymd + '-' + String(count).padStart(4, '0');
}

function submitRequest(payload) {
  const user = getCurrentUser();
  if (!payload.equipmentName || !payload.description || !payload.category) {
    throw new Error('Missing required fields.');
  }
  const sh = getSS_().getSheetByName(CONFIG.SHEETS.REQUESTS);
  const id = generateWorkOrderId_();
  const now = new Date();
  const dueDate = new Date(now.getTime() + priorityHours_(payload.priority) * 3600 * 1000);
  const row = [
    id, now, user.email, payload.requesterName || user.name, payload.department || user.department,
    payload.equipmentName, payload.location || '', payload.category, payload.priority || 'Medium',
    payload.description, 'Open', '', '', '', '', '', '', '',
    payload.shift || currentShift_(), dueDate
  ];
  sh.appendRow(row);
  audit_(user.email, 'CREATE', id, payload.category + '/' + payload.priority);
  return { workOrderId: id, dueDate };
}

function priorityHours_(p) {
  return ({ Critical: 4, High: 12, Medium: 48, Low: 120 })[p] || 48;
}

function currentShift_() {
  const h = new Date().getHours();
  return h >= 6 && h < 14 ? 'Morning' : h >= 14 && h < 22 ? 'Afternoon' : 'Night';
}

function listRequests(filter) {
  const sh = getSS_().getSheetByName(CONFIG.SHEETS.REQUESTS);
  const rows = sh.getDataRange().getValues();
  const headers = rows.shift();
  const user = getCurrentUser();
  return rows
    .filter(r => {
      if (user.role === CONFIG.ROLES.REQUESTER && r[2] !== user.email) return false;
      if (user.role === CONFIG.ROLES.TECHNICIAN && r[11] && r[11] !== user.email) return false;
      if (filter?.status && r[10] !== filter.status) return false;
      if (filter?.category && r[7] !== filter.category) return false;
      if (filter?.q) {
        const q = filter.q.toLowerCase();
        if (!r.join(' ').toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

function assignTechnician(workOrderId, techEmail) {
  requireRole_([CONFIG.ROLES.ADMIN, CONFIG.ROLES.SUPERVISOR]);
  updateRequestField_(workOrderId, 'AssignedTechnician', techEmail);
  updateRequestField_(workOrderId, 'Status', 'Assigned');
  audit_(Session.getActiveUser().getEmail(), 'ASSIGN', workOrderId, techEmail);
}

function startWork(workOrderId) {
  updateRequestField_(workOrderId, 'Status', 'In Progress');
  updateRequestField_(workOrderId, 'StartTime', new Date());
  audit_(Session.getActiveUser().getEmail(), 'START', workOrderId, '');
}

function completeWork(workOrderId, actionTaken, remarks, beforeUrl, afterUrl) {
  updateRequestField_(workOrderId, 'Status', 'Completed');
  updateRequestField_(workOrderId, 'CompletionTime', new Date());
  updateRequestField_(workOrderId, 'ActionTaken', actionTaken || '');
  updateRequestField_(workOrderId, 'Remarks', remarks || '');
  if (beforeUrl) updateRequestField_(workOrderId, 'BeforePhotoURL', beforeUrl);
  if (afterUrl) updateRequestField_(workOrderId, 'AfterPhotoURL', afterUrl);
  audit_(Session.getActiveUser().getEmail(), 'COMPLETE', workOrderId, '');
}

function updateRequestField_(id, header, value) {
  const sh = getSS_().getSheetByName(CONFIG.SHEETS.REQUESTS);
  const rows = sh.getDataRange().getValues();
  const col = REQUEST_HEADERS.indexOf(header) + 1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) { sh.getRange(i + 1, col).setValue(value); return; }
  }
  throw new Error('Work order not found: ' + id);
}

/* ============ PHOTOS ============ */
function uploadPhoto(workOrderId, base64Data, mimeType, label) {
  const folder = getOrCreateFolder_(CONFIG.DRIVE_FOLDER_NAME);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, `${workOrderId}_${label}_${Date.now()}`);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

/* ============ DASHBOARD ============ */
function getDashboard() {
  const all = listRequests({});
  const now = new Date();
  return {
    open: all.filter(r => r.Status === 'Open').length,
    assigned: all.filter(r => r.Status === 'Assigned').length,
    inProgress: all.filter(r => r.Status === 'In Progress').length,
    completed: all.filter(r => r.Status === 'Completed').length,
    overdue: all.filter(r => r.Status !== 'Completed' && r.DueDate && new Date(r.DueDate) < now).length,
    byCategory: countBy_(all, 'Category'),
    byPriority: countBy_(all, 'Priority'),
    recurring: findRecurring_(all)
  };
}

function countBy_(arr, key) {
  return arr.reduce((m, r) => (m[r[key]] = (m[r[key]] || 0) + 1, m), {});
}

function findRecurring_(arr) {
  const m = {};
  arr.forEach(r => { if (r.EquipmentName) m[r.EquipmentName] = (m[r.EquipmentName] || 0) + 1; });
  return Object.entries(m).filter(([, c]) => c >= 3).map(([eq, c]) => ({ equipment: eq, count: c }));
}

/* ============ AUDIT ============ */
function audit_(user, action, woId, details) {
  getSS_().getSheetByName(CONFIG.SHEETS.AUDIT)
    .appendRow([new Date(), user, action, woId, details]);
}
