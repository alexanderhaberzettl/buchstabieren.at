import { ALPHABET, spell } from './spell.js';

const input = document.getElementById('input');
const digraphs = document.getElementById('digraphs');
const result = document.getElementById('result');
const line = document.getElementById('line');
const speakButton = document.getElementById('speak');
const copyButton = document.getElementById('copy');
const table = document.getElementById('table');

let tokens = [];

function render() {
  tokens = spell(input.value, { digraphs: digraphs.checked });
  result.replaceChildren(...tokens.map(tokenItem));
  line.textContent = tokens.map((t) => t.word).join(' – ');
  speakButton.disabled = copyButton.disabled = tokens.length === 0;

  const url = new URL(location.href);
  if (input.value) url.searchParams.set('q', input.value);
  else url.searchParams.delete('q');
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

for (const [letter, word] of ALPHABET) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = `<b></b><span></span>`;
  button.querySelector('b').textContent = letter;
  button.querySelector('span').textContent = word;
  button.addEventListener('click', () => {
    input.value += letter;
    input.focus();
    render();
  });
  li.append(button);
  table.append(li);
}

if (!('speechSynthesis' in window)) speakButton.hidden = true;

input.addEventListener('input', render);
digraphs.addEventListener('change', render);
speakButton.addEventListener('click', speak);
copyButton.addEventListener('click', copy);

input.value = new URLSearchParams(location.search).get('q') ?? '';
render();
