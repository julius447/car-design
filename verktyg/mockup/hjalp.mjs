// Hjälpfunktioner för designerna. Allt i fotots pixlar.
import QRCode from 'qrcode';

export const P = {
  ink: '#0D0E10', white: '#FFFFFF', paper: '#F4F3EF', elec: '#2F54FF', cobalt: '#1B37C4',
  signal: '#FF5A1F', forest: '#0E3B2C', graphite: '#34373C', thunder: '#4A4E54', fog: '#D9D8D3',
  red: '#C1121F', navy: '#0B1C3D', volt: '#B6FF2E', teal: '#14B8A6', sky: '#9EC5FF', sand: '#E8E2D6',
};

export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Sidovy: t går från front (0) till bakkant (1), s från tak (0) till tröskel (1).
export function sida(L) {
  const d = L.dir, F = L.front, R = L.paintRear, len = Math.abs(R - F);
  const X = t => F + d * t * len;
  const H = L.sill - L.roof;
  const Y = s => L.roof + s * H;
  const tAt = x => (x - F) / (d * len);
  const tb = tAt(L.bpillar), tdf = tAt(L.doorFront);
  const pt = (t, s) => `${X(t).toFixed(1)},${Y(s).toFixed(1)}`;
  const poly = (pts, fill, extra = '') => `<polygon points="${pts.map(([t, s]) => pt(t, s)).join(' ')}" fill="${fill}" ${extra}/>`;
  const rect = (t0, s0, t1, s1, fill, extra = '') => {
    const xa = X(t0), xb = X(t1);
    return `<rect x="${Math.min(xa, xb)}" y="${Y(s0)}" width="${Math.abs(xb - xa)}" height="${Y(s1) - Y(s0)}" fill="${fill}" ${extra}/>`;
  };
  // align: 'front' | 'rear' | 'middle' – anger vilken kant av texten som sitter vid t.
  const anchor = a => a === 'middle' ? 'middle' : (a === 'front') === (d === 1) ? 'start' : 'end';
  const text = (t, s, str, o = {}) => {
    const size = o.size * H;
    return `<text x="${X(t).toFixed(1)}" y="${Y(s).toFixed(1)}" font-family="${o.font}" font-weight="${o.weight || 400}" font-size="${size.toFixed(1)}" fill="${o.fill}" text-anchor="${anchor(o.align || 'front')}" letter-spacing="${((o.ls || 0) * size).toFixed(2)}"${o.baseline ? ` dominant-baseline="${o.baseline}"` : ''}${o.style ? ` style="${o.style}"` : ''}>${esc(str)}</text>`;
  };
  const base = fill => `<rect x="-50" y="-50" width="5000" height="5000" fill="${fill}"/>`;
  return { L, d, X, Y, H, len, tb, tdf, tAt, pt, poly, rect, text, anchor, base, wheelR: L.wheelR, wheelF: L.wheelF };
}

// Bakvy: u går från vänster (0) till höger (1) över dörrarna, v från topp (0) till botten (1).
export function bak(R) {
  const [x0, y0, x1, y1] = R.doors;
  const W = x1 - x0, H = y1 - y0;
  const U = u => x0 + u * W, V = v => y0 + v * H;
  const useam = (R.seam - x0) / W;
  const text = (u, v, str, o = {}) => {
    const size = o.size * H;
    return `<text x="${U(u).toFixed(1)}" y="${V(v).toFixed(1)}" font-family="${o.font}" font-weight="${o.weight || 400}" font-size="${size.toFixed(1)}" fill="${o.fill}" text-anchor="${o.anchor || 'start'}" letter-spacing="${((o.ls || 0) * size).toFixed(2)}"${o.baseline ? ` dominant-baseline="${o.baseline}"` : ''}>${esc(str)}</text>`;
  };
  const rect = (u0, v0, u1, v1, fill, extra = '') => `<rect x="${U(u0)}" y="${V(v0)}" width="${(u1 - u0) * W}" height="${(v1 - v0) * H}" fill="${fill}" ${extra}/>`;
  const base = fill => `<rect x="-50" y="-50" width="5000" height="5000" fill="${fill}"/>`;
  return { R, U, V, W, H, useam, text, rect, base };
}

export function qr(str, x, y, size, fg = P.ink, bg = '#FFFFFF', quiet = 3) {
  const q = QRCode.create(str, { errorCorrectionLevel: 'H' });
  const n = q.modules.size, m = size / (n + 2 * quiet);
  let p = '';
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++)
    if (q.modules.get(j, i)) p += `M${(x + (i + quiet) * m).toFixed(2)} ${(y + (j + quiet) * m).toFixed(2)}h${(m + 0.4).toFixed(2)}v${(m + 0.4).toFixed(2)}h-${(m + 0.4).toFixed(2)}z`;
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.04}" fill="${bg}"/><path d="${p}" fill="${fg}"/>`;
}

// QR med rubrik på höger bakdörr. Storlek ca 28 cm.
export function qrBlock(B, o = {}) {
  const { U, V, useam, H } = B;
  const size = (o.size || 0.24) * H;
  const cu = o.u ?? (useam + (1 - useam) * 0.5);
  const cx = U(cu), top = V(o.v ?? 0.18);
  const x = cx - size / 2;
  const fs = size * 0.105;
  const font = o.font || 'Inter Tight';
  return qr(`https://ampy.se/bil?d=${o.id}&b=${o.bil}`, x, top, size, o.fg || P.ink, o.bg || '#FFFFFF') +
    `<text x="${cx}" y="${top + size + fs * 1.7}" font-family="${font}" font-weight="${o.w1 || 600}" font-size="${fs}" fill="${o.label || P.ink}" text-anchor="middle">${esc(o.rubrik || 'Scanna för överraskning')}</text>` +
    `<text x="${cx}" y="${top + size + fs * 3.0}" font-family="${font}" font-weight="400" font-size="${fs * 0.82}" fill="${o.label || P.ink}" text-anchor="middle" opacity=".8">ampy.se/bil</text>`;
}

// Ny registreringsskylt över den gamla.
export function skylt([x0, y0, x1, y1], nr) {
  const w = x1 - x0, h = y1 - y0;
  return `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${h * 0.08}" fill="#F7F7F5" stroke="#1A1A1A" stroke-width="${h * 0.035}"/>` +
    `<rect x="${x0 + h * 0.035}" y="${y0 + h * 0.035}" width="${h * 0.3}" height="${h - h * 0.07}" fill="#1C46B8"/>` +
    `<text x="${x0 + h * 0.185}" y="${y0 + h * 0.86}" font-family="Inter Tight" font-weight="700" font-size="${h * 0.22}" fill="#fff" text-anchor="middle">S</text>` +
    `<text x="${x0 + h * 0.3 + (w - h * 0.3) / 2}" y="${y0 + h * 0.76}" font-family="Inter Tight" font-weight="600" font-size="${h * 0.7}" fill="#111" text-anchor="middle" letter-spacing="${h * 0.04}">${nr}</text>`;
}
