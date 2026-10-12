import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spell, spellToString, ALPHABET } from '../src/spell.js';

test('spells a simple word', () => {
  assert.equal(spellToString('Otto'), 'Otto – Theodor – Theodor – Otto');
});

test('is case-insensitive', () => {
  assert.equal(spellToString('wien'), spellToString('WIEN'));
});

test('handles umlauts and ß', () => {
  assert.equal(spellToString('Größe'), 'Gustav – Richard – Österreich – scharfes S – Emil');
  assert.equal(spellToString('Übel'), 'Übel – Berta – Emil – Ludwig');
});

test('spells Sch and Ch as units by default', () => {
  assert.equal(spellToString('Schach'), 'Schule – Anton – Christine');
});

test('can spell Sch and Ch letter by letter', () => {
  assert.equal(
    spellToString('Sch', { digraphs: false }),
    'Siegfried – Cäsar – Heinrich',
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
  assert.equal(spellToString('é'), 'Emil mit Akzent');
});

test('keeps unknown characters as-is', () => {
  assert.deepEqual(spell('€')[0], { char: '€', word: '€', kind: 'unknown' });
});

test('alphabet covers A–Z', () => {
  const letters = new Set(ALPHABET.map(([l]) => l));
  for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') assert.ok(letters.has(c), c);
});
