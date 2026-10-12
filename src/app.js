import { TABLES, DEFAULT_TABLE, spell } from './spell.js';

const input = document.getElementById('input');
const units = document.getElementById('units');
const tableRadios = document.querySelectorAll('input[name="table"]');
const result = document.getElementById('result');
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
  tokens = spell(input.value, { table: tableId, units: units.checked });
  result.replaceChildren(...tokens.map(tokenItem));
  line.textContent = tokens.map((t) => t.word).join(' – ');
  speakButton.disabled = copyButton.disabled = tokens.length === 0;

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
  letter.textContent = /^\s$/.test(char) ? '␣' : char;
  const name = document.createElement('span');
  name.className = 'word';
  name.textContent = word;
  li.append(letter, name);
  return li;
}

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
  try {
    await navigator.clipboard.writeText(line.textContent);
    flash(copyButton, 'Kopiert ✓');
  } catch {
    flash(copyButton, 'Fehlgeschlagen');
  }
}

function flash(button, text) {
  const original = button.dataset.label ??= button.textContent;
  button.textContent = text;
  setTimeout(() => (button.textContent = original), 1500);
}

if (!('speechSynthesis' in window)) speakButton.hidden = true;

input.addEventListener('input', render);
units.addEventListener('change', render);
for (const radio of tableRadios) {
  radio.addEventListener('change', () => {
    renderTable();
    render();
  });
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
