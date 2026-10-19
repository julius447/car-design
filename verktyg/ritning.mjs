// Sammansatta ritningar: mallar med zoner, konceptvyer och par i samma skala.
import { readFileSync } from 'node:fs';
import QRCode from 'qrcode';
import { T61, CADDY4, sidovy, bakvy, glansDef } from './fordon.mjs';
import { LOGO, C, shape, ratio } from './brand.mjs';

const font = readFileSync(new URL('./outfit-latin-500-normal.woff2', import.meta.url)).toString('base64');
export const fontFace = `@font-face{font-family:Outfit;font-weight:500;src:url(data:font/woff2;base64,${font}) format('woff2')}`;

export const svg = (vb, inner, { fristaende = true, titel = '' } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}"${titel ? ` role="img" aria-label="${titel}"` : ''}>` +
  (fristaende ? `<style>${fontFace}</style>` : '') + `<defs>${glansDef}</defs>${inner}</svg>`;

const mark = (f, y = f.H) => `<path d="M-400 ${y} H${f.L + 400}" stroke="#1c1f26" stroke-opacity=".25" stroke-width="10"/>`;

// En sidovy med luft runt och marklinje.
export function sida(f, { sida = 'v', dekor = '', id, extra = '', pad = 160, fristaende } = {}) {
  return svg([-pad, -pad, f.L + 2 * pad, f.H + 2 * pad],
    mark(f) + sidovy(f, { sida, dekor, id }) + extra, { fristaende, titel: `${f.namn}, ${sida === 'v' ? 'vänster' : 'höger'} sida` });
}

// Transporter och Caddy på samma mark, i samma skala.
export function par(dekorT, dekorC, id, { fristaende, gap = 700 } = {}) {
  const pad = 160, dy = T61.H - CADDY4.H, W = T61.L + gap + CADDY4.L;
  return svg([-pad, -pad, W + 2 * pad, T61.H + 2 * pad],
    `<path d="M-400 ${T61.H} H${W + 400}" stroke="#1c1f26" stroke-opacity=".25" stroke-width="10"/>` +
    sidovy(T61, { dekor: dekorT, id: id + 't' }) +
    `<g transform="translate(${T61.L + gap} ${dy})">${sidovy(CADDY4, { dekor: dekorC, id: id + 'c' })}</g>`,
    { fristaende, titel: 'Transporter och Caddy i samma skala' });
}

// QR-kod som SVG-rutor. Felkorrigering H tål smuts och böjda ytor.
export function qr(text, x, y, size, fill = C.navy, bg = '#ffffff') {
  const q = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const n = q.modules.size, m = size / (n + 8);
  let r = `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${bg}"/>`;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++)
    if (q.modules.get(j, i)) r += `<rect x="${x + (i + 4) * m}" y="${y + (j + 4) * m}" width="${m + 0.5}" height="${m + 0.5}" fill="${fill}"/>`;
  return r;
}

// Mallar: zoner och mått, ingen dekor.
const etikett = (x, y, s, size = 64, fill = '#1c1f26', anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Outfit, sans-serif" font-weight="500" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;

export function mall(f, s = 'v', { fristaende = true } = {}) {
  const pad = 420, a = f.a, X = x => (s === 'h' ? f.L - x : x);
  const slask = `<pattern id="hatch-${f.id}${s}" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="60" fill="#3b6fd8" fill-opacity=".16"/></pattern>` +
    `<rect x="0" y="${a.slask}" width="${f.L}" height="${f.H - a.slask}" fill="url(#hatch-${f.id}${s})"/>` +
    `<path d="M0 ${a.slask} H${f.L}" stroke="#3b6fd8" stroke-width="8" stroke-dasharray="40 24"/>`;
  const tank = s === 'h' ? (() => {
    const [x, y, w, h] = f.tanklock;
    return `<rect x="${X(x) - w}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#d64545" stroke-width="10" stroke-dasharray="24 16"/>` +
      etikett(X(x) - w / 2, y - 30, 'tanklock?', 52, '#d64545', 'middle');
  })() : '';
  const matt = `<path d="M0 ${f.H + 180} H${f.L}" stroke="#1c1f26" stroke-width="6"/>` +
    `<path d="M0 ${f.H + 140} V${f.H + 220} M${f.L} ${f.H + 140} V${f.H + 220}" stroke="#1c1f26" stroke-width="6"/>` +
    etikett(f.L / 2, f.H + 290, `${f.L.toLocaleString('sv-SE')} mm`, 64, '#1c1f26', 'middle') +
    `<path d="M${f.L + 180} 0 V${f.H}" stroke="#1c1f26" stroke-width="6"/>` +
    `<path d="M${f.L + 140} 0 H${f.L + 220} M${f.L + 140} ${f.H} H${f.L + 220}" stroke="#1c1f26" stroke-width="6"/>` +
    etikett(f.L + 240, f.H / 2, `${f.H.toLocaleString('sv-SE')} mm`, 64);
  const text = etikett(40, f.H - 60, `Slaskzon: under ${Math.round((f.H - a.slask) / 10)} cm från marken ligger inget som ska läsas`, 58, '#2a55b8');
  return svg([-120, -pad, f.L + pad + 300, f.H + pad + 360],
    mark(f) + sidovy(f, { sida: s, id: `m${f.id}${s}` }) + slask + tank + matt + text +
    etikett(0, -pad + 110, `${f.namn} · ${f.variant} · ${s === 'v' ? 'vänster sida (förarsidan)' : 'höger sida (trottoarsidan, skjutdörr)'}`, 86) +
    etikett(0, -pad + 210, 'Mått i mm · spårad ur tillverkarens profil · ca ±3 % · ej produktionsmall', 58, '#5b6270'),
    { fristaende, titel: `Mall ${f.namn}` });
}

export function mallBak(f, { dekor = '', fristaende = true, id = 'b' } = {}) {
  const b = f.bak, pad = 200;
  return svg([-pad, -pad, b.B + 2 * pad, b.H + 2 * pad],
    `<path d="M-300 ${b.H} H${b.B + 300}" stroke="#1c1f26" stroke-opacity=".25" stroke-width="10"/>` + bakvy(f, { dekor, id: f.id + id }),
    { fristaende, titel: `${f.namn} bakifrån` });
}

// Neutral märkning bakifrån, för att visa QR-placering i strategin.
export function bakMarkning(f) {
  const b = f.bak, half = b.B - b.delning, q = Math.round(f.id === 't61' ? 300 : 260);
  const qx = b.delning + (half - q) / 2, qy = f.id === 't61' ? 360 : 330;
  const lw = b.B * 0.42, lx = (b.B - lw) / 2;
  return shape(LOGO, lx, 120, lw, C.navy) +
    qr('https://ampy.se/hej?bil=' + f.id, qx, qy, q) +
    `<text x="${qx + q / 2}" y="${qy + q + 70}" font-family="Outfit, sans-serif" font-weight="500" font-size="52" fill="${C.navy}" text-anchor="middle">Scanna för överraskning</text>`;
}
