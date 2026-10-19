# Ampy Flottdekor

Dekorsystem för Ampys arbetsbilar (VW Caddy och VW Transporter, alltid vita), i två nivåer: full foliering och delvis foliering.

**Status:** steg 1 (strategi) och steg 2 (fem riktningar) är klara. Nästa steg är att välja riktningar på granskningssidan.

| Steg | Innehåll | Status |
|---|---|---|
| 1 Strategi | `01-strategi/STRATEGI.md` | Klar |
| 2 Riktningar | `02-koncept/` | Klar, väntar på val |
| 3 Utveckla 2–3 | Alla fyra sidor, verklig miljö, reflexfolie | – |
| 4 Testa | Avstånd, gråskala, jämförelse, 3-sekunderstest, QR | – |
| 5 Produktion och pilot | Spec till folieringsfirma, mätplan, pilot | – |

## Innehåll

- `index.html`: granskningssidan (strategi och riktningar med val för Behåll, Kanske och Stryk)
- `mallar/`: sidovyer och bakvyer av T6.1 och Caddy 4 i mm, med slaskzon och tanklock
- `00-underlag/`: ZIP-filens bilder samt logga, blixt och a-märke i vektor ur brandbooken
- `verktyg/`: koden som ritar allt

## Bygga om

```sh
cd verktyg
npm install
npm run build
```
