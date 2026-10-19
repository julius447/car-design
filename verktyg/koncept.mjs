// Fem konceptriktningar (steg 2). Varje riktning har två nivåer:
//   delvis = L1, märkningen: logga, blixt, mening, QR. Samma storlek och plats på alla bilar.
//   full   = L1 + L2, ytan: färgfält eller mönster.
// Delvis är alltså alltid en delmängd av full. Funktionerna ger SVG i fordonets
// sidokoordinater (vänster sida, mm) och klipps mot lackerad yta av sidovy().
import { LOGO, BOLT, MARK, C, shape, ratio } from './brand.mjs';

export const MENING = 'Elen, uppgraderad.';

const cargo = f => f.a.bak - f.a.bstolpe;
const logo = (x, y, w, fill) => shape(LOGO, x, y, w, fill);
const blixt = (cx, top, h, fill) => { const w = h / ratio(BOLT); return shape(BOLT, cx - w / 2, top, w, fill); };
const text = (x, y, size, fill, s = MENING, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-family="Outfit, sans-serif" font-weight="500" font-size="${size}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${size * -0.01}">${s}</text>`;
// Lyfter ett block (logga + mening) så att dess underkant ligger över textgränsen.
const lyft = (f, y, hojd) => Math.min(y, f.a.text - hojd);
const yta = (f, fill) => `<rect x="-200" y="-200" width="${f.L + 400}" height="${f.H + 400}" fill="${fill}"/>`;

// 1. Blixten
function blixten(f, full) {
  const cw = cargo(f), a = f.a;
  const lw = cw * 0.5, lx = a.bstolpe + cw * 0.07, lh = lw * ratio(LOGO), fs = f.H * 0.058;
  const ly = lyft(f, a.balte - f.H * 0.08, lh + fs * 1.55);
  return (full ? yta(f, C.blue) : '') +
    blixt(a.bak - cw * 0.16, -f.H * 0.2, f.H * 1.32, full ? C.navy : C.blue) +
    logo(lx, ly, lw, full ? '#ffffff' : C.navy) +
    text(lx + lw * 0.012, ly + lh + fs * 1.55, fs, full ? '#ffffff' : C.navy);
}

// 2. Laddning
function laddning(f, full, id) {
  const cw = cargo(f), a = f.a;
  const g = `<defs><linearGradient id="lg-${id}" gradientUnits="userSpaceOnUse" x1="${f.L}" y1="0" x2="0" y2="${f.H * 0.4}">` +
    `<stop offset="0" stop-color="${C.navy}"/><stop offset=".5" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.green}"/></linearGradient></defs>`;
  const xb = a.bstolpe + cw * 0.45, xt = xb + f.H * 0.5; // snitt i blixtens lutning (1:2)
  const svans = `<path d="M${xb} ${f.H} L${xt} 0 L${f.L + 200} 0 L${f.L + 200} ${f.H} Z" fill="url(#lg-${id})"/>`;
  const lw = cw * 0.45, lx = a.bstolpe + cw * 0.06, lh = lw * ratio(LOGO), fs = f.H * 0.05;
  const ly = lyft(f, a.balte - f.H * 0.06, lh + fs * 1.55);
  return g + (full ? `<rect x="-200" y="-200" width="${f.L + 400}" height="${f.H + 400}" fill="url(#lg-${id})"/>` : svans) +
    logo(lx, ly, lw, full ? '#ffffff' : C.navy) +
    text(lx + lw * 0.012, ly + lh + fs * 1.55, fs, full ? '#ffffff' : C.navy);
}

// 3. Monolit
function monolit(f, full) {
  const cw = cargo(f), a = f.a;
  const lw = cw * 0.8, lx = a.bstolpe + (cw - lw) / 2, lh = lw * ratio(LOGO), fs = f.H * 0.042;
  const ly = lyft(f, a.balte - f.H * 0.13, lh + fs * 1.7);
  return (full ? yta(f, C.navy) : '') +
    logo(lx, ly, lw, full ? '#ffffff' : C.navy) +
    text(lx + lw, ly + lh + fs * 1.7, fs, full ? C.green : C.navy, MENING, 'end');
}

// 4. Kretsen
function kretsen(f, full) {
  const cw = cargo(f), a = f.a, c = Math.round(f.H / 7);
  const cols = Math.ceil(f.L / c) + 1, rows = Math.ceil(f.H / c) + 1;
  // Lugn yta för loggan, i hela celler.
  const p0 = Math.floor((a.bstolpe + cw * 0.05) / c), p1 = Math.ceil((a.bstolpe + cw * 0.6) / c);
  const r1 = Math.floor(a.text / c), r0 = r1 - Math.round(f.H * 0.36 / c);
  // Delvis: mönstret bara bakom en trappa som följer blixtens lutning.
  const trappa = r => Math.max(p1, Math.floor((a.bak - cw * 0.44) / c)) + Math.floor((rows - 1 - r) / 3);
  const h = (i, j) => { let n = (i * 73856093) ^ (j * 19349663); n = (n ^ (n >>> 13)) * 1274126177; return ((n ^ (n >>> 16)) >>> 0) % 100; };
  let s = '';
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const inPanel = i >= p0 && i < p1 && j >= r0 && j < r1;
    if (inPanel) continue;
    if (!full && i < trappa(j)) continue;
    const x = i * c, y = j * c, v = h(i, j);
    const cell = fill => `<rect x="${x}" y="${y}" width="${c + 1}" height="${c + 1}" fill="${fill}"/>`;
    if (v < 22) s += cell(C.navy) + blixt(x + c / 2, y + c * 0.12, c * 0.76, C.blue);
    else if (v < 38) s += cell(C.blue);
    else if (v < 52) s += cell(C.navy);
    else if (v < 64) s += cell(C.green) + shape(MARK, x + c * 0.16, y + c * 0.18, c * 0.68, C.navy);
    else if (v < 78) s += blixt(x + c / 2, y + c * 0.12, c * 0.76, C.navy);
    else if (v < 88) s += cell(C.blue) + blixt(x + c / 2, y + c * 0.12, c * 0.76, '#ffffff');
  }
  const px = p0 * c, py = r0 * c, pw = (p1 - p0) * c, ph = (r1 - r0) * c;
  const lw = pw * 0.8, lh = lw * ratio(LOGO);
  const panel = full ? `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${C.navy}"/>` : '';
  const fs = f.H * 0.045;
  return s + panel + logo(px + (pw - lw) / 2, py + (ph - lh) / 2 - fs * 0.6, lw, full ? '#ffffff' : C.navy) +
    text(px + (pw - lw) / 2 + lw * 0.012, py + (ph + lh) / 2 + fs * 0.9, fs, full ? C.green : C.navy);
}

// 5. Strömmen
function strommen(f, full) {
  const cw = cargo(f), a = f.a;
  // Karosslinjen förlängd över hela bilen.
  const [, x0, y0, x1, y1] = f.skarv.karosslinje.match(/M(\d+) (\d+) L(\d+) (\d+)/).map(Number);
  const k = (y1 - y0) / (x1 - x0), yAt = x => y0 + k * (x - x0);
  const L = f.L, band = f.H * 0.085, linje = f.H * 0.018;
  const navy = full
    ? `<path d="M-200 ${yAt(-200)} L${L + 200} ${yAt(L + 200)} L${L + 200} ${f.H + 200} L-200 ${f.H + 200} Z" fill="${C.navy}"/>`
    : `<path d="M-200 ${yAt(-200)} L${L + 200} ${yAt(L + 200)} L${L + 200} ${yAt(L + 200) + band} L-200 ${yAt(-200) + band} Z" fill="${C.navy}"/>`;
  const gron = `<path d="M-200 ${yAt(-200) - linje} L${L + 200} ${yAt(L + 200) - linje} L${L + 200} ${yAt(L + 200)} L-200 ${yAt(-200)} Z" fill="${C.green}"/>`;
  const bh = f.H * 0.27, bx = a.bstolpe + cw * 0.1;
  const lw = cw * 0.5, lx = a.bstolpe + cw * 0.24, lh = lw * ratio(LOGO);
  const ly = yAt(lx + lw / 2) - linje - lh - f.H * 0.05;
  const fs = f.H * 0.042;
  return navy + gron + blixt(bx, yAt(bx) - linje - bh, bh, C.navy) +
    logo(lx, ly, lw, C.navy) +
    text(lx + lw, yAt(lx + lw) + band * 0.68, fs, '#ffffff', MENING, 'end');
}

export const KONCEPT = [
  {
    id: 'blixten', namn: 'Blixten',
    mening: 'Er blixt i byggnadsstorlek, beskuren av bilens kanter.',
    satsar: 'Starkast möjliga el-signal. Syns och går att känna igen på 50 meter.',
    delvis: 'Vit bil med blixten i elblått och loggan i marinblått.',
    full: 'Hela bilen elblå med blixten i marinblått och vit logga.',
    risk: 'Blixten är vanlig bland elfirmor. Det här fungerar bara om er exakta blixt används i en skala ingen annan vågar.',
    ref: 'Kvarta: stora geometriska fält skurna ur logotypens form.',
    tackning: ['ca 30 %', '100 %'],
    rita: blixten,
  },
  {
    id: 'laddning', namn: 'Laddning',
    mening: 'Brandbookens gradient, som en batteristapel som fylls bakifrån.',
    satsar: 'En elbils- och techkänsla som ingen elfirma i Sverige har.',
    delvis: 'Gradienten bara på bakre delen, skuren i blixtens lutning.',
    full: 'Hela bilen i gradient från marinblått bak till neongrönt fram.',
    risk: 'Gradienter tappar kontrast i gråskala och kräver att trycket matchar mellan paneler. Det blir dyrast att reparera.',
    ref: 'Brandbookens gradientsida och Hometree: ett stort fält och en mening.',
    tackning: ['ca 35 %', '100 %'],
    rita: laddning,
  },
  {
    id: 'monolit', namn: 'Monolit',
    mening: 'Bara loggan, i en storlek som ingen annan elfirma vågar.',
    satsar: 'Känslan av ett miljardbolag, som uppstår genom att avstå från allt annat.',
    delvis: 'Vit bil och en marinblå logga över nästan hela lastutrymmet.',
    full: 'Hela Transportern marinblå med samma logga i vitt.',
    risk: 'Svagast el-signal: bara blixten i a:et säger "el". Testet i steg 4 avgör om det räcker.',
    ref: 'Servicebilar från Polestar och Tesla.',
    tackning: ['ca 10 %', '100 %'],
    rita: monolit,
  },
  {
    id: 'kretsen', namn: 'Kretsen',
    mening: 'Ett eget mönster av blixtar och a:n, som en tapet bara Ampy har.',
    satsar: 'Maximalt uppseende. Bilen som folk fotograferar.',
    delvis: 'Mönstret bara bakom en trappa på bakre delen, loggan på vit yta.',
    full: 'Hela bilen mönstrad, med en lugn marinblå yta för loggan.',
    risk: 'Kan bli plottrigt. Svårast av de fem att få att se ut som ett miljardbolag.',
    ref: 'Vehicle Consulting (Mystery Machine) och PDCK.',
    tackning: ['ca 35 %', '100 %'],
    rita: kretsen,
  },
  {
    id: 'strommen', namn: 'Strömmen',
    mening: 'En neongrön linje går genom bilen och slår upp i en blixt.',
    satsar: 'Finess och lugn. Den mörka underdelen döljer dessutom vinterns salt och slask.',
    delvis: 'Ett marinblått band med grön kant längs karosslinjen, plus blixt och logga.',
    full: 'Tvåtonad bil: marinblå under karosslinjen och vit över.',
    risk: 'Kan bli för subtil på 30 meter. Den fulla versionen täcker bara drygt halva bilen.',
    ref: 'Tvåtonade premiumbilar. Bandet tar upp bilens egen karosslinje.',
    tackning: ['ca 15 %', 'ca 55 %'],
    rita: strommen,
  },
];
