// Run: npm run test:apps-script
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { PULSE as APP_PULSE, TEXT as APP_TEXT } from '../src/surveyConfig.js';

const ctx = vm.createContext({});
vm.runInContext(readFileSync(new URL('./Validate.gs', import.meta.url), 'utf8'), ctx);
const { PULSE, TEXT } = ctx;
// Results cross a vm realm, so normalize before deepEqual.
const plain = (x) => (x === undefined ? x : JSON.parse(JSON.stringify(x)));
const validateBody = (b) => plain(ctx.validateBody(b));

const pulse = () => Object.fromEntries(APP_PULSE.map((q) => [q.id, 3]));
const send = (obj) => validateBody(JSON.stringify(obj));
const base = () => ({ version: '3.0', pulse: pulse() });

test('question ids and wording match the frontend config', () => {
  assert.deepEqual(plain(PULSE).map((q) => [q.id, q.text]), APP_PULSE.map((q) => [q.id, q.text]));
  assert.deepEqual(plain(TEXT).map((q) => [q.id, q.title]), APP_TEXT.map((q) => [q.id, q.title]));
});

test('valid payload with text yields exactly 14 cells and no extras', () => {
  const r = send({ ...base(), text: { what_works_well: 'Good tools', anything_else: '=SUM(1)' } });
  assert.equal(r.ok, true);
  assert.equal(r.row.length, 14);
  assert.deepEqual(r.row.slice(0, 6), [3, 3, 3, 3, 3, 3]);
  assert.equal(r.row[6], 'Good tools');
  assert.equal(r.row[12], '=SUM(1)');
  assert.equal(r.row[13], '3.0');
});

test('valid payload without text', () => {
  const r = send(base());
  assert.equal(r.ok, true);
  assert.deepEqual(r.row.slice(6, 13), ['', '', '', '', '', '', '']);
});

test('extra top-level field is rejected', () => {
  assert.equal(send({ ...base(), timestamp: '2026-01-01' }).ok, false);
  assert.equal(send({ ...base(), id: 'x' }).ok, false);
});

test('extra pulse or text key is rejected', () => {
  assert.equal(send({ version: '3.0', pulse: { ...pulse(), extra: 3 } }).ok, false);
  assert.equal(send({ ...base(), text: { nope: 'x' } }).ok, false);
});

test('missing rating is rejected', () => {
  const p = pulse();
  delete p.clarity_of_role;
  assert.equal(send({ version: '3.0', pulse: p }).ok, false);
});

test('ratings 0 and 6 are rejected, 1 and 5 pass', () => {
  for (const bad of [0, 6, 2.5, '3', null, -1]) {
    assert.equal(send({ version: '3.0', pulse: { ...pulse(), growth_future: bad } }).ok, false, String(bad));
  }
  for (const good of [1, 5]) {
    assert.equal(send({ version: '3.0', pulse: { ...pulse(), growth_future: good } }).ok, true);
  }
});

test('text of 1000 chars passes, 1001 is rejected', () => {
  assert.equal(send({ ...base(), text: { recognition: 'a'.repeat(1000) } }).ok, true);
  assert.equal(send({ ...base(), text: { recognition: 'a'.repeat(1001) } }).ok, false);
});

test('non-string text is rejected', () => {
  assert.equal(send({ ...base(), text: { recognition: 5 } }).ok, false);
});

test('filled honeypot is dropped silently, empty honeypot is accepted', () => {
  const filled = send({ ...base(), hp: 'http://spam' });
  assert.deepEqual({ ok: filled.ok, drop: filled.drop, row: filled.row }, { ok: true, drop: true, row: undefined });
  const empty = send({ ...base(), hp: '' });
  assert.equal(empty.ok, true);
  assert.equal(empty.row.length, 14);
});

test('bad version and bad JSON are rejected', () => {
  assert.equal(send({ version: 'abc', pulse: pulse() }).ok, false);
  assert.equal(send({ pulse: pulse() }).ok, false);
  assert.equal(validateBody('{nope').ok, false);
  assert.equal(validateBody('').ok, false);
  assert.equal(validateBody('[]').ok, false);
  assert.equal(validateBody('x'.repeat(40001)).ok, false);
});

test('__proto__ key is rejected', () => {
  assert.equal(validateBody('{"version":"3.0","pulse":{},"__proto__":{"a":1}}').ok, false);
});

test('control characters are stripped from text', () => {
  const r = send({ ...base(), text: { recognition: 'a\u0000b\u0007c\nd' } });
  assert.equal(r.row[11], 'abc\nd');
});
