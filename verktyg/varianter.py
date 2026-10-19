"""Bygger 04-varianter/index.html: tjugo Ampy-varianter med bedömning per variant.

Kör: python3 verktyg/varianter.py
"""
import html
import json
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
V = ROT / "04-varianter"
REF = {r["id"]: r for r in json.loads((ROT / "03-referensbank" / "data.json").read_text())["alska"]}
e = html.escape

metas = sorted((json.loads(p.read_text()) for p in V.glob("[0-9]*/meta.json")), key=lambda m: m["nr"])


def mapp(m):
    return f"{m['nr']:02d}-{m['id']}"


def kort(m):
    return f'<a class="tumme" href="#v{m["nr"]}"><img src="webb/{mapp(m)}/t34.jpg" alt=""><span><b>{m["nr"]:02d}</b> {e(m["namn"])}</span></a>'


def variant(m):
    r = REF[m["ref"]]
    d = mapp(m)
    k = f"v{m['nr']}"
    return f"""
<article class="variant" id="{k}">
  <header class="v-head">
    <div class="v-titel">
      <p class="etikett">Variant {m['nr']:02d} av 20</p>
      <h2>{e(m['namn'])}</h2>
      <p class="ide">{e(m['ide'])}</p>
    </div>
    <figure class="ref"><img src="webb/ref/{m['ref']}.jpg" alt="Referens: {e(r['bolag'])}"><figcaption>Referens: {e(r['bolag'])}</figcaption></figure>
  </header>
  <figure class="hero"><img src="webb/{d}/t34.jpg" alt="{e(m['namn'])} på Transporter T6.1, helfolierad, snett framifrån"></figure>
  <div class="vyer">
    <figure><img src="webb/{d}/tsida.jpg" alt="Transporter från vänster"><figcaption>Transporter · helfoliering</figcaption></figure>
    <figure><img src="webb/{d}/tbak.jpg" alt="Transporter bakifrån"><figcaption>Transporter · bak med QR</figcaption></figure>
    <figure><img src="webb/{d}/csida.jpg" alt="Caddy från vänster"><figcaption>Caddy · delfoliering</figcaption></figure>
    <figure><img src="webb/{d}/c34.jpg" alt="Caddy snett bakifrån"><figcaption>Caddy · bak och höger sida</figcaption></figure>
  </div>
  <div class="beslut">
    <div class="val" role="group" aria-label="Bedöm {e(m['namn'])}" data-key="{k}">
      <button type="button" data-val="favorit" id="b-{k}-favorit">Favorit</button>
      <button type="button" data-val="kanske" id="b-{k}-kanske">Kanske</button>
      <button type="button" data-val="nej" id="b-{k}-nej">Nej</button>
    </div>
    <label class="not" for="n-{k}">Vad är rätt eller fel?</label>
    <textarea id="n-{k}" data-key="{k}" rows="2" placeholder="T.ex. rätt idé men fel färg, eller bara på Transportern"></textarea>
    <p class="status" data-status="{k}" aria-live="polite"></p>
  </div>
</article>"""


CSS = """
/* Layout: ett galleri. Översikt överst, sedan en stor bild per variant med vyerna under. */
:root{
  --bg:#ecebe7; --ink:#111214; --muted:#5d6066; --line:rgba(17,18,20,.13); --card:#f6f5f2; --chip:#dddcd6;
  --accent:#2f54ff; --nej:#c23a22;
  --sans:"Inter Tight", "Helvetica Neue", Arial, sans-serif; --mono:"JetBrains Mono", ui-monospace, Menlo, monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#141517; --ink:#ececea; --muted:#9a9ea6; --line:rgba(236,236,234,.14); --card:#1c1e21; --chip:#26282c; --accent:#7d97ff; --nej:#ff8a70; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#141517; --ink:#ececea; --muted:#9a9ea6; --line:rgba(236,236,234,.14); --card:#1c1e21; --chip:#26282c; --accent:#7d97ff; --nej:#ff8a70; color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);font-size:1.05rem;line-height:1.5}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top, 0px);z-index:10;background:var(--bg)}
.wrap{max-width:88rem;margin:0 auto;padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px));padding-block:2.5rem 5rem;display:grid;gap:4rem}
h1,h2{margin:0;font-weight:700;letter-spacing:-.03em;line-height:1;text-wrap:balance}
h1{font-size:clamp(2.6rem,7vw,5.4rem)}
h2{font-size:clamp(1.9rem,4vw,3rem)}
p{margin:0}
.etikett,figcaption,.status,.summa{font-family:var(--mono);font-size:.74rem;letter-spacing:.04em;color:var(--muted)}
.etikett{text-transform:uppercase}
.top{display:grid;gap:1.1rem;max-width:58rem}
.lead{font-size:clamp(1.1rem,2vw,1.35rem)}
.metod{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr));gap:1rem 2rem;border-top:1px solid var(--line);padding-top:1.2rem}
.metod div{display:grid;gap:.3rem;min-width:0}
.metod b{font-weight:600}
.metod p{font-size:.95rem;color:var(--muted)}
.oversikt{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,13rem),1fr));gap:.8rem}
.tumme{display:grid;gap:.35rem;text-decoration:none;color:inherit;border-radius:10px;padding:.35rem;transition:background .15s}
.tumme:hover{background:var(--chip)}
.tumme:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.tumme img{width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:7px;display:block;background:var(--chip)}
.tumme span{font-size:.9rem}
.tumme b{font-family:var(--mono);font-weight:500;color:var(--muted);margin-right:.25rem}
.tumme[data-val="favorit"] span::after{content:" · favorit";color:var(--accent)}
.tumme[data-val="nej"] img{opacity:.35;filter:grayscale(1)}
.summa{position:sticky;top:env(safe-area-inset-top, 0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding-block:.6rem;display:flex;flex-wrap:wrap;gap:.4rem 1.2rem}
.variant{display:grid;gap:1.2rem;padding-top:2.5rem;border-top:2px solid var(--ink)}
.v-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1.5rem;align-items:end}
.v-titel{display:grid;gap:.5rem}
.ide{font-size:1.2rem;max-width:46rem}
.ref{margin:0;display:grid;gap:.3rem;width:clamp(7rem,16vw,11rem)}
.ref img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:6px;display:block}
@media (max-width:620px){.v-head{grid-template-columns:1fr}.ref{width:9rem}}
.hero{margin:0}
.hero img{width:100%;display:block;border-radius:12px;background:var(--chip)}
.vyer{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem}
@media (max-width:900px){.vyer{grid-template-columns:repeat(2,minmax(0,1fr))}}
.vyer figure{margin:0;display:grid;gap:.35rem}
.vyer img{width:100%;aspect-ratio:3/2;object-fit:contain;border-radius:8px;display:block;background:var(--chip)}
.beslut{display:grid;gap:.55rem;background:var(--card);border-radius:12px;padding:1rem 1.1rem;max-width:44rem}
.val{display:flex;flex-wrap:wrap;gap:.4rem}
.val button{font:500 .95rem var(--sans);padding:.45rem 1rem;border-radius:99px;border:1.5px solid var(--ink);background:transparent;color:var(--ink);cursor:pointer}
.val button:hover{background:var(--line)}
.val button:focus-visible,textarea:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.val button[aria-pressed="true"]{background:var(--ink);color:var(--bg)}
.val button[aria-pressed="true"][data-val="favorit"]{background:var(--accent);border-color:var(--accent);color:#fff}
.val button[aria-pressed="true"][data-val="nej"]{background:var(--nej);border-color:var(--nej);color:#fff}
.not{font-size:.88rem;color:var(--muted)}
textarea{font:400 1rem var(--sans);color:var(--ink);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:.55rem .7rem;width:100%;resize:vertical}
.slut{background:var(--ink);color:var(--bg);border-radius:16px;padding:clamp(1.25rem,4vw,2.5rem);display:grid;gap:.9rem}
.slut h2{color:var(--bg)}
.slut ol{margin:0;padding-left:1.2rem;display:grid;gap:.5rem;max-width:50rem}
"""

JS = """
(() => {
  const state = {};
  const summa = document.getElementById('summa-text');
  let db = null;
  function rendera(k) {
    const s = state[k] || {};
    document.querySelectorAll('.val[data-key="' + k + '"] button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.val === s.val)));
    const t = document.querySelector('.tumme[href="#' + k + '"]'); if (t) t.dataset.val = s.val || '';
    const ta = document.querySelector('textarea[data-key="' + k + '"]');
    if (ta && document.activeElement !== ta && typeof s.notering === 'string') ta.value = s.notering;
    const n = { favorit: 0, kanske: 0, nej: 0 };
    Object.values(state).forEach(v => { if (n[v.val] !== undefined) n[v.val]++; });
    summa.textContent = n.favorit + ' favoriter · ' + n.kanske + ' kanske · ' + n.nej + ' nej · ' + (20 - n.favorit - n.kanske - n.nej) + ' kvar';
  }
  async function spara(k, patch) {
    state[k] = { ...(state[k] || {}), ...patch };
    rendera(k);
    const st = document.querySelector('[data-status="' + k + '"]');
    if (!db) { if (st) st.textContent = 'Sparas inte här. Skriv ditt svar i chatten.'; return; }
    if (st) st.textContent = 'Sparar…';
    try {
      await db.doc('val/' + k).set({ val: state[k].val || '', notering: state[k].notering || '', tid: new Date().toISOString() });
      if (st) st.textContent = 'Sparat';
    } catch (e) {
      if (st) st.textContent = e && e.code === 'invalid_argument' ? 'Du har bara läsbehörighet här.' : 'Kunde inte spara. Försök igen.';
    }
  }
  document.querySelectorAll('.val').forEach(g => g.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const k = g.dataset.key; spara(k, { val: (state[k] || {}).val === b.dataset.val ? '' : b.dataset.val });
  })));
  document.querySelectorAll('textarea[data-key]').forEach(ta => { let t; ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => spara(ta.dataset.key, { notering: ta.value }), 800); }); });
  rendera('_');
  (async () => {
    try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
    if (!db) { summa.textContent = 'Dina val sparas inte i den här vyn.'; return; }
    db.collection('val').onSnapshot(snap => snap.docs.forEach(d => { if (d.exists) { state[d.id] = d.data(); rendera(d.id); } }),
      () => { summa.textContent = 'Tappade kontakten med lagringen. Ladda om sidan.'; });
  })();
})();
"""


def bygg():
    sida = f"""<title>Ampy Tjugo Varianter</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<style>{CSS}</style>
<div class="wrap">
<header class="top">
  <p class="etikett">Ampy · fordonsdekor · oktober 2026</p>
  <h1>Tjugo varianter</h1>
  <p class="lead">En Ampy-variant för var och en av de 20 referenserna du gillade. Varje variant visas på Transporter T6.1 med helfoliering och på Caddy 5 med delfoliering, från fem vinklar. Markera <b>Favorit</b>, <b>Kanske</b> eller <b>Nej</b>, så vet jag vilka spår som ska drivas vidare.</p>
  <div class="metod">
    <div><b>Riktiga bilar</b><p>Fotona är av en vit T6.1 från 2020 och en vit Caddy 5, samma modeller som i er flotta. Designen ligger på lacken med fotots egna reflexer, skuggor och dörrspringor. Inga AI-bilder.</p></div>
    <div><b>Skisser, inte tryckfiler</b><p>Måtten är uppmätta för hand ur fotona, några centimeter fel i verklig storlek. Vyerna snett framifrån och bakifrån är perspektivlagda och kan ha små skarvar vid B-stolpen.</p></div>
    <div><b>Ordmärkena är typsnittsskisser</b><p>Brandbooken är förkastad, så ordet ampy är satt i olika typsnitt per variant. Ingen av dem är en färdig logotyp, utan visar en riktning.</p></div>
    <div><b>QR-koden fungerar</b><p>Varje variant har en egen kod till ampy.se/bil med variantnumret. Skylten är ersatt med AMP 001 och AMP 002.</p></div>
  </div>
</header>
<section aria-label="Översikt" class="oversikt">{''.join(kort(m) for m in metas)}</section>
<p class="summa"><span id="summa-text">Laddar dina val…</span></p>
{''.join(variant(m) for m in metas)}
<section class="slut">
  <p class="etikett" style="color:inherit;opacity:.7">När du har valt</p>
  <h2>Nästa steg</h2>
  <ol>
    <li>Markera favoriter och skriv vad som är fel på de du säger nej till. Det kalibrerar mer än favoriterna.</li>
    <li>Säg till i chatten när du är klar, så läser jag dina val.</li>
    <li>Jag tar de 3–5 bästa vidare: ett riktigt ordmärke, färgprov, höger sida och bilen i gatumiljö.</li>
  </ol>
</section>
</div>
<script>{JS}</script>
"""
    (V / "index.html").write_text(sida)
    files = {}
    for p in sorted((V / "webb").rglob("*.jpg")):
        files[str(p.relative_to(V))] = str(p.relative_to(ROT))
    (V / "filer.json").write_text(json.dumps(files, indent=0))
    print("index.html", len(sida) // 1024, "kB,", len(files), "bilder")


if __name__ == "__main__":
    bygg()
