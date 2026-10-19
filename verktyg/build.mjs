// Bygger mallar, konceptritningar och granskningssidan (index.html).
// Kör: cd verktyg && npm install && npm run build
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { T61, CADDY4, sidovy } from './fordon.mjs';
import { KONCEPT, MENING } from './koncept.mjs';
import { LOGO, BOLT, C, shape } from './brand.mjs';
import { svg, sida, par, mall, mallBak, bakMarkning, qr, fontFace } from './ritning.mjs';

const ROT = new URL('../', import.meta.url);
const ut = (p, s) => { const u = new URL(p, ROT); mkdirSync(new URL('./', u), { recursive: true }); writeFileSync(u, s); };
const b64 = p => readFileSync(new URL(p, import.meta.url)).toString('base64');

// 1. Mallar
for (const f of [T61, CADDY4]) {
  ut(`mallar/${f.id}-vanster.svg`, mall(f, 'v'));
  ut(`mallar/${f.id}-hoger.svg`, mall(f, 'h'));
  ut(`mallar/${f.id}-bak.svg`, mallBak(f));
}

// 2. Koncept: Transporter full, Caddy delvis, och båda nivåerna på båda bilarna.
for (const k of KONCEPT) {
  ut(`02-koncept/${k.id}/par.svg`, par(k.rita(T61, true, k.id + 'pt'), k.rita(CADDY4, false, k.id + 'pc'), k.id + 'p'));
  ut(`02-koncept/${k.id}/transporter-full.svg`, sida(T61, { dekor: k.rita(T61, true, k.id + 'tf'), id: k.id + 'tf' }));
  ut(`02-koncept/${k.id}/transporter-delvis.svg`, sida(T61, { dekor: k.rita(T61, false, k.id + 'td'), id: k.id + 'td' }));
  ut(`02-koncept/${k.id}/caddy-full.svg`, sida(CADDY4, { dekor: k.rita(CADDY4, true, k.id + 'cf'), id: k.id + 'cf' }));
  ut(`02-koncept/${k.id}/caddy-delvis.svg`, sida(CADDY4, { dekor: k.rita(CADDY4, false, k.id + 'cd'), id: k.id + 'cd' }));
}

// 3. Granskningssidan
const inline = s => s.replace('<svg ', '<svg class="rit" ');
const fs = { fristaende: false };
const ex = KONCEPT[0];

const lager = [
  ['L0', 'Vit bil', 'Lacken. Ingen folie.', sida(T61, { id: 'l0', ...fs })],
  ['L1', 'Märkning = delvis', 'Logga, blixt, mening och QR. Samma storlek och plats på alla bilar.', sida(T61, { dekor: ex.rita(T61, false, 'l1'), id: 'l1', ...fs })],
  ['L1 + L2', 'Märkning + yta = full', 'Färgfält eller mönster läggs under märkningen. Inget i L1 flyttas.', sida(T61, { dekor: ex.rita(T61, true, 'l2'), id: 'l2', ...fs })],
];

// Hierarkin ritad på Transportern: avstånd → vad som ska bära.
const T = T61, cw = T.a.bak - T.a.bstolpe;
const pil = (x1, y1, x2, y2, txt, sub) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${C.blue}" stroke-width="12"/><circle cx="${x2}" cy="${y2}" r="34" fill="${C.blue}"/>` +
  `<text x="${x1}" y="${y1 - 110}" font-family="Outfit, sans-serif" font-weight="900" font-size="120" fill="${C.navy}">${txt}</text>` +
  `<text x="${x1}" y="${y1 - 20}" font-family="Outfit, sans-serif" font-weight="500" font-size="72" fill="#5b6270">${sub}</text>`;
const hierarkiSvg = svg([-200, -900, T.L + 2400, T.H + 1100],
  `<path d="M-300 ${T.H} H${T.L + 300}" stroke="#1c1f26" stroke-opacity=".25" stroke-width="10"/>` +
  sidovy(T, { dekor: ex.rita(T, false, 'hi'), id: 'hi' }) +
  pil(T.L + 400, -420, T.a.bak - cw * 0.16, 260, '30 m', 'blixt och logga') +
  pil(T.L + 400, 640, T.a.bstolpe + cw * 0.4, 1040, '10 m', `«${MENING}»`) +
  `<g transform="translate(${T.L + 420} 1180) scale(.42)">${sidovy(T, { sida: 'h', id: 'hq' })}` +
  `${qr('https://ampy.se/hej?bil=t61-h', 3150, 900, 300)}</g>` +
  `<text x="${T.L + 420}" y="${T.H + 70}" font-family="Outfit, sans-serif" font-weight="900" font-size="120" fill="${C.navy}">2 m</text>`,
  { fristaende: false, titel: 'Meddelandehierarki på tre avstånd' });

const koncept = KONCEPT.map((k, i) => `
<article class="koncept" id="${k.id}" data-id="${k.id}">
  <header class="k-head">
    <p class="k-nr">Riktning ${i + 1} av ${KONCEPT.length}</p>
    <h3>${k.namn}</h3>
    <p class="k-mening">${k.mening}</p>
  </header>
  <figure class="ark">
    ${inline(par(k.rita(T61, true, k.id + 'wt'), k.rita(CADDY4, false, k.id + 'wc'), k.id + 'w', fs))}
    <figcaption><span>Transporter · full foliering · ${k.tackning[1]}</span><span>Caddy · delvis foliering · ${k.tackning[0]}</span><span class="skala">Schematisk sidovy, samma skala</span></figcaption>
  </figure>
  <dl class="fakta">
    <div><dt>Satsar på</dt><dd>${k.satsar}</dd></div>
    <div><dt>Delvis</dt><dd>${k.delvis}</dd></div>
    <div><dt>Full</dt><dd>${k.full}</dd></div>
    <div><dt>Risk</dt><dd>${k.risk}</dd></div>
    <div><dt>Referens</dt><dd>${k.ref}</dd></div>
  </dl>
  <details class="fler">
    <summary>Visa båda nivåerna på båda bilarna</summary>
    <div class="fyra">
      <figure>${inline(sida(T61, { dekor: k.rita(T61, false, k.id + 'x1'), id: k.id + 'x1', ...fs }))}<figcaption>Transporter delvis</figcaption></figure>
      <figure>${inline(sida(CADDY4, { dekor: k.rita(CADDY4, true, k.id + 'x2'), id: k.id + 'x2', ...fs }))}<figcaption>Caddy full</figcaption></figure>
    </div>
  </details>
  <div class="beslut" role="group" aria-labelledby="bl-${k.id}">
    <p class="b-label" id="bl-${k.id}">Ditt beslut</p>
    <div class="val">
      <button type="button" data-val="behall" id="b-${k.id}-behall">Behåll</button>
      <button type="button" data-val="kanske" id="b-${k.id}-kanske">Kanske</button>
      <button type="button" data-val="stryk" id="b-${k.id}-stryk">Stryk</button>
    </div>
    <label class="not" for="n-${k.id}">Vad ska ändras om den går vidare?</label>
    <textarea id="n-${k.id}" rows="2" placeholder="T.ex. mindre blixt, testa grönt i stället för blått"></textarea>
    <p class="status" aria-live="polite"></p>
  </div>
</article>`).join('');

const logoSvg = (fill, w) => `<svg class="logo" viewBox="0 0 ${LOGO.box[2]} ${LOGO.box[3]}" width="${w}" aria-label="ampy" role="img">${shape(LOGO, 0, 0, LOGO.box[2], fill)}</svg>`;

const html = `<title>Ampy Flottdekor</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap">
<style>
@font-face{font-family:Outfit;font-weight:300;src:url(data:font/woff2;base64,${b64('./outfit-latin-300-normal.woff2')}) format('woff2')}
${fontFace}
@font-face{font-family:Outfit;font-weight:900;src:url(data:font/woff2;base64,${b64('./outfit-latin-900-normal.woff2')}) format('woff2')}
/* Layout: en ritningspärm. Vänsterställd textkolumn, ritningarna på egna ljusa ark i full bredd. */
:root{
  --bg:#f5f9ff; --ink:#090b32; --muted:#525a75; --line:rgba(9,11,50,.13);
  --accent:#326afd; --accent-ink:#ffffff; --signal:#1f9e5a; --warn:#b4361f;
  --sheet:#ffffff; --chip:#e8eefc;
  --display:Outfit, "Helvetica Neue", Arial, sans-serif;
  --body:Outfit, "Helvetica Neue", Arial, sans-serif;
  --mono:"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#080a26; --ink:#eef2ff; --muted:#a3abc8; --line:rgba(238,242,255,.14);
  --accent:#6b93ff; --accent-ink:#080a26; --signal:#55ff9a; --warn:#ff8a70;
  --sheet:#f1f4fa; --chip:#161a44; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#080a26; --ink:#eef2ff; --muted:#a3abc8; --line:rgba(238,242,255,.14);
  --accent:#6b93ff; --accent-ink:#080a26; --signal:#55ff9a; --warn:#ff8a70;
  --sheet:#f1f4fa; --chip:#161a44; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-weight:300;font-size:1.0625rem;line-height:1.55}
.wrap{max-width:74rem;margin:0 auto;padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px));padding-block:2.5rem 5rem;display:grid;gap:4.5rem}
h1,h2,h3{font-family:var(--display);font-weight:900;line-height:1.02;letter-spacing:-.02em;text-wrap:balance;margin:0}
h1{font-size:clamp(2.4rem,6vw,4.6rem)}
h2{font-size:clamp(1.9rem,4vw,3rem)}
h3{font-size:clamp(1.7rem,3.2vw,2.4rem)}
p{margin:0;max-width:40rem}
strong{font-weight:500}
.eyebrow,.k-nr,.b-label,dt,.mono{font-family:var(--mono);font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:500}
.top{display:grid;gap:1.5rem}
.top .logo{height:auto;color:var(--ink)}
.lead{font-size:1.25rem;max-width:44rem}
.steg{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;margin:0;padding:0}
.steg li{font-family:var(--mono);font-size:.78rem;padding:.35rem .7rem;border:1px solid var(--line);border-radius:99px;color:var(--muted)}
.steg li.nu{background:var(--ink);color:var(--bg);border-color:var(--ink)}
section{display:grid;gap:2rem}
.sec-head{display:grid;gap:.75rem;border-top:2px solid var(--ink);padding-top:1.25rem}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:2rem 3rem}
.grid2 > *{min-width:0}
.fynd{display:grid;gap:1.25rem;list-style:none;margin:0;padding:0;counter-reset:f}
.fynd li{display:grid;gap:.3rem;padding-left:2.4rem;position:relative}
.fynd li::before{counter-increment:f;content:counter(f);position:absolute;left:0;top:.1rem;font-family:var(--mono);font-size:.8rem;width:1.6rem;height:1.6rem;border-radius:50%;display:grid;place-items:center;background:var(--chip);color:var(--ink)}
.fynd h4{margin:0;font-family:var(--display);font-weight:500;font-size:1.15rem}
.lista{margin:0;padding-left:1.1rem;display:grid;gap:.45rem;max-width:42rem}
.ark{margin:0;background:var(--sheet);border-radius:14px;padding:clamp(.6rem,2vw,1.4rem);display:grid;gap:.6rem;color:#090b32;overflow-x:auto}
.ark figcaption,.fyra figcaption{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;font-family:var(--mono);font-size:.74rem;color:#525a75}
.ark figcaption .skala{margin-left:auto}
svg.rit{display:block;width:100%;height:auto}
.foto{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:1rem;align-items:start}
.foto figure{margin:0;display:grid;gap:.5rem}
.foto img{border-radius:10px;display:block;width:100%}
.foto figcaption{font-size:.9rem;color:var(--muted)}
@media (max-width:640px){.foto{grid-template-columns:1fr}}
.signal{display:grid;grid-template-columns:auto minmax(0,1fr);gap:1.5rem 2rem;align-items:center}
.signal svg{width:clamp(4.5rem,12vw,8rem);height:auto}
.skal{display:grid;gap:0;border-top:1px solid var(--line)}
.skal > div{display:grid;grid-template-columns:6rem minmax(0,1fr) minmax(0,1.3fr);gap:1rem 1.5rem;padding:1rem 0;border-bottom:1px solid var(--line);align-items:baseline}
.skal .d{font-family:var(--display);font-weight:900;font-size:1.8rem;font-variant-numeric:tabular-nums}
.skal .vad{font-weight:500}
@media (max-width:640px){.skal > div{grid-template-columns:4.5rem minmax(0,1fr)}.skal .regel{grid-column:2}}
.lager{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,19rem),1fr));gap:1rem}
.lager figure{margin:0;display:grid;gap:.6rem;align-content:start}
.lager .ark{padding:.6rem}
.lager b{font-family:var(--mono);font-weight:500;font-size:.8rem;color:var(--accent)}
.lager h4{margin:0;font-weight:500;font-size:1.05rem}
.lager p{font-size:.92rem;color:var(--muted)}
.regler{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:1.25rem 2.5rem;list-style:none;padding:0;margin:0}
.regler li{border-left:3px solid var(--accent);padding-left:1rem;display:grid;gap:.2rem}
.regler strong{font-size:1.02rem}
.summa{position:sticky;top:env(safe-area-inset-top, 0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding-block:.7rem;display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;font-family:var(--mono);font-size:.8rem}
.summa .pill{padding:.25rem .65rem;border-radius:99px;background:var(--chip)}
.summa .pill[data-v="behall"]{background:var(--ink);color:var(--bg)}
.koncept{display:grid;gap:1.4rem;padding-top:2.5rem;border-top:1px solid var(--line)}
.koncept[data-val="stryk"] .ark{opacity:.35;filter:grayscale(1)}
.k-head{display:grid;gap:.5rem}
.k-mening{font-size:1.3rem;font-weight:300;max-width:46rem}
.fakta{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:1.1rem 2rem;margin:0}
.fakta div{display:grid;gap:.25rem;min-width:0}
.fakta dd{margin:0;font-size:.98rem}
.fler summary{cursor:pointer;font-family:var(--mono);font-size:.8rem;color:var(--accent)}
.fler summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.fyra{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:1rem;margin-top:1rem}
.fyra figure{margin:0;background:var(--sheet);border-radius:12px;padding:.6rem;display:grid;gap:.4rem}
.beslut{display:grid;gap:.6rem;background:var(--chip);border-radius:14px;padding:1rem 1.1rem;max-width:40rem}
.val{display:flex;flex-wrap:wrap;gap:.5rem}
.val button{font:500 1rem var(--body);padding:.55rem 1.1rem;border-radius:99px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);cursor:pointer}
.val button:hover{background:var(--line)}
.val button:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.val button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.val button[data-val="stryk"][aria-pressed="true"]{background:var(--warn);border-color:var(--warn);color:#fff}
.val button:disabled{opacity:.5;cursor:default}
.not{font-size:.9rem;color:var(--muted)}
textarea{font:300 1rem var(--body);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:.6rem .75rem;width:100%;resize:vertical}
.status{font-family:var(--mono);font-size:.74rem;color:var(--muted);min-height:1.1em}
.nasta{display:grid;gap:1rem;background:var(--ink);color:var(--bg);border-radius:18px;padding:clamp(1.25rem,4vw,2.5rem)}
.nasta h2{color:var(--bg)}
.nasta .lista li::marker{color:var(--signal)}
.not-repo{font-family:var(--mono);font-size:.8rem;opacity:.8}
@media (prefers-reduced-motion:no-preference){.val button{transition:background .15s,color .15s}}
</style>

<div class="wrap">
<header class="top">
  ${logoSvg('currentColor', 150)}
  <p class="eyebrow">Dekorsystem för flottan · Steg 1 och 2 av 5 · oktober 2026</p>
  <h1>Så ska Ampy se ut på gatan</h1>
  <p class="lead">Strategin på en sida och fem tydligt olika riktningar. Markera <strong>Behåll</strong>, <strong>Kanske</strong> eller <strong>Stryk</strong> på varje riktning. De du behåller utvecklar jag i steg 3: alla fyra sidor, verklig miljö och reflexfolie.</p>
  <ol class="steg" aria-label="Arbetsgång">
    <li class="nu">1 Strategi</li><li class="nu">2 Riktningar</li><li>3 Utveckla 2–3</li><li>4 Testa</li><li>5 Produktion och pilot</li>
  </ol>
</header>

<section aria-labelledby="h-underlag">
  <div class="sec-head"><p class="eyebrow">Innan strategin</p><h2 id="h-underlag">Det här visade underlaget</h2></div>
  <div class="grid2">
    <ol class="fynd">
      <li><h4>Bilarna har kvar den gamla loggan</h4><p>Brandbooken från september 2025 har en ny logga, med blixten utskuren ur a:et och ingen ruta runt. Paletten är också ny: marinblått, elblått och neongrönt. Dekoren blir alltså första gången den nya identiteten syns på gatan. Jag följer brandbooken och inte turkosen i Ampys design system för interna verktyg, som är äldre.</p></li>
      <li><h4>Era bilar är Caddy 4 och Transporter T6</h4><p>Fotona i ZIP-filen är annonsbilder av tre Caddy-generationer och två Transporter-generationer. Era egna bilar är en Caddy 4 med svart skyddslist och en T6/T6.1 med svarta stötfångare. Mallarna är byggda för just dem, och sidoplåten är densamma på T6 och T6.1.</p></li>
      <li><h4>Ordlistan når inte fram på avstånd</h4><p>På bilden från motorvägen, cirka 25 meter bakom bilen, går "ampy" och telefonnumret att läsa. Raden "service · elinstallationer · smarta hem" och linjeillustrationen gör det inte. Tunna linjer blir grått brus på avstånd.</p></li>
    </ol>
    <div class="foto">
      <figure><img src="data:image/jpeg;base64,${readFileSync(new URL('01-strategi/bilder/nuvarande-25m.jpg', ROT)).toString('base64')}" alt="Ampys Transporter på motorvägen, cirka 25 meter bort. Loggan och telefonnumret syns, raden med tjänster och illustrationen gör det inte."><figcaption>Er Transporter på cirka 25 m. Bara loggan och numret går att läsa.</figcaption></figure>
      <figure><img src="data:image/jpeg;base64,${readFileSync(new URL('01-strategi/bilder/nuvarande-nara.jpg', ROT)).toString('base64')}" alt="Närbild på nuvarande sidodekor med tjänsterad och linjeillustration av hus och solpanel."><figcaption>Samma dekor nära. Illustrationen korsar dörrspringor och slaskzonen.</figcaption></figure>
    </div>
  </div>
  <div class="grid2">
    <div class="sec-sub"><p class="eyebrow">Antaganden att bekräfta</p></div>
    <ul class="lista">
      <li>Kort hjulbas på båda (inte Caddy Maxi eller lång Transporter).</li>
      <li>Skjutdörr bara på höger sida. Vänster sida är hel plåt.</li>
      <li>Bakdörrar utan fönster (bekräftat). Caddy 4:s bakdörrar är osymmetriska, och den vänstra är bredare.</li>
      <li>Tanklockets plats är markerad i mallarna men inte kontrollerad på bilen.</li>
      <li>Bilarna är leasade. Därför gjuten folie som går att ta bort utan skador på lacken.</li>
      <li>Mallarna är spårade ur tillverkarens profilbild och måttblad, med en noggrannhet på cirka ±3 %. Tryckfilerna i steg 5 görs på en köpt produktionsmall eller på uppmätt bil.</li>
    </ul>
  </div>
  <div class="grid2">
    <div class="sec-sub"><p class="eyebrow">Saknas, och varför det spelar roll</p></div>
    <ul class="lista">
      <li><strong>Fyra mobilfoton per bil</strong> (rakt från vänster, höger, fram och bak) och registreringsnumren. De avgör takräcke, skyddslister och dragkrok, alltså var folien faktiskt kan ligga. Behövs före steg 3.</li>
      <li><strong>Landningssidan bakom QR-koden.</strong> Koden kan tryckas först när adressen är bestämd. Jag föreslår en kort adress per bil, till exempel ampy.se/hej?bil=t61-01.</li>
    </ul>
  </div>
</section>

<section aria-labelledby="h-strategi">
  <div class="sec-head"><p class="eyebrow">Steg 1 · Strategi</p><h2 id="h-strategi">En symbol i stället för en ordlista</h2></div>

  <div class="signal">
    <svg viewBox="0 0 ${BOLT.box[2]} ${BOLT.box[3]}" aria-hidden="true">${shape(BOLT, 0, 0, BOLT.box[2], 'var(--accent)')}</svg>
    <div style="display:grid;gap:.8rem;min-width:0">
      <p class="lead"><strong>Motsättningen:</strong> utan ord vet ingen att Ampy är en elfirma. Med en lista av ord ser ni ut som vilken hantverkare som helst. <strong>Lösningen:</strong> låt blixten säga "el", så behöver inget ord göra det.</p>
      <ul class="lista">
        <li><strong>Den läses på en bråkdels sekund och utan språk.</strong> Inget annat tecken betyder "el" lika snabbt.</li>
        <li><strong>Ni äger den redan.</strong> Den sitter i a:et i loggan, och brandbooken säger att grafiska former ska byggas av blixten eller a:et. Vi förstärker något som finns i stället för att lägga till något nytt.</li>
        <li><strong>Den skalar.</strong> En blixt på två meter syns på 50 meter. Ett ord på samma yta gör det inte.</li>
        <li><strong>Risken:</strong> blixten är vanlig bland elfirmor. Därför används den aldrig som clipart, bara med er exakta geometri, i stor skala och beskuren av bilens kanter. 3-sekunderstestet i steg 4 avgör om det räcker.</li>
      </ul>
    </div>
  </div>

  <div style="display:grid;gap:1rem">
    <p class="eyebrow">Meddelandehierarki</p>
    <div class="skal">
      <div><span class="d">30 m</span><span class="vad">Passerar i trafik, 1–2 sekunder. Form, färg, blixt och logga.</span><span class="regel">Loggans x-höjd minst 25 cm. Loggan blir då minst cirka 1,4 m bred på Transportern och 1,25 m på Caddyn. Tumregeln är 25 mm bokstavshöjd per 3 m läsavstånd.</span></div>
      <div><span class="d">10 m</span><span class="vad">I kö eller vid rödljus, 3–5 sekunder. En mening.</span><span class="regel">Förslag att testa: <strong>«${MENING}»</strong>, «Modern el för moderna hem.» eller «Laddat för framtiden.» Versalhöjd minst 9 cm.</span></div>
      <div><span class="d">2 m</span><span class="vad">Parkerad hos kund, en granne går förbi. QR-kod, «Scanna för överraskning» och ampy.se.</span><span class="regel">QR-koden ska vara minst 20 cm på sidan och 25–30 cm på bakdörrarna, med felkorrigering H. Den sitter på höger framdörr, eftersom skjutdörren täcker bakre sidoplåten när den är öppen, och på höger bakdörr. Den skannas av passagerare och gående, inte av förare.</span></div>
    </div>
    <figure class="ark">${inline(hierarkiSvg)}<figcaption><span>Exempel: riktningen Blixten, delvis foliering</span><span class="skala">Telefonnumret flyttas till landningssidan</span></figcaption></figure>
  </div>

  <div style="display:grid;gap:1rem">
    <p class="eyebrow">Systemregel</p>
    <p class="lead">Folien läggs i lager. <strong>Delvis foliering är alltid en delmängd av full.</strong> Allt som bär identiteten sitter likadant på alla bilar, och bara ytan skiljer. Därför ser en halvfolierad Caddy och en helfolierad Transporter ut som samma märke.</p>
    <div class="lager">
      ${lager.map(([n, t, d, s]) => `<figure><div class="ark">${inline(s)}</div><b>${n}</b><h4>${t}</h4><p>${d}</p></figure>`).join('')}
    </div>
    <ul class="regler">
      <li><strong>Inget som ska läsas i nedre tredjedelen</strong><span>Under cirka 67 cm på Transportern och under skyddslisten på Caddyn hamnar salt och slask. En mörk färg nedtill i full foliering döljer dessutom smutsen.</span></li>
      <li><strong>Vänster sida möter trafiken</strong><span>Därför störst och enklast. Höger sida möter trottoaren och kundens uppfart, och där sitter QR-koden.</span></li>
      <li><strong>Aldrig över handtag, skyddslist eller tanklock</strong><span>Loggan får korsa en dörrspringa men aldrig ett handtag eller skjutdörrsskenan.</span></li>
      <li><strong>Främre sidorutor folieras aldrig</strong><span>Det är förbjudet. Bakdörrarna saknar fönster och är hel yta.</span></li>
      <li><strong>Nästa bil, till exempel en ID. Buzz</strong><span>Får samma L1, placerad efter B-stolpen och bakkanten. L2 anpassas efter bilens form.</span></li>
    </ul>
  </div>
</section>

<section aria-labelledby="h-riktningar">
  <div class="sec-head"><p class="eyebrow">Steg 2 · Konceptområden</p><h2 id="h-riktningar">Fem riktningar att välja bort ifrån</h2>
  <p>Riktningarna skiljer sig i hur mycket av bilen de tar och i vad som bär el-signalen. Varje riktning visas som en schematisk sidovy, inte en rendering: Transportern helfolierad och Caddyn delvis folierad, i samma skala och på er riktiga geometri. Medvetet utelämnat: fotodekor med människor och bilder, som ser ut som en lokal annons, åldras snabbt och syns dåligt på avstånd.</p></div>
  <div class="summa" aria-live="polite"><span>Dina val:</span><span class="pill" data-v="behall">Behåll <b data-count="behall">0</b></span><span class="pill">Kanske <b data-count="kanske">0</b></span><span class="pill">Stryk <b data-count="stryk">0</b></span><span class="pill">Omarkerade <b data-count="ingen">${KONCEPT.length}</b></span><span class="spar" id="spar-status"></span></div>
  ${koncept}
</section>

<section class="nasta" aria-labelledby="h-nasta">
  <p class="eyebrow" style="color:inherit;opacity:.7">När du har valt</p>
  <h2 id="h-nasta">Steg 3 till 5</h2>
  <ul class="lista">
    <li><strong>Steg 3:</strong> de 2–3 riktningar du behåller ritas på alla fyra sidor av båda bilarna, plus stämningsbilder i verklig miljö (villagata, trafik, vintermörker), tydligt märkta som AI-bilder. Där tar jag också ställning till reflexfolie för mörker.</li>
    <li><strong>Steg 4:</strong> avståndstest, gråskaletest, jämförelse sida vid sida med Tesla, Polestar, Tibber, Octopus Energy och Bravida, samt ett färdigt upplägg för 3-sekunderstestet.</li>
    <li><strong>Steg 5:</strong> specifikation till folieringsfirman, mätplan med en QR-kod per bil och en pilot.</li>
  </ul>
  <p class="not-repo">Allt finns i repot julius447/car-design: mallar/, 01-strategi/, 02-koncept/ och verktyg/ för att bygga om.</p>
</section>
</div>

<script>
(() => {
  const VAL = ['behall', 'kanske', 'stryk'];
  const kort = [...document.querySelectorAll('.koncept')];
  const state = {};
  const sparStatus = document.getElementById('spar-status');
  let db = null;

  function rendera(id) {
    const el = document.getElementById(id), s = state[id] || {};
    el.dataset.val = s.val || '';
    el.querySelectorAll('.val button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.val === s.val)));
    const ta = el.querySelector('textarea');
    if (document.activeElement !== ta && typeof s.notering === 'string') ta.value = s.notering;
    const n = { behall: 0, kanske: 0, stryk: 0, ingen: 0 };
    kort.forEach(k => { const v = (state[k.id] || {}).val; n[VAL.includes(v) ? v : 'ingen']++; });
    Object.entries(n).forEach(([k, v]) => { const c = document.querySelector('[data-count="' + k + '"]'); if (c) c.textContent = v; });
  }

  async function spara(id, patch, statusEl) {
    state[id] = { ...(state[id] || {}), ...patch };
    rendera(id);
    if (!db) { statusEl.textContent = 'Sparas inte här. Skriv ditt val som kommentar på sidan i stället.'; return; }
    statusEl.textContent = 'Sparar…';
    try {
      await db.doc('beslut/' + id).set({ val: state[id].val || '', notering: state[id].notering || '', tid: new Date().toISOString() });
      statusEl.textContent = 'Sparat';
    } catch (e) {
      statusEl.textContent = e && e.code === 'invalid_argument' ? 'Du har bara läsbehörighet på den här sidan.' : 'Kunde inte spara. Försök igen om en stund.';
    }
  }

  kort.forEach(el => {
    const id = el.id, st = el.querySelector('.status'), ta = el.querySelector('textarea');
    el.querySelectorAll('.val button').forEach(b => b.addEventListener('click', () => {
      const v = (state[id] || {}).val === b.dataset.val ? '' : b.dataset.val;
      spara(id, { val: v }, st);
    }));
    let t;
    ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => spara(id, { notering: ta.value }, st), 800); });
    rendera(id);
  });

  (async () => {
    try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
    if (!db) { sparStatus.textContent = 'Valen sparas bara i den här vyn.'; return; }
    sparStatus.textContent = 'Valen sparas och syns för Claude.';
    db.collection('beslut').onSnapshot(snap => {
      snap.docs.forEach(d => { if (d.exists) { state[d.id] = d.data(); rendera(d.id); } });
    }, () => { sparStatus.textContent = 'Tappade kontakten med lagringen. Ladda om sidan.'; });
  })();
})();
</script>
`;
ut('index.html', html);
console.log('Klart:', (html.length / 1024).toFixed(0), 'kB');
