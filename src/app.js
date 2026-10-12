import { TABLES, DEFAULT_TABLE, spell } from './spell.js';

const input = document.getElementById('input');
const clearButton = document.getElementById('clear');
const units = document.getElementById('units');
const tableRadios = document.querySelectorAll('input[name="table"]');
const examples = document.getElementById('examples');
const result = document.getElementById('result');
const output = document.getElementById('output');
const line = document.getElementById('line');
const speakButton = document.getElementById('speak');
const copyButton = document.getElementById('copy');
const table = document.getElementById('table');
const tableTitle = document.getElementById('table-title');

let tokens = [];

const selectedTable = () =>
  [...tableRadios].find((r) => r.checked)?.value ?? DEFAULT_TABLE;

function render() {
  const tableId = selectedTable();
  const previous = tokens;
  tokens = spell(input.value, { table: tableId, units: units.checked });

  // Keep tiles that did not change so only new ones animate in.
  let same = 0;
  while (
    same < previous.length && same < tokens.length &&
    previous[same].char === tokens[same].char && previous[same].word === tokens[same].word
  ) same++;
  while (result.children.length > same) result.lastChild.remove();
  result.append(...tokens.slice(same).map(tokenItem));

  line.textContent = tokens.map((t) => t.word).join(' – ');
  const empty = tokens.length === 0;
  output.hidden = empty;
  examples.hidden = !empty;
  clearButton.hidden = empty;

  const url = new URL(location.href);
  if (input.value) url.searchParams.set('q', input.value);
  else url.searchParams.delete('q');
  if (tableId !== DEFAULT_TABLE) url.searchParams.set('t', tableId);
  else url.searchParams.delete('t');
  history.replaceState(null, '', url);
}

function tokenItem({ char, word, kind }) {
  const li = document.createElement('li');
  li.className = `token ${kind}`;
  const letter = document.createElement('span');
  letter.className = 'char';
  letter.textContent = /^\s$/.test(char) ? '␣' : badge(char);
  const name = document.createElement('span');
  name.className = 'word';
  name.textContent = word;
  li.append(letter, name);
  return li;
}

// Capitalize for the badge (Sch, Qu, Ö); ß has no single-letter capital in common use.
const badge = (char) => (char[0] === 'ß' ? char : char[0].toUpperCase() + char.slice(1).toLowerCase());

function renderTable() {
  const { name, entries } = TABLES[selectedTable()];
  tableTitle.textContent = `Buchstabiertafel – ${name}`;
  table.replaceChildren(...entries.map(([letter, word]) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    const b = document.createElement('b');
    b.textContent = letter;
    const span = document.createElement('span');
    span.textContent = word;
    button.append(b, span);
    button.addEventListener('click', () => {
      input.value += letter;
      input.focus();
      render();
    });
    li.append(button);
    return li;
  }));
}

function setInput(value) {
  input.value = value;
  input.focus();
  render();
}

function speak() {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(tokens.map((t) => t.word).join(', '));
  utterance.lang = 'de-AT';
  utterance.rate = 0.85;
  const voices = speechSynthesis.getVoices();
  utterance.voice = voices.find((v) => v.lang === 'de-AT') ?? voices.find((v) => v.lang.startsWith('de')) ?? null;
  speechSynthesis.speak(utterance);
}

async function copy() {
  const label = copyButton.querySelector('span');
  const original = label.dataset.label ??= label.textContent;
  try {
    await navigator.clipboard.writeText(line.textContent);
    label.textContent = 'Kopiert ✓';
  } catch {
    label.textContent = 'Fehlgeschlagen';
  }
  setTimeout(() => (label.textContent = original), 1500);
}

if (!('speechSynthesis' in window)) speakButton.hidden = true;

input.addEventListener('input', render);
clearButton.addEventListener('click', () => setInput(''));
units.addEventListener('change', render);
for (const radio of tableRadios) {
  radio.addEventListener('change', () => {
    renderTable();
    render();
  });
}
for (const button of examples.querySelectorAll('button')) {
  button.addEventListener('click', () => setInput(button.textContent));
}
speakButton.addEventListener('click', speak);
copyButton.addEventListener('click', copy);

const params = new URLSearchParams(location.search);
input.value = params.get('q') ?? '';
const initialTable = params.get('t');
if (initialTable in TABLES) {
  for (const radio of tableRadios) radio.checked = radio.value === initialTable;
}
renderTable();
render();
