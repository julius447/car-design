"""Bygger 03-referensbank/index.html ur 03-referensbank/data.json.

Kör: python3 verktyg/referensbank.py
Bilderna ligger i 03-referensbank/bilder/ och refereras relativt.
"""
import html
import json
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent / "03-referensbank"
D = json.loads((ROT / "data.json").read_text())
e = html.escape

SPAR = {s["id"]: s for s in D["spar"]}


def kalla(url):
    if url.startswith("http"):
        domän = url.split("/")[2].removeprefix("www.")
        return f'<a href="{e(url)}" target="_blank" rel="noopener">{e(domän)}</a>'
    return e(url)


def beslut(nyckel, val, fraga):
    knappar = "".join(
        f'<button type="button" data-val="{v}" id="b-{nyckel}-{v}">{t}</button>' for v, t in val
    )
    return f'<div class="val" role="group" aria-label="{e(fraga)}" data-key="{nyckel}">{knappar}</div>'


def spar_sektion(s, nr):
    bilder = "".join(
        f'<img src="bilder/fordon/{i}.jpg" alt="Referens {i} för spåret {e(s["namn"])}">'
        for i in s["bilder"]
    )
    return f"""
<article class="spar" id="spar-{s['id']}" data-spar="{s['id']}">
  <header class="spar-head">
    <p class="etikett">Spår {nr}</p>
    <h3>{e(s['namn'])}</h3>
    <p class="ingress">{e(s['mening'])}</p>
  </header>
  <div class="mood">{bilder}</div>
  <dl class="fakta">
    <div><dt>Delvis, Caddy</dt><dd>{e(s['delvis'])}</dd></div>
    <div><dt>Full, Transporter</dt><dd>{e(s['full'])}</dd></div>
    <div><dt>Risk</dt><dd>{e(s['risk'])}</dd></div>
  </dl>
  <div class="beslut">
    <p class="etikett">Är det här rätt spår?</p>
    {beslut('spar-' + s['id'], [('ratt', 'Rätt spår'), ('kanske', 'Kanske'), ('fel', 'Fel spår')], 'Bedöm spåret ' + s['namn'])}
    <label class="not" for="n-spar-{s['id']}">Vad i spåret är rätt eller fel?</label>
    <textarea id="n-spar-{s['id']}" data-key="spar-{s['id']}" rows="2" placeholder="T.ex. rätt idé men för mörkt"></textarea>
    <p class="status" data-status="spar-{s['id']}" aria-live="polite"></p>
  </div>
</article>"""


def ref_kort(r, sort):
    spar = SPAR.get(r.get("spar"))
    tag = f'<span class="tag">{e(spar["namn"])}</span>' if spar else ""
    typ = f'<span class="typ">{e(r["typ"])}</span>' if r.get("typ") else ""
    return f"""
<figure class="kort {sort}">
  <img src="bilder/fordon/{r['id']}.jpg" alt="{e(r['bolag'])}">
  <figcaption>
    <div class="meta">{typ}{tag}</div>
    <h4>{e(r['bolag'])}</h4>
    <p>{e(r['varfor'])}</p>
    <div class="fot"><span class="kalla">{kalla(r['kalla'])}</span>
      {beslut('ref-' + str(r['id']), [('ja', 'Håller med'), ('nej', 'Håller inte med')], 'Håller du med om ' + r['bolag'])}
    </div>
  </figcaption>
</figure>"""


def varumarke(v):
    bilder = "".join(
        f'<img src="bilder/varumarken/{b}.jpg" alt="{e(v["namn"])}">' for b in v["bilder"]
    )
    return f"""
<article class="varumarke">
  <div class="v-bilder">{bilder}</div>
  <div class="v-text">
    <h4>{e(v['namn'])}</h4>
    <p class="kansla">{e(v['kansla'])}</p>
    <p><strong>Ta med:</strong> {e(v['ta'])}</p>
    <div class="fot"><span class="kalla">{kalla(v['kalla'])}</span>
      {beslut('vm-' + v['id'], [('ja', 'Rätt känsla'), ('nej', 'Fel känsla')], 'Rätt känsla för ' + v['namn'])}
    </div>
  </div>
</article>"""


MOCKUPS = [
    ("Transporter T6.1", "Mockupix, 8 vyer, PSD med smarta objekt", "ca 25 USD",
     "https://graphicriver.net/item/volkswagen-transporter-t61-van-mockup/37915884", "Rätt modell. Rekommenderas."),
    ("Transporter T6.1", "halalgraphicstudio, 10 3D-renderade vyer", "betald",
     "https://graphicriver.net/item/3d-rendered-volkswagen-transporter-t61-panel-van-wrapping-mockup-set/59407639", "Rätt modell, uppdaterad 2025."),
    ("Caddy 4 (2015–2020)", "Freiform3D, 7 vyer, 6000×4000 px", "betald",
     "https://graphicriver.net/item/vw-caddy-van-mock-up/23225631", "Kontrollera att bilden visar Caddy 4 och inte Caddy 5."),
    ("Caddy", "PsFiles, 6 vyer, gratis", "gratis",
     "https://psfiles.com/6-free-panel-caddy-van-vehicle-branding-mockup-psd-set/", "Nedladdningen är spärrad för skript och kräver en webbläsare. Modellåret är inte kontrollerat."),
    ("T6 kort hjulbas", "Pixelsaurus, vektormall för tryck (AI/PDF)", "betald",
     "https://pxlsrs.com/2016-2020-volkswagen-t6-transporter-swb-l1h1-vector-template/", "Produktionsmall. Sidoplåten är densamma på T6 och T6.1."),
    ("Caddy kort hjulbas 2015–2020", "Pixelsaurus, vektormall för tryck", "ca 43 USD",
     "https://pxlsrs.com/2015-2020-volkswagen-caddy-swb-panel-delivery-vector-template/", "Produktionsmall för exakt er Caddy."),
]


def mockup_rader():
    return "".join(
        f"<tr><td>{e(m)}</td><td>{e(v)}</td><td>{e(p)}</td><td>{e(n)}</td><td>{kalla(u)}</td></tr>"
        for m, v, p, u, n in MOCKUPS
    )


CSS = """
/* Layout: en arbetsvägg. Textkolumn till vänster, bilderna får full bredd. */
:root{
  --bg:#f3f3f1; --ink:#121314; --muted:#5d6066; --line:rgba(18,19,20,.12);
  --card:#ffffff; --chip:#e7e7e3; --accent:#2b54ff; --accent-ink:#ffffff; --hate:#c23a22;
  --sans:"Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif;
  --mono:"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#111214; --ink:#ececea; --muted:#9a9ea6; --line:rgba(236,236,234,.13);
  --card:#1a1c1f; --chip:#24262a; --accent:#7d97ff; --accent-ink:#0d0f1a; --hate:#ff8a70; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#111214; --ink:#ececea; --muted:#9a9ea6; --line:rgba(236,236,234,.13);
  --card:#1a1c1f; --chip:#24262a; --accent:#7d97ff; --accent-ink:#0d0f1a; --hate:#ff8a70; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:1.0625rem;line-height:1.5}
a{color:inherit}
.wrap{max-width:84rem;margin:0 auto;padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px));padding-block:2.5rem 5rem;display:grid;gap:5rem}
h1,h2,h3,h4{margin:0;font-weight:700;letter-spacing:-.025em;line-height:1.02;text-wrap:balance}
h1{font-size:clamp(2.6rem,7vw,5.6rem);font-weight:800}
h2{font-size:clamp(1.9rem,4vw,3.1rem)}
h3{font-size:clamp(1.6rem,3vw,2.3rem)}
h4{font-size:1.15rem;letter-spacing:-.01em;line-height:1.2}
p{margin:0}
.etikett,dt,.typ,.tag,th{font-family:var(--mono);font-size:.74rem;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);font-weight:500}
.top{display:grid;gap:1.25rem}
.lead{font-size:clamp(1.15rem,2vw,1.4rem);max-width:46rem}
.siffror{display:flex;flex-wrap:wrap;gap:.5rem 2rem;font-family:var(--mono);font-size:.85rem;color:var(--muted)}
.siffror b{color:var(--ink);font-family:var(--sans);font-size:1.5rem;font-weight:700;display:block;letter-spacing:-.02em}
section{display:grid;gap:2rem}
.sec-head{display:grid;gap:.7rem;border-top:2px solid var(--ink);padding-top:1.25rem;max-width:52rem}
.regler{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,24rem),1fr));gap:2rem 3rem}
.regler > div{display:grid;gap:.8rem;min-width:0}
.regler ol{margin:0;padding-left:1.2rem;display:grid;gap:.55rem}
.regler li::marker{font-family:var(--mono);color:var(--muted)}
.regler h3{font-size:1.3rem}
.nej h3{color:var(--hate)}
.spar{display:grid;gap:1.4rem;padding-top:2.5rem;border-top:1px solid var(--line)}
.spar-head{display:grid;gap:.45rem}
.ingress{font-size:1.25rem;max-width:44rem}
.mood{columns:3 18rem;column-gap:.6rem}
.mood img{width:100%;display:block;margin-bottom:.6rem;border-radius:6px;break-inside:avoid;background:var(--chip)}
.fakta{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr));gap:1rem 2rem;margin:0}
.fakta div{display:grid;gap:.25rem;min-width:0}
.fakta dd{margin:0}
.beslut{display:grid;gap:.55rem;background:var(--chip);border-radius:12px;padding:1rem 1.1rem;max-width:42rem}
.val{display:flex;flex-wrap:wrap;gap:.4rem}
.val button{font:500 .92rem var(--sans);padding:.42rem .9rem;border-radius:99px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);cursor:pointer}
.val button:hover{background:var(--line)}
.val button:focus-visible,textarea:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.val button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.val button[aria-pressed="true"][data-val="fel"],.val button[aria-pressed="true"][data-val="nej"]{background:var(--hate);border-color:var(--hate);color:#fff}
.not{font-size:.88rem;color:var(--muted)}
textarea{font:400 1rem var(--sans);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:.55rem .7rem;width:100%;resize:vertical}
.status{font-family:var(--mono);font-size:.72rem;color:var(--muted);min-height:1em}
.galleri{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr));gap:1.2rem}
.kort{margin:0;background:var(--card);border-radius:12px;overflow:hidden;display:grid;grid-template-rows:auto 1fr}
.kort img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--chip)}
.kort figcaption{padding:.9rem 1rem 1rem;display:grid;gap:.45rem;align-content:start}
.kort p{font-size:.95rem}
.meta{display:flex;flex-wrap:wrap;gap:.35rem}
.typ,.tag{padding:.15rem .45rem;border-radius:4px;background:var(--chip);font-size:.66rem}
.tag{background:transparent;border:1px solid var(--line)}
.hata .typ{display:none}
.hata h4{color:var(--hate)}
.fot{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:space-between;align-items:center;margin-top:.3rem}
.kalla{font-family:var(--mono);font-size:.72rem;color:var(--muted);overflow-wrap:anywhere}
.fot .val button{font-size:.8rem;padding:.3rem .7rem}
.varumarken{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,34rem),1fr));gap:1.2rem}
.varumarke{background:var(--card);border-radius:12px;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr)}
.v-bilder{display:grid;grid-template-rows:1fr 1fr;gap:2px;background:var(--chip)}
.v-bilder img{width:100%;height:100%;min-height:8rem;object-fit:cover;display:block}
.v-text{padding:1rem 1.1rem;display:grid;gap:.5rem;align-content:start}
.kansla{font-size:1.05rem;font-weight:500}
.v-text p{font-size:.95rem}
@media (max-width:560px){.varumarke{grid-template-columns:1fr}.v-bilder{grid-template-rows:none;grid-template-columns:1fr 1fr}}
.ampy{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:2rem;align-items:start}
.ampy figure{margin:0;display:grid;gap:.6rem}
.ampy img{width:100%;border-radius:10px;display:block;border:1px solid var(--line)}
.ampy ul{margin:0;padding-left:1.1rem;display:grid;gap:.6rem}
@media (max-width:760px){.ampy{grid-template-columns:1fr}}
.tabell{overflow-x:auto;border-top:1px solid var(--line)}
table{border-collapse:collapse;width:100%;min-width:44rem;font-size:.93rem}
th,td{text-align:left;padding:.7rem .6rem;border-bottom:1px solid var(--line);vertical-align:top}
.nasta{background:var(--ink);color:var(--bg);border-radius:16px;padding:clamp(1.25rem,4vw,2.5rem);display:grid;gap:1rem}
.nasta ol{margin:0;padding-left:1.2rem;display:grid;gap:.5rem;max-width:48rem}
.summa{position:sticky;top:env(safe-area-inset-top, 0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding-block:.6rem;display:flex;flex-wrap:wrap;gap:.4rem 1rem;font-family:var(--mono);font-size:.78rem;color:var(--muted)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top, 0px);z-index:10;background:var(--bg)}
@media (prefers-reduced-motion:no-preference){.val button{transition:background .15s,color .15s}}
"""

JS = """
(() => {
  const state = {};
  const status = k => document.querySelector('[data-status="' + k + '"]');
  const summa = document.getElementById('summa-text');
  let db = null;

  function rendera(k) {
    const s = state[k] || {};
    document.querySelectorAll('.val[data-key="' + k + '"] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.val === s.val)));
    const ta = document.querySelector('textarea[data-key="' + k + '"]');
    if (ta && document.activeElement !== ta && typeof s.notering === 'string') ta.value = s.notering;
    const ratt = Object.entries(state).filter(([k, v]) => k.startsWith('spar-') && v.val === 'ratt').length;
    const svar = Object.values(state).filter(v => v.val).length;
    summa.textContent = svar + ' bedömningar · ' + ratt + ' spår markerade som rätt';
  }

  async function spara(k, patch) {
    state[k] = { ...(state[k] || {}), ...patch };
    rendera(k);
    const st = status(k);
    if (!db) { if (st) st.textContent = 'Sparas inte här. Skriv ditt svar i chatten.'; return; }
    if (st) st.textContent = 'Sparar…';
    try {
      await db.doc('val/' + k).set({ val: state[k].val || '', notering: state[k].notering || '', tid: new Date().toISOString() });
      if (st) st.textContent = 'Sparat';
    } catch (e) {
      if (st) st.textContent = e && e.code === 'invalid_argument' ? 'Du har bara läsbehörighet här.' : 'Kunde inte spara. Försök igen.';
    }
  }

  document.querySelectorAll('.val').forEach(g => {
    const k = g.dataset.key;
    g.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      spara(k, { val: (state[k] || {}).val === b.dataset.val ? '' : b.dataset.val });
    }));
  });
  document.querySelectorAll('textarea[data-key]').forEach(ta => {
    let t;
    ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => spara(ta.dataset.key, { notering: ta.value }), 800); });
  });
  rendera('_');

  (async () => {
    try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
    if (!db) { summa.textContent = 'Dina val sparas inte i den här vyn.'; return; }
    db.collection('val').onSnapshot(snap => {
      snap.docs.forEach(d => { if (d.exists) { state[d.id] = d.data(); rendera(d.id); } });
    }, () => { summa.textContent = 'Tappade kontakten med lagringen. Ladda om sidan.'; });
  })();
})();
"""


def bygg():
    spar = "".join(spar_sektion(s, i + 1) for i, s in enumerate(D["spar"]))
    alska = "".join(ref_kort(r, "alska") for r in D["alska"])
    hata = "".join(ref_kort(r, "hata") for r in D["hata"])
    vm = "".join(varumarke(v) for v in D["varumarken"])
    sida = f"""<title>Ampy Referensbank</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;700;800&family=JetBrains+Mono:wght@500&display=swap">
<style>{CSS}</style>
<div class="wrap">
<header class="top">
  <p class="etikett">Ampy · fordonsdekor · smakkalibrering · oktober 2026</p>
  <h1>Referensbank</h1>
  <p class="lead">Riktiga fordonsdekorer från Pinterest och Google, sorterade i fem stilspår. Peka ut vilket spår som är rätt. Markera också där du inte håller med om mina omdömen, så kalibrerar jag smaken innan något ritas.</p>
  <div class="siffror">
    <span><b>2 750</b>bilder genomgångna</span>
    <span><b>20</b>att älska</span>
    <span><b>10</b>att hata</span>
    <span><b>8</b>varumärken</span>
    <span><b>5</b>stilspår</span>
  </div>
</header>

<section aria-labelledby="h-monster">
  <div class="sec-head"><p class="etikett">Vad referenserna lär oss</p><h2 id="h-monster">Mönstret i det bra och i det dåliga</h2></div>
  <div class="regler">
    <div><h3>Det bra har gemensamt</h3><ol>
      <li><strong>En idé per bil.</strong> En form, ett band eller ett ord. Aldrig tre saker som tävlar.</li>
      <li><strong>Formen kommer ur varumärket.</strong> En bokstav eller ett ordmärke, inte en symbol för branschen.</li>
      <li><strong>Bilens kanter skär av formen.</strong> Det är det som gör att det ser ut som arkitektur och inte som en etikett.</li>
      <li><strong>Vitt eller en enda färg som bas.</strong> Tomrummet är en del av designen.</li>
      <li><strong>Liten och exakt typografi.</strong> Kontaktuppgifterna är nästan borta.</li>
    </ol></div>
    <div class="nej"><h3>Det dåliga har gemensamt</h3><ol>
      <li><strong>Branschikoner:</strong> blixt, stickkontakt, batteri, solpanel, hus.</li>
      <li><strong>Telefonnumret som störst</strong> på bilen.</li>
      <li><strong>Listor med tjänster</strong>, som ingen läser i trafiken.</li>
      <li><strong>Maskotar, fotodekor och racingsvep.</strong></li>
      <li><strong>Fler än två färger</strong> och fler än ett typsnitt.</li>
    </ol></div>
  </div>
  <p class="lead">Viktigaste lärdomen: <strong>blixten som fristående symbol är förbjuden.</strong> Den finns på nästan alla elfirmebilar i det dåliga högen. Mitt förra förslag byggde på den, och därför var det fel.</p>
</section>

<section aria-labelledby="h-spar">
  <div class="sec-head"><p class="etikett">Moodboards</p><h2 id="h-spar">Fem spår</h2>
  <p>Varje spår visas med riktiga referenser och hur det skulle översättas till delvis foliering (Caddy) och full foliering (Transporter). Inget är ritat för Ampy ännu.</p></div>
  <p class="summa"><span id="summa-text">Laddar dina val…</span></p>
  {spar}
</section>

<section aria-labelledby="h-alska">
  <div class="sec-head"><p class="etikett">Kalibrering</p><h2 id="h-alska">20 att älska</h2>
  <p>Helst riktiga bilar. Där det står Mockup är det en presentationsbild från en byrå, inte en bil i trafik.</p></div>
  <div class="galleri">{alska}</div>
</section>

<section aria-labelledby="h-hata">
  <div class="sec-head"><p class="etikett">Kalibrering</p><h2 id="h-hata">10 att hata</h2>
  <p>Nästan alla är elfirmor och solcellsföretag. Branschen har en egen genre, och Ampy ska bort från den.</p></div>
  <div class="galleri">{hata}</div>
</section>

<section aria-labelledby="h-vm">
  <div class="sec-head"><p class="etikett">Varumärken, inte bilar</p><h2 id="h-vm">Åtta varumärken med rätt känsla</h2>
  <p>Inget av dem är en elfirma. De visar hur Sveriges modernaste elfirma ska kännas.</p></div>
  <div class="varumarken">{vm}</div>
</section>

<section aria-labelledby="h-ampy">
  <div class="sec-head"><p class="etikett">Ampy i bruk idag</p><h2 id="h-ampy">Vad som redan finns</h2></div>
  <div class="ampy">
    <figure><img src="bilder/ampy/webb-hero.jpg" alt="Startsidan på ampy.se med rubriken Elinstallationer i hemmet, gjort ordentligt, över ett foto av en villa i skymning"><figcaption class="etikett">ampy.se, oktober 2026</figcaption>
    <img src="bilder/ampy/webb-tjanster.jpg" alt="Tre tjänstekort på ampy.se: Elservice, Laddbox och Batterilagring"></figure>
    <div style="display:grid;gap:1rem">
      <ul>
        <li><strong>«Gjort ordentligt.»</strong> Rubriken på webben är det starkaste Ampy säger idag. Den är kort, självsäker och kräver ingen lista. Den kan stå på bilen.</li>
        <li><strong>Villor i skymning</strong> är rätt bildspråk för villaägare. Det är premium utan att vara kallt.</li>
        <li><strong>Turkos, marinblått och gradienter</strong> ser ut som tusen andra webbtjänster. Du vill göra en helomvändning, så det här är vad som byts ut.</li>
        <li><strong>3 000 installationer per år och 5,0 på Google</strong> är bevis som en landningssida bakom QR-koden kan använda. Det hör inte hemma på bilen.</li>
        <li>På <strong>TikTok</strong> används brandbookens a med blixt som profilbild. Instagram, Facebook och LinkedIn kräver inloggning och kunde inte granskas.</li>
      </ul>
      <img src="bilder/ampy/tiktok.jpg" alt="Ampys TikTok-profil med a-märket med blixt i turkos gradient">
    </div>
  </div>
</section>

<section aria-labelledby="h-mock">
  <div class="sec-head"><p class="etikett">Verktyg</p><h2 id="h-mock">Mockups för era bilar</h2>
  <p>Fotorealistiska PSD-mallar för att visa koncept, och vektormallar för tryck. Jag kan inte köra Photoshop i den här miljön. Om du köper en PSD kan koncepten läggas in i den. Annars gör jag stämningsbilder med AI, märkta som AI.</p></div>
  <div class="tabell"><table>
    <thead><tr><th>Modell</th><th>Vad</th><th>Pris</th><th>Kommentar</th><th>Källa</th></tr></thead>
    <tbody>{mockup_rader()}</tbody>
  </table></div>
</section>

<section class="nasta" aria-labelledby="h-nasta">
  <p class="etikett" style="color:inherit;opacity:.7">Nästa steg</p>
  <h2 id="h-nasta">Peka ut spåret</h2>
  <ol>
    <li>Markera <strong>Rätt spår</strong>, <strong>Kanske</strong> eller <strong>Fel spår</strong> på de fem spåren.</li>
    <li>Klicka <strong>Håller inte med</strong> där mitt omdöme om en referens är fel. Det säger mest om din smak.</li>
    <li>Säg till i chatten när du är klar. Jag läser dina val och gör moodboards för de spår du valt, med Ampy på riktiga bilar.</li>
    <li>Eftersom brandbooken förkastas kan spåren kräva ett nytt ordmärke eller en ny form. Säg om det ingår i uppdraget.</li>
  </ol>
</section>
</div>
<script>{JS}</script>
"""
    (ROT / "index.html").write_text(sida)
    print("Skrev", ROT / "index.html", len(sida) // 1024, "kB")


if __name__ == "__main__":
    bygg()
