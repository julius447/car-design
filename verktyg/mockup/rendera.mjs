// Renderar varje designs lager (lack och skylt) för de vyer designerna ritas i.
// Kör: node verktyg/mockup/rendera.mjs [nr ...]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DESIGNER } from './designer.mjs';
import { sida, bak, skylt } from './hjalp.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROT = path.dirname(fileURLToPath(import.meta.url));
const VY = JSON.parse(readFileSync(path.join(ROT, 'vyer.json'), 'utf8'));
const FS = path.join(ROT, '..', 'node_modules', '@fontsource');

const FAMILJER = {
  'Inter Tight': 'inter-tight', 'Archivo Black': 'archivo-black', 'Fraunces': 'fraunces', 'Space Grotesk': 'space-grotesk',
  'Familjen Grotesk': 'familjen-grotesk', 'Manrope': 'manrope', 'Sora': 'sora', 'Unbounded': 'unbounded',
  'Schibsted Grotesk': 'schibsted-grotesk', 'Bricolage Grotesque': 'bricolage-grotesque', 'JetBrains Mono': 'jetbrains-mono',
  'Instrument Serif': 'instrument-serif', 'Anton': 'anton', 'Big Shoulders Display': 'big-shoulders-display',
};
let css = '';
for (const [fam, pkg] of Object.entries(FAMILJER)) {
  const dir = path.join(FS, pkg, 'files');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir)) {
    const m = f.match(/-latin-(\d+)-normal\.woff2$/);
    if (m && !f.includes('-ext-')) css += `@font-face{font-family:"${fam}";font-weight:${m[1]};src:url("file://${path.join(dir, f)}") format("woff2")}\n`;
  }
}

// Vyer som designerna ritas i, och vilken bil som är "full".
const KALLOR = [
  ['t_vanster', 'sida', true], ['t_bak', 'bak', true],
  ['c_vanster', 'sida', false], ['c_hoger', 'sida', false], ['c_bak', 'bak', false],
];

const urval = process.argv.slice(2).map(Number).filter(Boolean);
const lista = urval.length ? DESIGNER.filter(d => urval.includes(d.nr)) : DESIGNER;

const browser = await chromium.launch();
const page = await browser.newPage();
const tmp = path.join(ROT, 'cache', '_sida.html');

async function render(svgInner, w, h, ut) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css} html,body{margin:0;background:transparent}</style></head>
  <body><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svgInner}</svg></body></html>`;
  writeFileSync(tmp, html);
  await page.setViewportSize({ width: w, height: h });
  await page.goto('file://' + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: ut, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
}

const storlek = {};
for (const [vy] of KALLOR) {
  const bild = path.join(ROT, 'cache', vy, 'lack.png');
  const b = readFileSync(bild);
  storlek[vy] = [b.readUInt32BE(16), b.readUInt32BE(20)];
}

for (const d of lista) {
  const ut = path.join(ROT, 'cache', 'design', String(d.nr).padStart(2, '0'));
  mkdirSync(ut, { recursive: true });
  for (const [vy, typ, full] of KALLOR) {
    const [w, h] = storlek[vy];
    const L = VY[vy];
    const lack = typ === 'sida' ? d.sida(sida(L), full) : d.bak(bak(L), full);
    await render(lack, w, h, path.join(ut, `${vy}_lack.png`));
    if (typ === 'bak') await render(skylt(L.plate, full ? 'AMP 001' : 'AMP 002'), w, h, path.join(ut, `${vy}_skylt.png`));
  }
  writeFileSync(path.join(ut, 'meta.json'), JSON.stringify({ nr: d.nr, id: d.id, namn: d.namn, ide: d.ide, ref: d.ref, basT: d.bas(true), basC: d.bas(false) }, null, 1));
  console.log('renderad', d.nr, d.namn);
}
await browser.close();
