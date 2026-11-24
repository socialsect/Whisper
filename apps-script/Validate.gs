/**
 * Pure validation for Whisper submissions. No Apps Script services are used here,
 * so the same file runs unchanged under node (see test.mjs).
 *
 * The question list mirrors src/surveyConfig.js. test.mjs fails if they drift.
 */

var PULSE = [
  { id: 'clarity_of_role', text: 'I know what is expected of me in my role.' },
  { id: 'collaboration_team_flow', text: 'Our team works well together and backs each other up.' },
  { id: 'balance_energy', text: 'I can keep a healthy balance between work and life.' },
  { id: 'leadership_support', text: 'Leadership gives me the support I need to do well.' },
  { id: 'growth_future', text: 'I can see a path to grow at Socialsect.' },
  { id: 'wellbeing_at_work', text: 'Overall, I feel good about being part of this team.' }
];

var TEXT = [
  { id: 'what_works_well', title: 'What is working well right now?' },
  { id: 'what_slowing_down', title: 'What is slowing us down?' },
  { id: 'one_change_tomorrow', title: 'If you could change one thing tomorrow, what would it be?' },
  { id: 'leadership_perspective', title: 'How do you feel about the way Rayansh and Aakash lead?' },
  { id: 'team_perspective', title: 'Anything to share about a teammate?' },
  { id: 'recognition', title: 'Who deserves a shout-out?' },
  { id: 'anything_else', title: 'Anything else leadership should know?' }
];

var MAX_TEXT = 1000;
var MAX_BODY = 40000;
var VERSION_RE = /^\d{1,2}\.\d{1,2}$/;
var TOP_KEYS = ['version', 'pulse', 'text', 'hp'];

function isPlainObject_(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
}

function onlyKeys_(obj, allowed) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    if (allowed.indexOf(keys[i]) === -1) return false;
  }
  return true;
}

function ids_(list) {
  return list.map(function (q) { return q.id; });
}

/**
 * Validate a raw request body.
 * Returns { ok: false, error } to reject, { ok: true, drop: true } for a filled
 * honeypot (accepted silently, never stored), or { ok: true, row } where row is
 * [6 ratings, 7 texts, version] and nothing else.
 */
function validateBody(body) {
  if (typeof body !== 'string' || body.length === 0 || body.length > MAX_BODY) {
    return { ok: false, error: 'invalid' };
  }
  var p;
  try {
    p = JSON.parse(body);
  } catch (err) {
    return { ok: false, error: 'invalid' };
  }
  if (!isPlainObject_(p) || !onlyKeys_(p, TOP_KEYS)) return { ok: false, error: 'invalid' };

  if ('hp' in p) {
    if (typeof p.hp !== 'string') return { ok: false, error: 'invalid' };
    if (p.hp !== '') return { ok: true, drop: true };
  }

  if (typeof p.version !== 'string' || !VERSION_RE.test(p.version)) {
    return { ok: false, error: 'invalid' };
  }

  var pulseIds = ids_(PULSE);
  if (!isPlainObject_(p.pulse)) return { ok: false, error: 'invalid' };
  if (!onlyKeys_(p.pulse, pulseIds) || Object.keys(p.pulse).length !== pulseIds.length) {
    return { ok: false, error: 'invalid' };
  }
  var ratings = [];
  for (var i = 0; i < pulseIds.length; i++) {
    var n = p.pulse[pulseIds[i]];
    if (typeof n !== 'number' || Math.floor(n) !== n || n < 1 || n > 5) {
      return { ok: false, error: 'invalid' };
    }
    ratings.push(n);
  }

  var textIds = ids_(TEXT);
  var text = {};
  if ('text' in p) {
    if (!isPlainObject_(p.text) || !onlyKeys_(p.text, textIds)) return { ok: false, error: 'invalid' };
    text = p.text;
  }
  var texts = [];
  for (var j = 0; j < textIds.length; j++) {
    var v = text[textIds[j]];
    if (v === undefined) {
      texts.push('');
    } else if (typeof v !== 'string' || v.length > MAX_TEXT) {
      return { ok: false, error: 'invalid' };
    } else {
      // eslint-disable-next-line no-control-regex
      texts.push(v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ''));
    }
  }

  return { ok: true, row: ratings.concat(texts, [p.version]) };
}
