// Neue österreichische Buchstabiertabelle (Österreichische Sprachnormenkommission, 2025)
// Quelle: http://oedeutsch.at/OEDTPORTAL/downloads/AT-Buchstabiertabelle%20NEU-2025.pdf
const TABLE_2025 = [
  ['A', 'Anna'],
  ['Ä', 'Ärmel'],
  ['B', 'Bernhard'],
  ['C', 'Cäsar'],
  ['Ch', 'China'],
  ['D', 'David'],
  ['E', 'Emma'],
  ['F', 'Felix'],
  ['G', 'Georg'],
  ['H', 'Hannes'],
  ['I', 'Ida'],
  ['J', 'Jakob'],
  ['K', 'Karin'],
  ['L', 'Leo'],
  ['M', 'Marie'],
  ['N', 'Nora'],
  ['O', 'Otto'],
  ['Ö', 'Österreich'],
  ['P', 'Peter'],
  ['Qu', 'Quelle'],
  ['R', 'Rosa'],
  ['S', 'Sarah'],
  ['Sch', 'Schule'],
  ['ß', 'scharfes S'],
  ['T', 'Tina'],
  ['U', 'Udo'],
  ['Ü', 'Übung'],
  ['V', 'Vera'],
  ['W', 'Walter'],
  ['X', 'Xaver'],
  ['Y', 'Ypsilon'],
  ['Z', 'Zita'],
];

// Alte Tabelle nach ÖNORM A 1081 (1985/2010, 2019 zurückgezogen). „Ch“ hat keinen eigenen Eintrag.
const TABLE_OENORM = [
  ['A', 'Anton'],
  ['Ä', 'Ärger'],
  ['B', 'Berta'],
  ['C', 'Cäsar'],
  ['D', 'Dora'],
  ['E', 'Emil'],
  ['F', 'Friedrich'],
  ['G', 'Gustav'],
  ['H', 'Heinrich'],
  ['I', 'Ida'],
  ['J', 'Julius'],
  ['K', 'Konrad'],
  ['L', 'Ludwig'],
  ['M', 'Martha'],
  ['N', 'Nordpol'],
  ['O', 'Otto'],
  ['Ö', 'Österreich'],
  ['P', 'Paula'],
  ['Qu', 'Quelle'],
  ['R', 'Richard'],
  ['S', 'Siegfried'],
  ['Sch', 'Schule'],
  ['ß', 'scharfes S'],
  ['T', 'Theodor'],
  ['U', 'Ulrich'],
  ['Ü', 'Übel'],
  ['V', 'Viktor'],
  ['W', 'Wilhelm'],
  ['X', 'Xaver'],
  ['Y', 'Ypsilon'],
  ['Z', 'Zürich'],
];

export const TABLES = {
  '2025': { name: 'Neue Tabelle (2025)', entries: TABLE_2025 },
  oenorm: { name: 'ÖNORM A 1081 (alt)', entries: TABLE_OENORM },
};

export const DEFAULT_TABLE = '2025';

// 'ß'.toUpperCase() is 'SS', so ß keeps its own key.
const key = (s) => (s === 'ß' ? s : s.toUpperCase());

const LOOKUPS = Object.fromEntries(
  Object.entries(TABLES).map(([id, { entries }]) => {
    const words = new Map(entries.map(([letter, word]) => [key(letter), word]));
    // Multi-letter units, longest first so "Sch" wins over "Ch".
    const units = entries
      .map(([letter]) => key(letter))
      .filter((k) => k.length > 1)
      .sort((a, b) => b.length - a.length);
    return [id, { words, units }];
  }),
);

const DIGITS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];

const SYMBOLS = {
  ' ': 'Leerzeichen',
  '-': 'Bindestrich',
  '_': 'Unterstrich',
  '.': 'Punkt',
  ',': 'Beistrich',
  '@': 'at (Klammeraffe)',
  '/': 'Schrägstrich',
  '&': 'und',
  '+': 'plus',
  '\'': 'Apostroph',
  ':': 'Doppelpunkt',
  ';': 'Strichpunkt',
  '!': 'Rufzeichen',
  '?': 'Fragezeichen',
  '#': 'Raute',
  '(': 'Klammer auf',
  ')': 'Klammer zu',
};

/**
 * Splits text into spelling tokens.
 * Each token: { char, word, kind } with kind 'letter' | 'digit' | 'symbol' | 'unknown'.
 * With `units` enabled, multi-letter entries of the table (Ch, Qu, Sch) are spelled as one.
 */
export function spell(text, { table = DEFAULT_TABLE, units = true } = {}) {
  const lookup = LOOKUPS[table];
  if (!lookup) throw new Error(`Unknown table: ${table}`);
  const chars = Array.from(text.normalize('NFC'));
  const tokens = [];

  for (let i = 0; i < chars.length; i++) {
    const unit = units && lookup.units.find(
      (u) => chars.slice(i, i + u.length).join('').toUpperCase() === u,
    );
    if (unit) {
      tokens.push({ char: chars.slice(i, i + unit.length).join(''), word: lookup.words.get(unit), kind: 'letter' });
      i += unit.length - 1;
      continue;
    }
    tokens.push(spellChar(chars[i], lookup.words));
  }
  return tokens;
}

function spellChar(char, words) {
  if (char === 'ß' || char === 'ẞ') return { char, word: words.get('ß'), kind: 'letter' };

  const upper = char.toUpperCase();
  if (words.has(upper)) return { char, word: words.get(upper), kind: 'letter' };

  // Q alone (e.g. when units are off) falls back to the "Qu" word.
  if (upper === 'Q') return { char, word: words.get('QU'), kind: 'letter' };

  // Letters with other diacritics (é, à, č, …): spell the base letter and name the accent.
  const base = upper.normalize('NFD').replace(/\p{M}/gu, '');
  if (base !== upper && words.has(base)) {
    return { char, word: `${words.get(base)} mit Akzent`, kind: 'letter' };
  }

  if (/^[0-9]$/.test(char)) return { char, word: DIGITS[Number(char)], kind: 'digit' };
  if (/^\s$/.test(char)) return { char, word: SYMBOLS[' '], kind: 'symbol' };
  if (char in SYMBOLS) return { char, word: SYMBOLS[char], kind: 'symbol' };
  return { char, word: char, kind: 'unknown' };
}

/** One-line spoken form, e.g. "Otto – Tina – Tina – Otto". */
export function spellToString(text, options) {
  return spell(text, options).map((t) => t.word).join(' – ');
}
