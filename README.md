# buchstabieren.at

Buchstabieren nach der österreichischen Buchstabiertafel (ÖNORM A 1081):
„Otto“ → Otto – Theodor – Theodor – Otto.

## Funktionen

- Text eingeben → wird live buchstabiert (Umlaute, ß, „Ch“/„Sch“, Ziffern, Satzzeichen)
- „Ch“ und „Sch“ wahlweise als Einheit (Christine, Schule) oder Buchstabe für Buchstabe
- Vorlesen (Sprachausgabe des Browsers, de-AT) und Kopieren
- Teilbarer Link: `?q=Haberzettl`
- Buchstabiertafel zum Nachschlagen

## Entwicklung

Reine statische Seite ohne Build-Schritt und ohne Abhängigkeiten.

```sh
npm start   # lokaler Server
npm test    # Unit-Tests (Node ≥ 20)
```

Die Logik liegt in `src/spell.js`, die Oberfläche in `index.html`, `src/app.js` und `src/style.css`.
