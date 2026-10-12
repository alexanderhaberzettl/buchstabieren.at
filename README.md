# buchstabieren.at

Buchstabieren nach der österreichischen Buchstabiertafel:
„Graz“ → Georg – Rosa – Anna – Zita.

Standard ist die [neue österreichische Buchstabiertabelle (2025)](http://oedeutsch.at/OEDTPORTAL/downloads/AT-Buchstabiertabelle%20NEU-2025.pdf)
der Österreichischen Sprachnormenkommission. Die alte Tabelle nach ÖNORM A 1081
(2019 ersatzlos zurückgezogen) ist weiterhin wählbar.

## Funktionen

- Text eingeben → wird live buchstabiert (Umlaute, ß, „Ch“/„Sch“, Ziffern, Satzzeichen)
- Umschalten zwischen neuer Tabelle (2025) und alter Tabelle (ÖNORM A 1081)
- „Ch“, „Qu“ und „Sch“ wahlweise als Einheit (China, Quelle, Schule) oder Buchstabe für Buchstabe;
  die alte Tabelle kennt kein „Ch“, dort wird es als Cäsar – Heinrich buchstabiert
- Vorlesen (Sprachausgabe des Browsers, de-AT) und Kopieren
- Teilbarer Link: `?q=Haberzettl` (alte Tabelle: `&t=oenorm`)
- Buchstabiertafel zum Nachschlagen

Online: https://alexanderhaberzettl.github.io/buchstabieren.at/

## Entwicklung

Reine statische Seite ohne Build-Schritt und ohne Abhängigkeiten.

```sh
npm start   # lokaler Server
npm test    # Unit-Tests (Node ≥ 20)
```

Die Logik liegt in `src/spell.js`, die Oberfläche in `index.html`, `src/app.js` und `src/style.css`.

## Veröffentlichung

Jeder Push auf den Default-Branch führt die Tests aus und veröffentlicht
`index.html` und `src/` über GitHub Actions auf GitHub Pages
(`.github/workflows/pages.yml`). Einmalig nötig: unter *Settings → Pages* als
*Source* „GitHub Actions“ auswählen.
