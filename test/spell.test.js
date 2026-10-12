import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spell, spellToString, TABLES } from '../src/spell.js';

const oenorm = { table: 'oenorm' };

test('uses the 2025 table by default', () => {
  assert.equal(spellToString('Otto'), 'Otto – Tina – Tina – Otto');
  assert.equal(spellToString('Graz'), 'Georg – Rosa – Anna – Zita');
});

test('can use the old ÖNORM A 1081 table', () => {
  assert.equal(spellToString('Graz', oenorm), 'Gustav – Richard – Anton – Zürich');
});

test('is case-insensitive', () => {
  assert.equal(spellToString('wien'), spellToString('WIEN'));
});

test('handles umlauts and ß', () => {
  assert.equal(spellToString('Größe'), 'Georg – Rosa – Österreich – scharfes S – Emma');
  assert.equal(spellToString('Übel', oenorm), 'Übel – Berta – Emil – Ludwig');
});

test('spells Sch, Ch and Qu as units in the 2025 table', () => {
  assert.equal(spellToString('Schach'), 'Schule – Anna – China');
  assert.equal(spellToString('Quiz'), 'Quelle – Ida – Zita');
});

test('old table has no Ch unit, so Ch is spelled letter by letter', () => {
  assert.equal(spellToString('Bach', oenorm), 'Berta – Anton – Cäsar – Heinrich');
  assert.equal(spellToString('Schach', oenorm), 'Schule – Anton – Cäsar – Heinrich');
});

test('can spell units letter by letter', () => {
  assert.equal(
    spellToString('Schqu', { units: false }),
    'Sarah – Cäsar – Hannes – Quelle – Udo',
  );
});

test('spells digits, spaces and symbols', () => {
  const tokens = spell('A1 b-c');
  assert.deepEqual(
    tokens.map((t) => t.kind),
    ['letter', 'digit', 'symbol', 'letter', 'symbol', 'letter'],
  );
  assert.equal(tokens[1].word, 'eins');
  assert.equal(tokens[2].word, 'Leerzeichen');
  assert.equal(tokens[4].word, 'Bindestrich');
});

test('falls back to base letter for other accents', () => {
  assert.equal(spellToString('é'), 'Emma mit Akzent');
});

test('keeps unknown characters as-is', () => {
  assert.deepEqual(spell('€')[0], { char: '€', word: '€', kind: 'unknown' });
});

test('every table covers A–Z', () => {
  for (const table of Object.keys(TABLES)) {
    for (const t of spell('ABCDEFGHIJKLMNOPQRSTUVWXYZ', { table, units: false })) {
      assert.equal(t.kind, 'letter', `${table}: ${t.char}`);
    }
  }
});
