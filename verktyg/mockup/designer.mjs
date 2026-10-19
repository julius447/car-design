// Tjugo Ampy-varianter, en per referens i referensbanken (03-referensbank/data.json).
// Varje design har sida(S, full) och bak(B, full). full = Transporter (helfoliering),
// annars Caddy (delfoliering). bas(full) anger lackfärgen för ytor utanför sidoplanen.
import { P, qrBlock, esc } from './hjalp.mjs';

// ---------- små byggstenar ----------
const kontrast = full => full ? P.white : P.ink;

function konturer(x0, y0, x1, y1, laddningar, nivaer, steg = 5) {
  // Ekvipotentiallinjer för punktladdningar, marching squares. Ger en path-d.
  const V = (x, y) => laddningar.reduce((s, [cx, cy, q]) => s + q / Math.max(8, Math.hypot(x - cx, y - cy)), 0);
  const nx = Math.ceil((x1 - x0) / steg), ny = Math.ceil((y1 - y0) / steg);
  const g = [];
  for (let j = 0; j <= ny; j++) { g.push([]); for (let i = 0; i <= nx; i++) g[j].push(V(x0 + i * steg, y0 + j * steg)); }
  let d = '';
  for (const lv of nivaer) {
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], e = g[j + 1][i];
      const pts = [];
      const kant = (va, vb, xa, ya, xb, yb) => {
        if ((va - lv) * (vb - lv) < 0) { const t = (lv - va) / (vb - va); pts.push([xa + t * (xb - xa), ya + t * (yb - ya)]); }
      };
      const X = x0 + i * steg, Y = y0 + j * steg;
      kant(a, b, X, Y, X + steg, Y); kant(b, c, X + steg, Y, X + steg, Y + steg);
      kant(c, e, X + steg, Y + steg, X, Y + steg); kant(e, a, X, Y + steg, X, Y);
      if (pts.length >= 2) d += `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}L${pts[1][0].toFixed(1)} ${pts[1][1].toFixed(1)}`;
      if (pts.length === 4) d += `M${pts[2][0].toFixed(1)} ${pts[2][1].toFixed(1)}L${pts[3][0].toFixed(1)} ${pts[3][1].toFixed(1)}`;
    }
  }
  return d;
}

// Mjuka ekvipotentiallinjer: laddningar med mjuk kärna plus ett svagt homogent fält,
// så att linjerna flyter över ytan som höjdkurvor i stället för att bilda ringar.
function falt(x0, y0, x1, y1, L, H) {
  const lad = L.map(([x, y, q]) => [x, y, q]);
  const Vf = (x, y) => 0.55 * (x - x0) / H + 0.35 * (y - y0) / H + lad.reduce((s, [cx, cy, q]) => s + q * 0.45 / Math.hypot((x - cx) / H, (y - cy) / H, 0.32), 0);
  const prov = [];
  for (let j = 0; j <= 20; j++) for (let i = 0; i <= 40; i++) prov.push(Vf(x0 + (x1 - x0) * i / 40, y0 + (y1 - y0) * j / 20));
  const lo = Math.min(...prov), hi = Math.max(...prov), n = 46;
  const niv = []; for (let i = 1; i < n; i++) niv.push(lo + (hi - lo) * i / n);
  const steg = Math.max(4, H / 120);
  const nx = Math.ceil((x1 - x0) / steg), ny = Math.ceil((y1 - y0) / steg);
  const g = []; for (let j = 0; j <= ny; j++) { g.push([]); for (let i = 0; i <= nx; i++) g[j].push(Vf(x0 + i * steg, y0 + j * steg)); }
  let d = '';
  for (const lv of niv) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], e = g[j + 1][i], X = x0 + i * steg, Y = y0 + j * steg, p = [];
    const k = (va, vb, xa, ya, xb, yb) => { if ((va - lv) * (vb - lv) < 0) { const t = (lv - va) / (vb - va); p.push([xa + t * (xb - xa), ya + t * (yb - ya)]); } };
    k(a, b, X, Y, X + steg, Y); k(b, c, X + steg, Y, X + steg, Y + steg); k(c, e, X + steg, Y + steg, X, Y + steg); k(e, a, X, Y + steg, X, Y);
    if (p.length >= 2) d += `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}L${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)}`;
    if (p.length === 4) d += `M${p[2][0].toFixed(1)} ${p[2][1].toFixed(1)}L${p[3][0].toFixed(1)} ${p[3][1].toFixed(1)}`;
  }
  return d;
}

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- designerna ----------
export const DESIGNER = [

  // 01 Stephenson Lithograph: en enda bokstav i arkitekturskala.
  {
    nr: 1, ref: 85, id: 'monogram', namn: 'Monogram',
    ide: 'Ett enda a i en storlek som får bilens kanter att skära av det. Namnet sitter litet på förardörren.',
    bas: full => full ? P.ink : null,
    sida(S, full) {
      const fg = kontrast(full);
      return (full ? S.base(P.ink) : '') +
        S.text(0.79, 0.53, 'a', { font: 'Unbounded', weight: 700, size: 1.55, fill: fg, align: 'middle', baseline: 'middle' }) +
        S.text(S.tdf + (S.tb - S.tdf) * 0.14, 0.74, 'ampy', { font: 'Unbounded', weight: 600, size: 0.085, fill: fg }) +
        S.text(S.tb + 0.025, 0.09, 'ampy.se', { font: 'JetBrains Mono', weight: 500, size: 0.032, fill: fg, baseline: 'hanging' });
    },
    bak(B, full) {
      const fg = kontrast(full);
      return (full ? B.base(P.ink) : '') +
        B.text(0.17, 0.60, 'a', { font: 'Unbounded', weight: 700, size: 0.95, fill: fg, anchor: 'middle', baseline: 'middle' }) +
        qrBlock(B, { id: 1, bil: full ? 't' : 'c', u: 0.76, v: 0.16, fg: P.ink, bg: P.white, label: fg, font: 'Unbounded', w1: 500 });
    },
  },

  // 02 Elhapé: ett jättelikt beskuret p i en färg som bär namnet.
  {
    nr: 2, ref: 104, id: 'ogla', namn: 'Öglan',
    ide: 'Ett p i signalorange, så stort att bara öglan och skaftet syns. Delfolierad Caddy ser helfolierad ut.',
    bas: full => full ? P.signal : null,
    sida(S, full) {
      const fg = full ? P.white : P.signal;
      const ord = full ? P.white : P.ink;
      return (full ? S.base(P.signal) : '') +
        S.text(0.70, 0.82, 'p', { font: 'Bricolage Grotesque', weight: 800, size: 1.95, fill: fg }) +
        S.text(S.tb + 0.03, 0.40, 'ampy', { font: 'Bricolage Grotesque', weight: 800, size: 0.15, fill: ord }) +
        S.text(S.tb + 0.032, 0.52, 'ampy.se', { font: 'Bricolage Grotesque', weight: 500, size: 0.04, fill: ord });
    },
    bak(B, full) {
      const fg = full ? P.white : P.signal;
      return (full ? B.base(P.signal) : '') +
        B.text(-0.08, 0.95, 'p', { font: 'Bricolage Grotesque', weight: 800, size: 1.25, fill: fg }) +
        qrBlock(B, { id: 2, bil: full ? 't' : 'c', u: 0.76, v: 0.16, fg: P.ink, bg: P.white, label: full ? P.white : P.ink, font: 'Bricolage Grotesque', w1: 700 });
    },
  },

  // 03 CCO: namnets bokstäver isärplockade till geometriska delar.
  {
    nr: 3, ref: 91, id: 'konstruktion', namn: 'Konstruktion',
    ide: 'Bokstäverna i ampy plockade isär till cirklar, bågar och skaft, beskurna av bakkanten.',
    bas: full => full ? P.ink : null,
    sida(S, full) {
      const fg = kontrast(full), H = S.H, d = S.d;
      const ring = (t, s, r, w) => `<circle cx="${S.X(t)}" cy="${S.Y(s)}" r="${r * H}" fill="none" stroke="${fg}" stroke-width="${w * H}"/>`;
      const halv = (t, s, r) => { const x = S.X(t), y = S.Y(s), R = r * H; return `<path d="M${x - R} ${y} A${R} ${R} 0 0 1 ${x + R} ${y} Z" fill="${fg}"/>`; };
      const stam = (t, s0, s1, w) => S.rect(t, s0, t + d * 0 + w * H / S.len, s1, fg);
      return (full ? S.base(P.ink) : '') +
        ring(0.93, 0.18, 0.40, 0.20) +
        halv(0.70, 0.98, 0.30) +
        stam(0.775, 0.30, 1.2, 0.16) +
        `<circle cx="${S.X(0.635)}" cy="${S.Y(0.30)}" r="${0.075 * H}" fill="${fg}"/>` +
        S.text(S.tb + 0.025, 0.40, 'ampy', { font: 'Inter Tight', weight: 700, size: 0.075, fill: fg }) +
        S.text(S.tb + 0.025, 0.47, 'El för det moderna hemmet', { font: 'Inter Tight', weight: 400, size: 0.03, fill: fg });
    },
    bak(B, full) {
      const fg = kontrast(full), H = B.H;
      return (full ? B.base(P.ink) : '') +
        `<circle cx="${B.U(0.06)}" cy="${B.V(0.30)}" r="${0.30 * H}" fill="none" stroke="${fg}" stroke-width="${0.13 * H}"/>` +
        B.rect(0.30, 0.62, 0.40, 1.1, fg) +
        qrBlock(B, { id: 3, bil: full ? 't' : 'c', u: 0.76, v: 0.16, fg: P.ink, bg: P.white, label: fg });
    },
  },

  // 04 Actnova: en avskuren jätteform och saklig liten text. Känns som ett labb.
  {
    nr: 4, ref: 2664, id: 'labb', namn: 'Labbet',
    ide: 'Ett a byggt av ett skaft och en ögla i svart, beskuret av tröskeln. Saklig text i liten storlek.',
    bas: full => full ? P.fog : null,
    sida(S, full) {
      const H = S.H, x = S.X(0.84), y = S.Y(0.80), R = 0.46 * H, r = 0.20 * H, w = 0.30 * H;
      const xs = S.d === 1 ? x : x - w;
      const bowlX = S.d === 1 ? x : x;
      return (full ? S.base(P.fog) : '') +
        `<rect x="${xs}" y="${S.Y(0.12)}" width="${w}" height="${H * 1.2}" fill="${P.ink}"/>` +
        `<path d="M${bowlX} ${y - R} A${R} ${R} 0 1 0 ${bowlX} ${y + R} Z M${bowlX} ${y - r} A${r} ${r} 0 1 1 ${bowlX} ${y + r} Z" fill="${P.ink}" fill-rule="evenodd" transform="${S.d === 1 ? '' : `translate(${2 * bowlX} 0) scale(-1 1)`}"/>` +
        S.text(S.tb + 0.03, 0.27, 'ampy', { font: 'Inter Tight', weight: 600, size: 0.19, fill: P.ink, ls: -0.03 }) +
        S.text(S.tb + 0.034, 0.37, 'Elinstallation, laddbox och batteri', { font: 'JetBrains Mono', weight: 500, size: 0.026, fill: P.ink }) +
        S.text(S.tb + 0.034, 0.42, 'Stockholm · ampy.se', { font: 'JetBrains Mono', weight: 500, size: 0.026, fill: P.ink });
    },
    bak(B, full) {
      return (full ? B.base(P.fog) : '') +
        B.rect(0.0, 0.0, 0.14, 1.1, P.ink) +
        B.text(0.20, 0.14, 'ampy', { font: 'Inter Tight', weight: 600, size: 0.12, fill: P.ink, ls: -0.03, baseline: 'hanging' }) +
        B.text(0.205, 0.30, 'Elinstallation · Stockholm', { font: 'JetBrains Mono', weight: 500, size: 0.022, fill: P.ink }) +
        qrBlock(B, { id: 4, bil: full ? 't' : 'c', u: 0.77, v: 0.14, fg: P.ink, bg: P.white, label: P.ink, font: 'JetBrains Mono', w1: 500 });
    },
  },

  // 05 Tesla Mobile Service: vit bil, ett band, ett glest ordmärke.
  {
    nr: 5, ref: 773, id: 'bandet', namn: 'Bandet',
    ide: 'Vit bil, ett elblått band precis bakom B-stolpen och ett glest ordmärke. Billigast av alla, för båda bilarna.',
    bas: () => null,
    sida(S) {
      const t0 = S.tb + 0.012, t1 = S.tb + 0.115;
      return S.rect(t0, -0.2, t1, 1.2, P.elec) +
        S.text((t0 + t1) / 2, 0.36, 'a', { font: 'Inter Tight', weight: 800, size: 0.16, fill: P.white, align: 'middle', baseline: 'middle' }) +
        S.text(0.62, 0.36, 'AMPY', { font: 'Inter Tight', weight: 500, size: 0.052, fill: P.elec, ls: 0.62, baseline: 'middle' }) +
        S.text(0.62, 0.43, 'ELSERVICE', { font: 'Inter Tight', weight: 500, size: 0.022, fill: P.ink, ls: 0.45, baseline: 'middle' });
    },
    bak(B, full) {
      return B.rect(B.useam + 0.012, -0.1, B.useam + 0.09, 1.1, P.elec) +
        B.text(0.08, 0.12, 'AMPY', { font: 'Inter Tight', weight: 500, size: 0.045, fill: P.elec, ls: 0.6, baseline: 'hanging' }) +
        qrBlock(B, { id: 5, bil: full ? 't' : 'c', u: 0.79, v: 0.15, size: 0.21, fg: P.ink, bg: P.white, label: P.ink, w1: 500 });
    },
  },

  // 06 Rivian: vit bil och ett illustrerat fält. Villan i skymning.
  {
    nr: 6, ref: 842, id: 'skymning', namn: 'Skymning',
    ide: 'Ett illustrerat fält med en villa i skymning och tänt ljus i fönstren. Transportern får hela panoramat, Caddyn en remsa bak.',
    bas: () => null,
    sida(S, full) {
      const t0 = full ? S.tb + 0.01 : 0.80;
      const xa = Math.min(S.X(t0), S.X(1.02)), xb = Math.max(S.X(t0), S.X(1.02));
      const ill = skymningSvg(xa, S.Y(-0.1), xb - xa, S.H * 1.2, full ? 'panorama' : 'remsa');
      const ord = full
        ? S.text(t0 + 0.03, 0.17, 'AMPY', { font: 'Unbounded', weight: 500, size: 0.07, fill: P.white, ls: 0.28, baseline: 'middle' })
        : S.text(S.tb + 0.03, 0.40, 'AMPY', { font: 'Unbounded', weight: 500, size: 0.07, fill: P.navy, ls: 0.28, baseline: 'middle' }) +
          S.text(S.tb + 0.031, 0.47, 'Elektriker för villan', { font: 'Inter Tight', weight: 500, size: 0.03, fill: P.navy, baseline: 'middle' });
      return ill + ord;
    },
    bak(B, full) {
      const ill = full ? skymningSvg(B.U(-0.05), B.V(-0.05), B.W * 1.1, B.H * 0.62, 'panorama') + B.rect(-0.1, 0.565, 1.1, 1.2, '#0B0E24')
        : skymningSvg(B.U(-0.05), B.V(-0.05), B.W * (B.useam + 0.05), B.H * 0.62, 'remsa') + B.rect(-0.1, 0.565, B.useam, 1.2, '#0B0E24');
      return ill + qrBlock(B, { id: 6, bil: full ? 't' : 'c', u: 0.77, v: 0.15, fg: P.navy, bg: P.white, label: full ? P.white : P.navy, w1: 600 });
    },
  },

  // 07 Polestar: liten teknisk text direkt på karossen.
  {
    nr: 7, ref: 921, id: 'ingenjor', namn: 'Ingenjören',
    ide: 'Nästan ingenting. Ett litet ordmärke och teknisk text i liten storlek, som en specifikation på karossen.',
    bas: full => full ? P.thunder : null,
    sida(S, full) {
      const fg = kontrast(full);
      const t = 0.66, s = 0.66, line = S.H * 0.002 + 1.5;
      const x = S.X(t), y = S.Y(s);
      const w = S.H * 0.08, xr = S.d === 1 ? x : x - w;
      return (full ? S.base(P.thunder) : '') +
        S.text(S.tdf + (S.tb - S.tdf) * 0.14, 0.64, 'ampy', { font: 'Inter Tight', weight: 500, size: 0.065, fill: fg, ls: 0.02 }) +
        S.text(t, s, 'Ampy Elservice', { font: 'Inter Tight', weight: 500, size: 0.046, fill: fg }) +
        `<rect x="${xr}" y="${y + S.H * 0.028}" width="${w}" height="${line}" fill="${fg}"/>` +
        S.text(t, s + 0.10, 'Laddbox 11 kW / Batteri 10 kWh', { font: 'Inter Tight', weight: 400, size: 0.034, fill: fg });
    },
    bak(B, full) {
      const fg = kontrast(full);
      return (full ? B.base(P.thunder) : '') +
        B.text(0.07, 0.86, 'Ampy Elservice', { font: 'Inter Tight', weight: 500, size: 0.03, fill: fg }) +
        B.text(0.07, 0.90, '3 000 installationer per år', { font: 'Inter Tight', weight: 400, size: 0.022, fill: fg }) +
        qrBlock(B, { id: 7, bil: full ? 't' : 'c', u: 0.80, v: 0.18, size: 0.19, fg: P.ink, bg: P.white, label: fg, w1: 500 });
    },
  },

  // 08 Porsche Renndienst: hel färg och vit text, inget mer.
  {
    nr: 8, ref: 2133, id: 'servicefarg', namn: 'Servicefärgen',
    ide: 'En egen röd servicefärg och vit text med luft mellan bokstäverna, som en verkstadsbil från ett biltillverkarteam.',
    bas: full => full ? P.red : null,
    sida(S, full) {
      const roda = full ? S.base(P.red) : S.rect(S.tb, -0.2, 1.1, 1.2, P.red);
      return roda +
        S.text(S.tb + 0.035, 0.22, 'AMPY', { font: 'Unbounded', weight: 600, size: 0.095, fill: P.white, ls: 0.32, baseline: 'middle' }) +
        S.text(S.tdf + (S.tb - S.tdf) * 0.12, 0.68, 'ELSERVICE', { font: 'Inter Tight', weight: 600, size: 0.038, fill: full ? P.white : P.red, ls: 0.22 }) +
        S.text(S.tdf + (S.tb - S.tdf) * 0.12, 0.74, 'Stockholm', { font: 'Inter Tight', weight: 400, size: 0.03, fill: full ? P.white : P.red });
    },
    bak(B, full) {
      return B.base(P.red) +
        B.text(0.5, 0.13, 'AMPY', { font: 'Unbounded', weight: 600, size: 0.07, fill: P.white, ls: 0.32, anchor: 'middle', baseline: 'middle' }) +
        qrBlock(B, { id: 8, bil: full ? 't' : 'c', u: 0.76, v: 0.26, size: 0.21, fg: P.red, bg: P.white, label: P.white, w1: 500 });
    },
  },

  // 09 Wild: grafit och ett stort vitt ordmärke.
  {
    nr: 9, ref: 551, id: 'grafit', namn: 'Grafit',
    ide: 'Grafitgrå bil och ett stort ordmärke i vitt. Allt hänger på typsnittet.',
    bas: full => full ? P.graphite : null,
    sida(S, full) {
      const fg = full ? P.white : P.graphite;
      return (full ? S.base(P.graphite) : '') +
        S.text(S.tb + 0.03, 0.66, 'ampy', { font: 'Manrope', weight: 800, size: Math.min(0.46, Math.abs(S.X(1) - S.X(S.tb)) * 0.86 / 2.45 / S.H), fill: fg, ls: -0.045 }) +
        S.text(0.975, 0.16, 'Gjort ordentligt.', { font: 'Manrope', weight: 600, size: 0.042, fill: fg, align: 'rear', baseline: 'hanging' });
    },
    bak(B, full) {
      const fg = full ? P.white : P.graphite;
      return (full ? B.base(P.graphite) : '') +
        B.text(0.07, 0.40, 'ampy', { font: 'Manrope', weight: 800, size: 0.20, fill: fg, ls: -0.045 }) +
        qrBlock(B, { id: 9, bil: full ? 't' : 'c', u: 0.77, v: 0.15, fg: P.graphite, bg: P.white, label: fg, font: 'Manrope', w1: 700 });
    },
  },

  // 10 Roft: svart bil, ordmärke och ett grafiskt fält vid tröskeln.
  {
    nr: 10, ref: 1123, id: 'troskel', namn: 'Tröskeln',
    ide: 'Svart bil och vitt ordmärke. Längs tröskeln en rad staplar som stiger mot en neongrön, som en laddning som blir klar.',
    bas: full => full ? P.ink : null,
    sida(S, full) {
      const fg = kontrast(full);
      let bars = '';
      const n = 6, t0 = S.tb + 0.02, w = 0.032, gap = 0.012;
      for (let i = 0; i < n; i++) {
        const t = t0 + i * (w + gap), h = 0.07 + i * 0.045;
        bars += S.rect(t, 0.97 - h, t + w, 0.97, i === n - 1 ? P.volt : fg);
      }
      return (full ? S.base(P.ink) : S.rect(S.tb, 0.60, 1.1, 1.2, P.ink)) +
        (full ? '' : S.rect(S.tb, 0.60, 1.1, 0.60, P.ink)) +
        S.text(S.tb + 0.03, 0.30, 'ampy', { font: 'Bricolage Grotesque', weight: 800, size: 0.22, fill: full ? P.white : P.ink, ls: -0.03 }) +
        S.text(0.975, 0.30, 'ampy.se', { font: 'Bricolage Grotesque', weight: 500, size: 0.035, fill: full ? P.white : P.ink, align: 'rear' }) +
        bars.replaceAll(fg, P.white);
    },
    bak(B, full) {
      let bars = '';
      for (let i = 0; i < 6; i++) { const u = 0.06 + i * 0.045, h = 0.05 + i * 0.03; bars += B.rect(u, 0.93 - h, u + 0.032, 0.93, i === 5 ? P.volt : P.white); }
      return (full ? B.base(P.ink) : B.rect(0, 0.62, 1, 1.1, P.ink)) + bars +
        B.text(0.06, 0.12, 'ampy', { font: 'Bricolage Grotesque', weight: 800, size: 0.11, fill: full ? P.white : P.ink, baseline: 'hanging' }) +
        qrBlock(B, { id: 10, bil: full ? 't' : 'c', u: 0.77, v: 0.13, size: 0.22, fg: P.ink, bg: P.white, label: full ? P.white : P.ink, font: 'Bricolage Grotesque', w1: 700 });
    },
  },

  // 11 Van Uhm: diagonal delning och staplat ordmärke.
  {
    nr: 11, ref: 220, id: 'diagonal', namn: 'Diagonalen',
    ide: 'En diagonal delar bilen i vitt och elblått. Staplat ordmärke på den blå delen, så att en rad bilar blir ett mönster.',
    bas: () => null,
    sida(S, full) {
      const a = full ? S.tb - 0.12 : S.tb - 0.02, b = full ? 0.70 : 0.84;
      return S.poly([[a, 1.25], [b, -0.25], [1.2, -0.25], [1.2, 1.25]], P.elec) +
        S.text(0.885, 0.40, 'am', { font: 'Inter Tight', weight: 800, size: 0.30, fill: P.white, align: 'middle', ls: -0.04 }) +
        S.text(0.885, 0.68, 'py', { font: 'Inter Tight', weight: 800, size: 0.30, fill: P.white, align: 'middle', ls: -0.04 }) +
        S.text(S.tb + 0.025, 0.42, 'El för hemmet, gjort ordentligt', { font: 'Inter Tight', weight: 500, size: 0.032, fill: P.ink });
    },
    bak(B, full) {
      return B.base(P.elec) +
        B.text(0.24, 0.30, 'am', { font: 'Inter Tight', weight: 800, size: 0.20, fill: P.white, anchor: 'middle', ls: -0.04 }) +
        B.text(0.24, 0.50, 'py', { font: 'Inter Tight', weight: 800, size: 0.20, fill: P.white, anchor: 'middle', ls: -0.04 }) +
        qrBlock(B, { id: 11, bil: full ? 't' : 'c', u: 0.77, v: 0.15, fg: P.elec, bg: P.white, label: P.white, w1: 700 });
    },
  },

  // 12 Palfinger: en enda jättelik pil.
  {
    nr: 12, ref: 22, id: 'uppgradering', namn: 'Uppgraderingen',
    ide: 'En jättelik pil i signalorange som pekar uppåt och framåt. Ett budskap utan ord: elen blir bättre.',
    bas: full => full ? P.ink : null,
    sida(S, full) {
      const w = 0.17 * S.H;
      const tip = [S.X(0.60), S.Y(0.10)];
      const arm1 = [S.X(0.86), S.Y(0.10)], arm2 = [S.X(0.60), S.Y(0.66)], tail = [S.X(1.25), S.Y(1.5)];
      const p = (a, b) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="${P.signal}" stroke-width="${w}" stroke-linecap="butt"/>`;
      const fg = kontrast(full);
      return (full ? S.base(P.ink) : '') +
        `<path d="M${arm1[0]} ${arm1[1]} L${tip[0]} ${tip[1]} L${arm2[0]} ${arm2[1]}" fill="none" stroke="${P.signal}" stroke-width="${w}" stroke-linejoin="miter" stroke-miterlimit="10"/>` +
        p([tip[0] + S.d * w * 0.3, tip[1] + w * 0.3], tail) +
        S.text(0.975, 0.30, 'ampy', { font: 'Inter Tight', weight: 700, size: 0.10, fill: fg, align: 'rear' }) +
        S.text(0.975, 0.37, 'Elen, uppgraderad.', { font: 'Inter Tight', weight: 500, size: 0.035, fill: fg, align: 'rear' });
    },
    bak(B, full) {
      const w = 0.12 * B.H;
      return (full ? B.base(P.ink) : '') +
        `<path d="M${B.U(0.34)} ${B.V(0.14)} L${B.U(0.10)} ${B.V(0.14)} L${B.U(0.10)} ${B.V(0.50)} M${B.U(0.12)} ${B.V(0.16)} L${B.U(0.62)} ${B.V(1.2)}" fill="none" stroke="${P.signal}" stroke-width="${w}"/>` +
        qrBlock(B, { id: 12, bil: full ? 't' : 'c', u: 0.79, v: 0.14, size: 0.21, fg: P.ink, bg: P.white, label: kontrast(full), w1: 700 });
    },
  },

  // 13 Starbucks: en mjuk kurva i två färger.
  {
    nr: 13, ref: 198, id: 'kurvan', namn: 'Kurvan',
    ide: 'En mjuk kurva lyfter från fronten mot taket bak. Djupgrönt över, svart under. Caddyn får bara den gröna kurvan.',
    bas: full => full ? P.ink : null,
    sida(S, full) {
      const k = [[-0.1, 0.78], [0.30, 0.80], [S.tb, 0.62], [0.78, 0.18], [1.2, -0.05]];
      const c = (t, s) => `${S.X(t)} ${S.Y(s)}`;
      const kurva = `M${c(-0.1, 0.80)} C${c(0.30, 0.82)} ${c(0.42, 0.78)} ${c(S.tb, 0.58)} S${c(0.86, -0.02)} ${c(1.2, -0.08)}`;
      const gron = `<path d="${kurva} L${c(1.2, -0.5)} L${c(-0.1, -0.5)} Z" fill="${P.forest}"/>`;
      const gronDel = `<path d="M${c(S.tb - 0.02, 1.3)} C${c(S.tb + 0.06, 0.70)} ${c(0.74, 0.12)} ${c(1.2, -0.08)} L${c(1.2, 1.3)} Z" fill="${P.forest}"/>`;
      const t0 = full ? S.tb - 0.22 : S.tb - 0.02;
      const del = `<path d="M${c(t0, 1.3)} C${c(t0 + 0.10, 0.62)} ${c(0.70, 0.10)} ${c(1.2, -0.08)} L${c(1.2, 1.3)} Z" fill="${P.forest}"/>`;
      return (full ? S.base(P.ink) + del : del) +
        S.text(0.82, 0.62, 'ampy', { font: 'Familjen Grotesk', weight: 700, size: 0.15, fill: P.white, align: 'middle' });
    },
    bak(B, full) {
      const kur = `M${B.U(-0.1)} ${B.V(0.75)} C${B.U(0.35)} ${B.V(0.80)} ${B.U(0.60)} ${B.V(0.30)} ${B.U(1.1)} ${B.V(0.10)} L${B.U(1.1)} ${B.V(1.2)} L${B.U(-0.1)} ${B.V(1.2)} Z`;
      return (full ? B.base(P.ink) : '') + `<path d="${kur}" fill="${P.forest}"/>` +
        qrBlock(B, { id: 13, bil: full ? 't' : 'c', u: 0.77, v: 0.10, size: 0.22, fg: P.forest, bg: P.white, label: full ? P.white : P.forest, font: 'Familjen Grotesk', w1: 700 });
    },
  },

  // 14 Rothmans Porsche: ränder i midjan.
  {
    nr: 14, ref: 2124, id: 'rander', namn: 'Ränderna',
    ide: 'Vitt upptill, marinblått nedtill och två ränder i midjan: elblått och signalorange. Caddyn får bara ränderna.',
    bas: full => full ? P.white : null,
    sida(S, full) {
      const s0 = 0.56;
      return (full ? S.rect(-0.2, s0, 1.2, 1.4, P.navy) : '') +
        S.rect(-0.2, s0 - 0.075, 1.2, s0 - 0.035, P.elec) +
        S.rect(-0.2, s0 - 0.022, 1.2, s0 - 0.004, P.signal) +
        S.text(S.tb + 0.03, 0.32, 'AMPY', { font: 'Unbounded', weight: 700, size: 0.11, fill: P.navy, ls: 0.06 }) +
        S.text(S.tb + 0.032, 0.40, 'Elservice · Stockholm', { font: 'Inter Tight', weight: 600, size: 0.032, fill: P.navy });
    },
    bak(B, full) {
      return (full ? B.rect(-0.1, 0.62, 1.1, 1.2, P.navy) : '') +
        B.rect(-0.1, 0.565, 1.1, 0.59, P.elec) + B.rect(-0.1, 0.60, 1.1, 0.612, P.signal) +
        B.text(0.07, 0.13, 'AMPY', { font: 'Unbounded', weight: 700, size: 0.075, fill: P.navy, ls: 0.06, baseline: 'hanging' }) +
        qrBlock(B, { id: 14, bil: full ? 't' : 'c', u: 0.77, v: 0.10, size: 0.21, fg: P.navy, bg: P.white, label: P.navy, w1: 600 });
    },
  },

  // 15 Tulachky: tunna linjer över hela bilen. Här ekvipotentiallinjer, alltså fysik.
  {
    nr: 15, ref: 547, id: 'faltlinjer', namn: 'Fältlinjerna',
    ide: 'Djupgrön bil med tunna vita linjer. Det är ekvipotentiallinjer runt elektriska laddningar, alltså riktig fysik och inte dekor.',
    bas: full => full ? P.forest : null,
    sida(S, full) {
      const H = S.H, xa = Math.min(S.X(-0.05), S.X(1.05)), xb = Math.max(S.X(-0.05), S.X(1.05));
      const L = [[S.X(0.34), S.Y(0.35), 1], [S.X(0.72), S.Y(0.80), -1.1], [S.X(0.92), S.Y(0.15), 0.8], [S.X(0.10), S.Y(1.0), -0.7]];
      const d = falt(xa, S.Y(-0.2), xb, S.Y(1.25), L, H);
      const linjer = `<path d="${d}" fill="none" stroke="${full ? P.white : P.forest}" stroke-width="${Math.max(1.6, H * 0.0042)}" stroke-linecap="round" opacity="${full ? 0.9 : 1}"/>`;
      const klipp = full ? linjer : `<clipPath id="k15"><rect x="${Math.min(S.X(S.tb), S.X(1.2))}" y="0" width="${Math.abs(S.X(1.2) - S.X(S.tb))}" height="5000"/></clipPath><g clip-path="url(#k15)">${linjer}</g>`;
      return (full ? S.base(P.forest) : '') + klipp +
        S.text(S.tb + 0.03, 0.30, 'AMPY', { font: 'Schibsted Grotesk', weight: 800, size: 0.12, fill: full ? P.white : P.forest, ls: 0.02 });
    },
    bak(B, full) {
      const L = [[B.U(0.25), B.V(0.35), 1], [B.U(0.70), B.V(0.80), -1.0], [B.U(0.95), B.V(0.05), 0.6]];
      const d = falt(B.U(-0.05), B.V(-0.05), B.U(1.05), B.V(1.1), L, B.H * 0.9);
      return (full ? B.base(P.forest) : '') +
        `<path d="${d}" fill="none" stroke="${full ? P.white : P.forest}" stroke-width="${Math.max(1.6, B.H * 0.003)}" opacity="${full ? 0.9 : 1}"/>` +
        qrBlock(B, { id: 15, bil: full ? 't' : 'c', u: 0.77, v: 0.14, fg: P.forest, bg: P.white, label: full ? P.white : P.forest, font: 'Schibsted Grotesk', w1: 700 });
    },
  },

  // 16 Dashwood: streck som tillsammans bildar en form.
  {
    nr: 16, ref: 1144, id: 'streck', namn: 'Strecken',
    ide: 'Ett jättelikt a byggt av turkosa streck på en stålgrå bil. Rörelse utan att bli plottrigt.',
    bas: full => full ? '#5B6168' : null,
    sida(S, full) {
      const H = S.H, r = rng(16);
      const xa = Math.min(S.X(S.tb), S.X(1.1)), xb = Math.max(S.X(S.tb), S.X(1.1));
      let st = '';
      const hh = 0.028 * H;
      for (let y = S.Y(-0.2); y < S.Y(1.2); y += hh * 2) {
        let x = xa - r() * 80;
        while (x < xb) { const l = (0.06 + r() * 0.22) * H; st += `<rect x="${x}" y="${y}" width="${l}" height="${hh}" rx="${hh / 2}"/>`; x += l + (0.03 + r() * 0.06) * H; }
      }
      const fg = full ? P.white : P.ink;
      return (full ? S.base('#5B6168') : '') +
        `<clipPath id="k16"><text x="${S.X(0.80)}" y="${S.Y(0.52)}" font-family="Inter Tight" font-weight="800" font-size="${1.45 * H}" text-anchor="middle" dominant-baseline="middle">a</text></clipPath>` +
        `<g clip-path="url(#k16)" fill="${P.teal}">${st}</g>` +
        S.text(S.tb + 0.025, 0.24, 'A M P Y', { font: 'Inter Tight', weight: 500, size: 0.07, fill: fg, ls: 0.12 }) +
        S.text(S.tb + 0.026, 0.31, 'Elservice', { font: 'Inter Tight', weight: 400, size: 0.034, fill: fg });
    },
    bak(B, full) {
      const r = rng(7); let st = ''; const hh = 0.025 * B.H;
      for (let y = B.V(0); y < B.V(1.1); y += hh * 2) { let x = B.U(-0.05); while (x < B.U(B.useam - 0.02)) { const l = (0.04 + r() * 0.16) * B.H; st += `<rect x="${x}" y="${y}" width="${l}" height="${hh}" rx="${hh / 2}"/>`; x += l + (0.02 + r() * 0.05) * B.H; } }
      return (full ? B.base('#5B6168') : '') +
        `<clipPath id="k16b"><text x="${B.U(0.25)}" y="${B.V(0.55)}" font-family="Inter Tight" font-weight="800" font-size="${0.85 * B.H}" text-anchor="middle" dominant-baseline="middle">a</text></clipPath><g clip-path="url(#k16b)" fill="${P.teal}">${st}</g>` +
        qrBlock(B, { id: 16, bil: full ? 't' : 'c', u: 0.77, v: 0.15, fg: P.ink, bg: P.white, label: full ? P.white : P.ink, w1: 500 });
    },
  },

  // 17 Green Pack: koncentriska bågar, som energi som strålar ut.
  {
    nr: 17, ref: 1, id: 'vagor', namn: 'Vågorna',
    ide: 'Koncentriska bågar strålar ut från bakhörnet i två blå toner. Fungerar på allt från Caddy till lastbil.',
    bas: full => full ? P.navy : null,
    sida(S, full) {
      const cx = S.X(1.02), cy = S.Y(1.02), H = S.H;
      let ar = '';
      for (let i = 0; i < 9; i++) {
        const r = (0.14 + i * 0.125) * H;
        ar += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${i % 2 ? (full ? P.sky : P.elec) : P.elec}" stroke-width="${0.05 * H}" opacity="${full ? 1 : 1 - i * 0.04}"/>`;
      }
      const fg = full ? P.white : P.navy;
      return (full ? S.base(P.navy) : '') + ar +
        S.text(S.tb + 0.03, 0.30, 'ampy', { font: 'Space Grotesk', weight: 700, size: 0.13, fill: fg, ls: -0.03 }) +
        S.text(S.tb + 0.031, 0.37, 'Laddbox, batteri och elservice', { font: 'Space Grotesk', weight: 500, size: 0.032, fill: fg });
    },
    bak(B, full) {
      const cx = B.U(0), cy = B.V(1.02); let ar = '';
      for (let i = 0; i < 7; i++) ar += `<circle cx="${cx}" cy="${cy}" r="${(0.12 + i * 0.1) * B.H}" fill="none" stroke="${i % 2 ? (full ? P.sky : P.elec) : P.elec}" stroke-width="${0.04 * B.H}"/>`;
      return (full ? B.base(P.navy) : '') + ar +
        qrBlock(B, { id: 17, bil: full ? 't' : 'c', u: 0.77, v: 0.14, fg: P.navy, bg: P.white, label: full ? P.white : P.navy, font: 'Space Grotesk', w1: 700 });
    },
  },

  // 18 Cilsa: namnet i jätteformat är hela grafiken.
  {
    nr: 18, ref: 2706, id: 'jattetypo', namn: 'Jättetypografi',
    ide: 'Namnet i en storlek som fyller hela sidan och skärs av vid tröskeln. Inga symboler, inga ord till.',
    bas: full => full ? P.signal : null,
    sida(S, full) {
      return (full ? S.base(P.signal) : '') +
        S.text(full ? 0.06 : 0.07, 0.97, 'ampy', { font: 'Archivo Black', weight: 400, size: 0.98, fill: P.ink, ls: -0.06 });
    },
    bak(B, full) {
      return (full ? B.base(P.signal) : '') +
        B.text(0.5, 0.95, 'ampy', { font: 'Archivo Black', weight: 400, size: 0.62, fill: P.ink, anchor: 'middle', ls: -0.06 }) +
        qrBlock(B, { id: 18, bil: full ? 't' : 'c', u: 0.80, v: 0.06, size: 0.20, fg: P.ink, bg: P.white, label: P.ink, font: 'Archivo Black', w1: 400 });
    },
  },

  // 19 Hirsch: schweizisk typografi där en lista blir vacker.
  {
    nr: 19, ref: 2714, id: 'schweiz', namn: 'Schweiz',
    ide: 'Två spalter i strikt typografi: namnet till vänster, fyra ord till höger. Om tjänsterna ska stå på bilen är det här enda sättet.',
    bas: full => full ? P.ink : null,
    sida(S, full) {
      const a = full ? P.white : P.ink, b = full ? '#8D9096' : '#8D9096';
      const t1 = S.tb + 0.03, t2 = S.tb + (1 - S.tb) * 0.50;
      const ord = ['elservice', 'laddbox', 'batteri', 'stockholm'];
      return (full ? S.base(P.ink) : '') +
        S.text(t1, 0.33, 'ampy', { font: 'Inter Tight', weight: 700, size: 0.20, fill: a, ls: -0.04 }) +
        ord.map((w, i) => S.text(t2, 0.17 + i * 0.105, w, { font: 'Inter Tight', weight: 700, size: 0.095, fill: i === 0 ? a : b, ls: -0.03 })).join('');
    },
    bak(B, full) {
      const a = full ? P.white : P.ink;
      return (full ? B.base(P.ink) : '') +
        B.text(0.07, 0.20, 'ampy', { font: 'Inter Tight', weight: 700, size: 0.11, fill: a, ls: -0.04 }) +
        ['elservice', 'laddbox', 'batteri'].map((w, i) => B.text(0.07, 0.30 + i * 0.065, w, { font: 'Inter Tight', weight: 700, size: 0.055, fill: '#8D9096', ls: -0.03 })).join('') +
        qrBlock(B, { id: 19, bil: full ? 't' : 'c', u: 0.77, v: 0.15, fg: P.ink, bg: P.white, label: a, w1: 700 });
    },
  },

  // 20 Merchlab: bokstäver som rullar över sidan och runt hörnet.
  {
    nr: 20, ref: 2705, id: 'rullar', namn: 'Rullande',
    ide: 'Namnet i gemener som rullar upp över sidan och viker av runt bakhörnet. Personlighet utan illustration.',
    bas: full => full ? P.ink : null,
    sida(S, full) {
      const fg = full ? P.paper : P.ink, H = S.H;
      const pos = [[0.56, 0.98, -8], [0.70, 0.84, -14], [0.86, 0.62, -20], [1.0, 0.42, -26]];
      const ord = S.d === 1 ? pos : [...pos].reverse();
      const b = 'ampy'.split('').map((c, i) => [c, ...ord[i]]);
      return (full ? S.base(P.ink) : '') + b.map(([c, t, s, rot]) => {
        const x = S.X(t), y = S.Y(s);
        return `<text x="${x}" y="${y}" font-family="Sora" font-weight="700" font-size="${0.62 * H}" fill="${fg}" text-anchor="middle" transform="rotate(${rot * S.d} ${x} ${y})">${c}</text>`;
      }).join('') +
        S.text(S.tb + 0.025, 0.14, 'ampy.se', { font: 'Sora', weight: 500, size: 0.035, fill: fg, baseline: 'hanging' });
    },
    bak(B, full) {
      const fg = full ? P.paper : P.ink;
      return (full ? B.base(P.ink) : '') +
        `<text x="${B.U(0.27)}" y="${B.V(0.50)}" font-family="Sora" font-weight="700" font-size="${0.75 * B.H}" fill="${fg}" text-anchor="middle" transform="rotate(-24 ${B.U(0.27)} ${B.V(0.50)})">y</text>` +
        qrBlock(B, { id: 20, bil: full ? 't' : 'c', u: 0.77, v: 0.15, fg: P.ink, bg: P.white, label: fg, font: 'Sora', w1: 600 });
    },
  },
];

// Villa i skymning, ritad i en egen ruta. 'panorama' är brett, 'remsa' smalt.
function skymningSvg(x, y, w, h, typ) {
  const vb = typ === 'panorama' ? '0 0 300 200' : '0 0 120 200';
  const ox = typ === 'panorama' ? 0 : -95;
  const id = typ + Math.round(x);
  const hus = (cx, s, ljus) => `<g transform="translate(${cx} 176) scale(${s})">
    <path d="M-46 0 V-38 L0 -68 L46 -38 V0 Z" fill="#161A3E"/>
    <path d="M-52 -36 L0 -71 L52 -36" fill="none" stroke="#0B0E24" stroke-width="5" stroke-linejoin="round"/>
    <rect x="22" y="-64" width="8" height="16" fill="#12153A"/>
    ${ljus ? `<circle cx="0" cy="-22" r="40" fill="url(#glow${id})"/>` : ''}
    <rect x="-36" y="-30" width="16" height="15" rx="1" fill="${ljus ? '#FFC86B' : '#2A2F63'}"/>
    <rect x="-12" y="-30" width="24" height="15" rx="1" fill="${ljus ? '#FFDB91' : '#2A2F63'}"/>
    <rect x="20" y="-30" width="16" height="15" rx="1" fill="${ljus ? '#FFC86B' : '#2A2F63'}"/>
    <rect x="-6" y="-56" width="12" height="11" rx="1" fill="${ljus ? '#FFE6AE' : '#2A2F63'}"/>
    ${ljus ? '<rect x="52" y="-16" width="6" height="10" rx="1.5" fill="#0B0E24"/><rect x="54" y="-13" width="2" height="2" rx="1" fill="#7CE3FF"/>' : ''}
  </g>`;
  const gran = (cx, hgt) => `<path d="M${cx} ${176 - hgt} l${hgt * 0.16} ${hgt * 0.32} h-${hgt * 0.07} l${hgt * 0.2} ${hgt * 0.34} h-${hgt * 0.08} l${hgt * 0.24} ${hgt * 0.34} h-${hgt * 0.98} l${hgt * 0.24} -${hgt * 0.34} h-${hgt * 0.08} l${hgt * 0.2} -${hgt * 0.34} h-${hgt * 0.07} z" fill="#0C1229"/>`;
  return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}" preserveAspectRatio="xMidYMax slice">
  <defs><linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0E1736"/><stop offset=".30" stop-color="#25306A"/><stop offset=".55" stop-color="#6A4C8C"/><stop offset=".72" stop-color="#D0687A"/><stop offset=".85" stop-color="#F49A5E"/><stop offset="1" stop-color="#FBD38D"/></linearGradient>
    <radialGradient id="glow${id}"><stop offset="0" stop-color="#FFC86B" stop-opacity=".55"/><stop offset="1" stop-color="#FFC86B" stop-opacity="0"/></radialGradient></defs>
  <g transform="translate(${ox} 0)">
  <rect x="-200" y="0" width="700" height="200" fill="url(#sky${id})"/>
  <circle cx="226" cy="150" r="16" fill="#FDE1A6" opacity=".95"/>
  <circle cx="64" cy="34" r="5" fill="#F4F1FF"/><circle cx="66.5" cy="32.5" r="4.4" fill="#25306A"/>
  ${[[30, 26], [96, 14], [140, 40], [182, 22], [262, 30], [286, 12], [118, 62], [212, 58]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r=".7" fill="#fff" opacity=".8"/>`).join('')}
  <path d="M-200 152 Q-70 132 40 142 T236 138 T500 146 V200 H-200Z" fill="#3A2F63" opacity=".85"/>
  <path d="M-200 162 Q-20 148 110 158 T340 154 T500 160 V200 H-200Z" fill="#221F4A"/>
  ${gran(18, 30)}${gran(34, 44)}${gran(50, 26)}${gran(236, 36)}${gran(252, 50)}${gran(270, 30)}${gran(286, 40)}
  ${hus(84, 0.55, false)}
  ${hus(150, 1, true)}
  <rect x="-200" y="175" width="700" height="30" fill="#0B0E24"/>
  <path d="M120 176 h60" stroke="#FFC86B" stroke-width="1" opacity=".35"/>
  </g></svg>`;
}
