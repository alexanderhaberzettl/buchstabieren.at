// Österreichische Buchstabiertafel (ÖNORM A 1081)
export const ALPHABET = [
  ['A', 'Anton'],
  ['Ä', 'Ärger'],
  ['B', 'Berta'],
  ['C', 'Cäsar'],
  ['Ch', 'Christine'],
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
  ['Q', 'Quelle'],
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

// 'ß'.toUpperCase() is 'SS', so ß keeps its own key.
const WORDS = new Map(ALPHABET.map(([letter, word]) => [letter === 'ß' ? letter : letter.toUpperCase(), word]));

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
 * With `digraphs` enabled, "Ch" and "Sch" are spelled as one unit (Christine, Schule).
 */
export function spell(text, { digraphs = true } = {}) {
  const chars = Array.from(text.normalize('NFC'));
  const tokens = [];

  for (let i = 0; i < chars.length; i++) {
    if (digraphs) {
      const three = chars.slice(i, i + 3).join('');
      const two = chars.slice(i, i + 2).join('');
      if (three.toUpperCase() === 'SCH') {
        tokens.push({ char: three, word: WORDS.get('SCH'), kind: 'letter' });
        i += 2;
        continue;
      }
      if (two.toUpperCase() === 'CH') {
        tokens.push({ char: two, word: WORDS.get('CH'), kind: 'letter' });
        i += 1;
        continue;
      }
    }
    tokens.push(spellChar(chars[i]));
  }
  return tokens;
}

function spellChar(char) {
  if (char === 'ß' || char === 'ẞ') return { char, word: WORDS.get('ß'), kind: 'letter' };

  const upper = char.toUpperCase();
  if (WORDS.has(upper)) return { char, word: WORDS.get(upper), kind: 'letter' };

  // Letters with other diacritics (é, à, č, …): spell the base letter and name the accent.
  const base = upper.normalize('NFD').replace(/\p{M}/gu, '');
  if (base !== upper && WORDS.has(base)) {
    return { char, word: `${WORDS.get(base)} mit Akzent`, kind: 'letter' };
  }

  if (/^[0-9]$/.test(char)) return { char, word: DIGITS[Number(char)], kind: 'digit' };
  if (/^\s$/.test(char)) return { char, word: SYMBOLS[' '], kind: 'symbol' };
  if (char in SYMBOLS) return { char, word: SYMBOLS[char], kind: 'symbol' };
  return { char, word: char, kind: 'unknown' };
}

/** One-line spoken form, e.g. "Otto – Theodor – Theodor – Otto". */
export function spellToString(text, options) {
  return spell(text, options).map((t) => t.word).join(' – ');
}
