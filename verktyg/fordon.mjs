// Fordonsmallar i millimeter. Sidovy: x = 0 vid främre stötfångaren, y = 0 vid taket,
// y = H vid marken. Vänster sida (förarsidan, fronten åt vänster) är grundritningen;
// höger sida speglas.
//
// Transporter T6.1: konturen är spårad ur tillverkarens profilbild (00-underlag/bilder/
// Transporter/Transporter 3.png, 9,18 mm/px) och kontrollerad mot längd 4 904 mm och
// höjd 1 990 mm. Caddy 4: konstruerad ur måttblad (4 408 × 1 823 mm, hjulbas 2 682 mm)
// och fotona. Noggrannhet ca ±3 %. Produktionsfiler görs på köpt mall/uppmätt bil.

const P = pts => 'M' + pts.map(p => p.join(' ')).join(' L') + ' Z';

export const T61 = {
  id: 't61',
  namn: 'VW Transporter T6.1',
  variant: 'Skåp, kort hjulbas, normaltak',
  L: 4884, H: 2010, B: 1904,
  hjul: [[844, 1659], [3951, 1659]], dack: 352, falg: 205,
  // Lackerad yta = den yta som kan folieras.
  kaross:
    'M46 1175 L46 1157 L64 1102 L83 1047 L110 991 L138 936 L193 881 L275 826 L386 771 L514 716 ' +
    'L652 661 L817 606 L881 551 L955 496 L1019 441 L1092 386 L1166 330 L1239 275 L1322 220 ' +
    'L1405 165 L1496 110 L1652 55 L1763 46 L2056 28 L2424 9 L2938 0 L4186 0 L4406 18 L4553 28 ' +
    'L4627 46 L4645 165 L4673 275 L4700 386 L4728 496 L4755 661 L4783 771 L4792 881 L4801 1102 ' +
    'L4810 1267 L4810 1420 L4650 1420 L4650 1700 L4393 1700 A444 444 0 1 0 3509 1700 ' +
    'L1286 1700 A444 444 0 0 0 431 1496 L431 1175 Z',
  glas: P([[881, 560], [1652, 62], [2150, 140], [2115, 715], [1000, 760]]),
  svart: [
    // främre stötfångare
    P([[46, 1175], [431, 1175], [431, 1496], [400, 1700], [147, 1707], [64, 1652], [18, 1597], [0, 1542], [0, 1377], [18, 1322], [46, 1267]]),
    // bakre stötfångare
    P([[4650, 1420], [4810, 1420], [4829, 1432], [4875, 1487], [4884, 1597], [4783, 1652], [4650, 1690]]),
    // tröskel
    P([[1286, 1700], [3509, 1700], [3509, 1730], [1286, 1730]]),
    // backspegel
    P([[982, 540], [1300, 520], [1319, 760], [1000, 777]]),
  ],
  lyktor: {
    fram: P([[95, 975], [462, 961], [440, 1060], [110, 1175]]),
    bak: P([[4670, 854], [4808, 854], [4808, 1175], [4670, 1175]]),
  },
  // Skarvar och detaljer. "skjut" finns bara på sidan med skjutdörr.
  skarv: {
    framdorr: 'M1059 760 V1271',
    bstolpe: 'M2233 120 V1700',
    skjutdorr: 'M3461 100 V1700',
    karosslinje: 'M1100 913 L4650 867',
  },
  skena: [3461, 701, 4440], // skjutdörrsskena: x0, y, x1
  handtag: [[1930, 802, 200, 30]],
  handtagSkjut: [2328, 802, 200, 30],
  tanklock: [2270, 1150, 150, 150], // höger sida, ej verifierad
  // Ankare som koncepten placerar sig efter.
  // text: lägsta baslinje för läsbar text (slaskzonen).
  a: { fram: 1059, bstolpe: 2233, bak: 4650, balte: 715, karosslinje: 890, slask: 1340, text: 1300, tak: 0 },
  hjulhus: 444,
  bak: {
    B: 1904, H: 1990, delning: 954, dorrNed: 1606,
    lyktor: [[0, 891, 160, 302], [1744, 891, 160, 302]],
    handtag: [181, 951, 740, 76], skylt: [263, 1036, 583, 142], vw: [1108, 1027, 75],
    stotfangare: [0, 1606, 1904, 166], hjul: [[120, 1772, 260, 218], [1524, 1772, 260, 218]],
  },
};

export const CADDY4 = {
  id: 'caddy4',
  namn: 'VW Caddy 4',
  variant: 'Skåp, standardlängd',
  L: 4408, H: 1823, B: 1793,
  hjul: [[870, 1508], [3552, 1508]], dack: 315, falg: 185,
  kaross:
    'M30 1370 L10 1250 L20 1150 L50 1060 L120 975 L260 935 L600 890 L900 855 L1100 820 ' +
    'L1845 40 L2000 5 L2200 0 L4200 0 L4320 15 L4380 60 L4395 200 L4405 600 L4408 1000 ' +
    'L4408 1380 L4150 1380 L4150 1530 L3941 1530 A390 390 0 1 0 3163 1530 L1259 1530 ' +
    'A390 390 0 1 0 481 1530 L380 1530 L380 1370 Z',
  glas: P([[1100, 825], [1845, 45], [2125, 100], [2125, 775], [1220, 800]]),
  svart: [
    P([[30, 1370], [380, 1370], [380, 1530], [120, 1560], [40, 1480]]),
    P([[4150, 1380], [4408, 1380], [4400, 1600], [4300, 1650], [4150, 1560]]),
    P([[1259, 1530], [3163, 1530], [3163, 1555], [1259, 1555]]),
    P([[1120, 640], [1380, 630], [1390, 830], [1140, 840]]),
    // skyddslist på dörrar och sidopanel
    P([[1200, 1100], [3130, 1100], [3130, 1150], [1200, 1150]]),
  ],
  lyktor: {
    fram: P([[60, 1000], [560, 920], [560, 1010], [90, 1110]]),
    bak: P([[4340, 830], [4405, 830], [4408, 1230], [4345, 1230]]),
  },
  skarv: {
    framdorr: 'M1150 820 V1237',
    bstolpe: 'M2150 90 V1530',
    skjutdorr: 'M3080 60 V1530',
    karosslinje: 'M1150 830 L4380 800',
  },
  skena: [3080, 760, 4300],
  handtag: [[1880, 880, 170, 25]],
  handtagSkjut: [2220, 880, 170, 25],
  tanklock: [3830, 850, 120, 110], // höger bakre sidopanel, ej verifierad
  // text: ovanför skyddslisten, som ligger högre än slaskzonen.
  a: { fram: 1150, bstolpe: 2150, bak: 4330, balte: 775, karosslinje: 815, slask: 1215, text: 1070, tak: 0 },
  hjulhus: 390,
  bak: {
    B: 1793, H: 1823, delning: 1041, dorrNed: 1460,
    lyktor: [[0, 879, 128, 345], [1666, 879, 127, 345]],
    handtag: [203, 949, 784, 68], skylt: [287, 1007, 615, 159], vw: [1210, 1095, 75],
    stotfangare: [0, 1460, 1793, 237], hjul: [[110, 1697, 240, 126], [1443, 1697, 240, 126]],
  },
};

// Ritar fordonet runt ett dekorlager. dekor = SVG-innehåll i fordonets koordinater,
// klipps mot lackerad yta. sida: 'v' (vänster, front åt vänster) eller 'h' (höger,
// front åt höger, med skjutdörr). Dekor ritas aldrig spegelvänd.
export function sidovy(f, { sida = 'v', dekor = '', id = 'x', linjer = true, lack = '#f1f2f4' } = {}) {
  const spegel = sida === 'h' ? `transform="translate(${f.L} 0) scale(-1 1)"` : '';
  const skjut = sida === 'h';
  const [sx0, sy, sx1] = f.skena;
  const hjul = f.hjul.map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="${f.hjulhus - 6}" fill="#2a2e36"/>` +
    `<circle cx="${x}" cy="${y}" r="${f.dack}" fill="#1c1f26"/>` +
    `<circle cx="${x}" cy="${y}" r="${f.falg}" fill="#9aa1ad"/>` +
    `<circle cx="${x}" cy="${y}" r="${f.falg * 0.42}" fill="#6c7380"/>`).join('');
  const handtag = [...f.handtag, ...(skjut ? [f.handtagSkjut] : [])]
    .map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#2a2e36"/>`).join('');
  const skarvar = linjer ? [
    f.skarv.framdorr, f.skarv.bstolpe, ...(skjut ? [f.skarv.skjutdorr] : []),
  ].map(d => `<path d="${d}" stroke="#1c1f26" stroke-opacity=".55" stroke-width="7" fill="none"/>`).join('') +
    `<path d="${f.skarv.karosslinje}" stroke="#1c1f26" stroke-opacity=".12" stroke-width="10" fill="none"/>` +
    (skjut ? `<rect x="${sx0}" y="${sy - 14}" width="${sx1 - sx0}" height="28" rx="14" fill="#2a2e36"/>` : '') : '';
  // Dekoren ligger i ett eget (ospeglat) koordinatsystem: på höger sida speglas
  // klippbanan, inte innehållet.
  const klipp = `<clipPath id="k-${id}"><path d="${f.kaross}" ${spegel}/></clipPath>`;
  return `<defs>${klipp}</defs>
<g ${spegel}>
  ${hjul}
  <path d="${f.kaross}" fill="${lack}"/>
</g>
<g clip-path="url(#k-${id})">${dekor}</g>
<g ${spegel}>
  <path d="${f.kaross}" fill="none" stroke="#1c1f26" stroke-opacity=".35" stroke-width="8"/>
  <path d="${f.glas}" fill="#273041"/>
  <path d="${f.glas}" fill="url(#glans)" opacity=".5"/>
  ${f.svart.map(d => `<path d="${d}" fill="#22252b"/>`).join('')}
  <path d="${f.lyktor.fram}" fill="#d9dde3" stroke="#22252b" stroke-width="10"/>
  <path d="${f.lyktor.bak}" fill="#b3262c"/>
  ${skarvar}
  ${handtag}
</g>`;
}

// Bakvy: x = 0 vid vänster karosskant sett bakifrån, y = 0 vid taket.
export function bakvy(f, { dekor = '', id = 'x', lack = '#f1f2f4' } = {}) {
  const b = f.bak;
  const r = ([x, y, w, h], fill, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
  const yta = `M60 0 H${b.B - 60} Q${b.B} 0 ${b.B} 80 V${b.dorrNed} H0 V80 Q0 0 60 0 Z`;
  return `<defs><clipPath id="kb-${id}"><path d="${yta}"/></clipPath></defs>
${b.hjul.map(h => r(h, '#1c1f26', 30)).join('')}
<path d="${yta}" fill="${lack}"/>
<g clip-path="url(#kb-${id})">${dekor}</g>
<path d="${yta}" fill="none" stroke="#1c1f26" stroke-opacity=".35" stroke-width="8"/>
<path d="M${b.delning} 30 V${b.dorrNed}" stroke="#1c1f26" stroke-opacity=".6" stroke-width="7"/>
${r(b.handtag, '#22252b', 12)}
${r(b.skylt, '#ffffff', 10)}
<rect x="${b.skylt[0]}" y="${b.skylt[1]}" width="60" height="${b.skylt[3]}" fill="#1a4fb5"/>
<text x="${b.skylt[0] + b.skylt[2] / 2 + 30}" y="${b.skylt[1] + b.skylt[3] * 0.74}" font-family="Outfit, sans-serif" font-weight="500" font-size="${b.skylt[3] * 0.62}" text-anchor="middle" fill="#111">ABC 123</text>
<circle cx="${b.vw[0]}" cy="${b.vw[1]}" r="${b.vw[2]}" fill="#c9ced6" stroke="#5f6670" stroke-width="10"/>
${b.lyktor.map(l => r(l, '#b3262c', 12)).join('')}
${r(b.stotfangare, '#22252b', 20)}`;
}

export const glansDef = `<linearGradient id="glans" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
