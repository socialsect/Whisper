/**
 * Whisper intake and batch release. See README.md in this folder.
 *
 * doPost  : validate, append one row to the private Inbox. No time, no ID.
 * flush_  : when Inbox holds at least K rows, merge them into Responses,
 *           reshuffle the WHOLE Responses sheet, clear the Inbox.
 * There is no timer fallback below K. A lone response is never released.
 *
 * Never log request contents. Never call Session.getActiveUser / getEffectiveUser.
 */

var SHEET_INBOX = 'Inbox';
var SHEET_RESPONSES = 'Responses';
var SHEET_SUMMARY = 'Summary';
var DEFAULT_K = 5;
var MIN_K = 3;
var DEFAULT_DAILY_CAP = 300;
var MIN_DELAY_MIN = 60;
var MAX_DELAY_MIN = 360;

// ---------- web app ----------

function doGet() {
  return json_({ ok: true });
}

function doPost(e) {
  var v = validateBody(e && e.postData ? e.postData.contents : '');
  if (!v.ok) return json_({ ok: false, error: v.error });
  if (v.drop) return json_({ ok: true }); // honeypot: pretend success, store nothing

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return json_({ ok: false, error: 'busy' });
  try {
    if (!takeCapSlot_()) return json_({ ok: false, error: 'full' });
    var sheet = sheet_('INBOX_ID', SHEET_INBOX);
    writeRows_(sheet, sheet.getLastRow() + 1, [v.row]);
  } catch (err) {
    return json_({ ok: false, error: 'server' });
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Global cap on rows accepted per UTC day. Kept in cache (max 6h life), so no
// date is ever persisted. Best effort: an evicted cache only loosens the cap.
function takeCapSlot_() {
  var cap = parseInt(prop_('DAILY_CAP', DEFAULT_DAILY_CAP), 10) || DEFAULT_DAILY_CAP;
  var cache = CacheService.getScriptCache();
  var key = 'cap-' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');
  var n = parseInt(cache.get(key) || '0', 10);
  if (n >= cap) return false;
  cache.put(key, String(n + 1), 21600);
  return true;
}

// ---------- flush ----------

function threshold_() {
  var k = parseInt(prop_('K', DEFAULT_K), 10);
  return k >= MIN_K ? k : DEFAULT_K;
}

/** Returns 'busy', 'waiting' (below K) or 'flushed'. */
function flush_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return 'busy';
  try {
    var inbox = sheet_('INBOX_ID', SHEET_INBOX);
    var pending = inbox.getLastRow() - 1;
    if (pending < threshold_()) return 'waiting';

    var incoming = inbox.getRange(2, 1, pending, cols_()).getValues();
    var responses = sheet_('RESPONSES_ID', SHEET_RESPONSES);
    var existingCount = responses.getLastRow() - 1;
    var existing = existingCount > 0 ? responses.getRange(2, 1, existingCount, cols_()).getValues() : [];

    // Reshuffle everything, so neither row order nor batch order shows arrival order.
    var all = shuffle_(existing.concat(incoming));
    writeRows_(responses, 2, all);
    inbox.getRange(2, 1, pending, cols_()).clearContent();
    return 'flushed';
  } finally {
    lock.releaseLock();
  }
}

// Text columns are plain text so a response like "=IMPORTXML(...)" can never run as a formula.
function writeRows_(sheet, startRow, rows) {
  var needed = startRow + rows.length - 1;
  if (sheet.getMaxRows() < needed) sheet.insertRowsAfter(sheet.getMaxRows(), needed - sheet.getMaxRows());
  sheet.getRange(startRow, textFirstCol_(), rows.length, TEXT.length).setNumberFormat('@');
  sheet.getRange(startRow, 1, rows.length, cols_()).setValues(rows);
}

function shuffle_(rows) {
  for (var i = rows.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = rows[i];
    rows[i] = rows[j];
    rows[j] = t;
  }
  return rows;
}

// Trigger handler. Each run schedules the next one at a random delay, so batch
// times follow no pattern.
function flushTick() {
  try {
    flush_();
  } finally {
    scheduleNext_();
  }
}

function scheduleNext_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'flushTick') ScriptApp.deleteTrigger(t);
  });
  var minutes = MIN_DELAY_MIN + Math.floor(Math.random() * (MAX_DELAY_MIN - MIN_DELAY_MIN + 1));
  ScriptApp.newTrigger('flushTick').timeBased().after(minutes * 60 * 1000).create();
}

/** Manual flush. Refuses below K, exactly like the trigger. */
function flushNow() {
  var result = flush_();
  if (result === 'waiting') throw new Error('Refused: fewer than K responses are pending.');
  if (result === 'busy') throw new Error('Busy. Try again.');
}

// ---------- setup ----------

/** Run once from the editor (and again to re-arm the trigger). Safe to repeat. */
function setup() {
  var headers = ids_(PULSE).concat(ids_(TEXT), ['version']);

  var inbox = sheet_('INBOX_ID', SHEET_INBOX, true);
  prepare_(inbox, headers);

  var responses = sheet_('RESPONSES_ID', SHEET_RESPONSES, true);
  prepare_(responses, headers);
  buildSummary_(responses.getParent());

  scheduleNext_();
}

function prepare_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.getRange(2, textFirstCol_(), sheet.getMaxRows() - 1, TEXT.length).setNumberFormat('@');
}

function buildSummary_(ss) {
  var s = ss.getSheetByName(SHEET_SUMMARY) || ss.insertSheet(SHEET_SUMMARY);
  s.clear();
  s.getCharts().forEach(function (c) { s.removeChart(c); });

  var R = SHEET_RESPONSES;
  s.getRange('A1').setValue('Whisper summary').setFontSize(16).setFontWeight('bold');
  s.getRange('A3').setValue('Responses');
  s.getRange('B3').setFormula('=COUNT(' + R + '!A2:A)');
  s.getRange('A5:G5').setValues([['Question', 'Average (1 to 5)', 'Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5']]).setFontWeight('bold');

  PULSE.forEach(function (q, i) {
    var row = 6 + i;
    var col = colLetter_(i + 1);
    var rng = R + '!' + col + '2:' + col;
    var f = [['=IF($B$3=0,"",ROUND(AVERAGE(' + rng + '),2))']];
    for (var score = 1; score <= 5; score++) f[0].push('=COUNTIF(' + rng + ',' + score + ')');
    s.getRange(row, 1).setValue(q.text);
    s.getRange(row, 2, 1, 6).setFormulas(f);
  });

  s.getRange('A31').setValue('Written answers, grouped by question').setFontWeight('bold');
  TEXT.forEach(function (q, i) {
    var col = colLetter_(textFirstCol_() + i);
    var rng = R + '!' + col + '2:' + col;
    s.getRange(32, i + 1).setValue(q.title).setFontWeight('bold').setWrap(true);
    s.getRange(33, i + 1).setFormula('=IFERROR(FILTER(' + rng + ',' + rng + '<>""),"No answers yet")');
  });
  s.getRange(33, 1, 1, TEXT.length).setWrap(true).setVerticalAlignment('top');

  s.setColumnWidth(1, 340);
  s.setColumnWidths(2, 6, 260);

  s.insertChart(
    s.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(s.getRange('A5:B11'))
      .setNumHeaders(1)
      .setPosition(13, 1, 0, 0)
      .setOption('title', 'Average rating per question')
      .setOption('legend', { position: 'none' })
      .setOption('hAxis', { minValue: 0, maxValue: 5 })
      .setOption('width', 560)
      .setOption('height', 340)
      .build()
  );
  s.insertChart(
    s.newChart()
      .setChartType(Charts.ChartType.BAR)
      .addRange(s.getRange('A5:A11'))
      .addRange(s.getRange('C5:G11'))
      .setNumHeaders(1)
      .setOption('isStacked', true)
      .setPosition(13, 4, 0, 0)
      .setOption('title', 'Rating distribution')
      .setOption('width', 560)
      .setOption('height', 340)
      .build()
  );
}

// ---------- helpers ----------

function prop_(name, fallback) {
  var v = PropertiesService.getScriptProperties().getProperty(name);
  return v ? v : fallback;
}

function sheet_(idProp, name, createIfMissing) {
  var id = prop_(idProp, '');
  if (!id) throw new Error('Missing script property ' + idProp);
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName(name);
  if (!sheet && createIfMissing) {
    var first = ss.getSheets()[0];
    sheet = first.getLastRow() === 0 && first.getName() !== SHEET_SUMMARY ? first.setName(name) : ss.insertSheet(name);
  }
  if (!sheet) throw new Error('Missing sheet ' + name);
  return sheet;
}

function colLetter_(n) {
  return String.fromCharCode(64 + n);
}

// Computed lazily: Apps Script may load Code.gs before Validate.gs, so PULSE/TEXT
// must not be read at the top level.
function textFirstCol_() {
  return PULSE.length + 1;
}

function cols_() {
  return PULSE.length + TEXT.length + 1;
}
