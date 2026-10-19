"""Lägger varje design på fotona och ger färdiga mockups.

Designlagret multipliceras med lackens egen ljusstyrka, så att fotots reflexer, skuggor
och dörrspringor syns genom folien. Bilen placeras sedan på en enhetlig studiobakgrund.

Kör: python3 verktyg/mockup/komponera.py [nr ...]
Skriver till 04-varianter/<nr>-<id>/.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROT = Path(__file__).resolve().parent
UT = ROT.parent.parent / "04-varianter"
V = json.loads((ROT / "vyer.json").read_text())
C = ROT / "cache"


def las(p, alpha=False):
    im = cv2.imread(str(p), cv2.IMREAD_UNCHANGED)
    if im is None:
        raise FileNotFoundError(p)
    if alpha:
        if im.shape[2] == 3:
            im = np.dstack([im, np.full(im.shape[:2], 255, np.uint8)])
        return im.astype(np.float32) / 255
    return im[..., :3].astype(np.float32) / 255


def hexrgb(h):
    h = h.lstrip("#")
    return np.array([int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.float32) / 255  # BGR


def vy(namn):
    foto = las(C / namn / "foto.png")
    lack = cv2.imread(str(C / namn / "lack.png"), 0).astype(np.float32) / 255
    bil = cv2.imread(str(C / namn / "bil.png"), 0).astype(np.float32) / 255
    lack = cv2.GaussianBlur(lack, (0, 0), 1.2)
    return foto, lack, bil


def skugga_lack(foto, lack):
    Y = cv2.cvtColor((foto * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    ref = np.percentile(Y[lack > 0.5], 88)
    S = Y / max(ref, 1e-3)
    # Mjuk och skarp del: den mjuka bär formen, den skarpa bär springor och detaljer.
    mjuk = cv2.GaussianBlur(S, (0, 0), 6)
    return S, mjuk


def folie(foto, lack, lager, bas=None):
    """lager: RGBA float. Returnerar foto med folie."""
    S, mjuk = skugga_lack(foto, lack)
    rgb, a = lager[..., :3], lager[..., 3]
    if bas is not None:
        b = hexrgb(bas)
        rgb = rgb * a[..., None] + b * (1 - a[..., None])
        a = np.ones_like(a)
    a = a * lack
    s = np.clip(S, 0, 1.06)[..., None]
    farg = rgb * s ** 1.15
    # Glans: ljusa reflexer i lacken lever kvar som högdagrar ovanpå folien.
    glans = np.clip(S - 0.97, 0, 0.5)[..., None] * 1.6
    # Mörka folier får en svag reflex av omgivningen.
    mork = (1 - rgb.mean(axis=2, keepdims=True))
    refl = np.clip(mjuk - 0.80, 0, 0.3)[..., None] * 0.35 * mork
    farg = np.clip(farg + glans * (0.35 + 0.65 * mork) + refl, 0, 1)
    return foto * (1 - a[..., None]) + farg * a[..., None]


def overlagg(foto, lager):
    a = lager[..., 3:4]
    return foto * (1 - a) + lager[..., :3] * a


def studio(bild, bil, namn):
    h, w = bil.shape
    ys = np.linspace(0, 1, h)[:, None]
    topp, botten = np.array([0.955, 0.955, 0.950]), np.array([0.835, 0.838, 0.842])
    bg = (topp * (1 - ys[..., None] ** 1.3) + botten * ys[..., None] ** 1.3) * np.ones((h, w, 3))
    # Vinjett.
    xs = np.linspace(-1, 1, w)[None, :]
    bg *= (1 - 0.06 * (xs ** 2))[..., None]
    # Skugga: kontakt under hjulen och en mjuk skugga under hela bilen.
    m = (bil > 0.5).astype(np.uint8)
    cols = np.where(m.any(axis=0))[0]
    kontakt = np.zeros((h, w), np.float32)
    mjuk = np.zeros((h, w), np.float32)
    if len(cols):
        botten_y = np.array([np.max(np.where(m[:, x])[0]) if m[:, x].any() else 0 for x in range(w)])
        gy = np.percentile(botten_y[cols], 92)
        for x in cols:
            y = botten_y[x]
            if y > gy - 0.04 * h:
                kontakt[max(0, y - 6):min(h, y + 8), x] = 1
            mjuk[int(gy) - 6:min(h, int(gy) + int(0.02 * h)), x] = 1
        kontakt = cv2.GaussianBlur(kontakt, (0, 0), 6) * 0.75
        mjuk = cv2.GaussianBlur(mjuk, (0, 0), 0.03 * w) * 0.55
    sk = np.clip(kontakt + mjuk, 0, 0.85)
    bg = bg * (1 - sk[..., None])
    a = cv2.GaussianBlur(bil, (0, 0), 0.8)[..., None]
    return bg * (1 - a) + bild * a


def beskar(bild, bil, bredd=1800, marg=(0.07, 0.16, 0.07, 0.10)):
    ys, xs = np.where(bil > 0.5)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    W, H = x1 - x0, y1 - y0
    x0 = max(0, int(x0 - marg[0] * W)); x1 = min(bild.shape[1], int(x1 + marg[2] * W))
    y0 = max(0, int(y0 - marg[1] * H)); y1 = min(bild.shape[0], int(y1 + marg[3] * H))
    ut = bild[y0:y1, x0:x1]
    s = bredd / ut.shape[1]
    return cv2.resize(ut, None, fx=s, fy=s, interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)


def homografi(src, dst):
    src, dst = np.float32(src), np.float32(dst)
    if len(src) == 4:
        return cv2.getPerspectiveTransform(src, dst)
    Hm, _ = cv2.findHomography(src, dst, 0)
    return Hm


def warpa(lager, plan, storlek, kalla_planfilter=True):
    w, h = storlek
    Hm = homografi(plan["src"], plan["dst"])
    reg = np.ones(lager.shape[:2], np.float32)
    if kalla_planfilter:
        if "xmin" in plan:
            reg[:, : plan["xmin"]] = 0
        if "xmax" in plan:
            reg[:, plan["xmax"]:] = 0
    lw = cv2.warpPerspective(lager * reg[..., None], Hm, (w, h), flags=cv2.INTER_LINEAR, borderValue=0)
    rw = cv2.warpPerspective(reg, Hm, (w, h), flags=cv2.INTER_LINEAR, borderValue=0)
    return lw, rw


def skyltbild(nr, w=520, h=112):
    from PIL import Image, ImageDraw, ImageFont
    im = Image.new("RGB", (w, h), (247, 247, 245))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w - 1, h - 1], outline=(26, 26, 26), width=4)
    d.rectangle([4, 4, int(h * 0.3), h - 5], fill=(28, 70, 184))
    f = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", int(h * 0.68))
    fs = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", int(h * 0.22))
    d.text((h * 0.165, h * 0.80), "S", font=fs, fill=(255, 255, 255), anchor="ms")
    d.text((h * 0.3 + (w - h * 0.3) / 2, h * 0.5), nr, font=f, fill=(17, 17, 17), anchor="mm")
    return np.asarray(im)[..., ::-1].astype(np.float32) / 255


def skylt_quad(bild, quad, nr):
    p = skyltbild(nr)
    h, w = p.shape[:2]
    Hm = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad))
    lw = cv2.warpPerspective(p, Hm, (bild.shape[1], bild.shape[0]))
    a = cv2.warpPerspective(np.ones((h, w), np.float32), Hm, (bild.shape[1], bild.shape[0]))[..., None]
    return bild * (1 - a) + lw * a


def spara(bild, sokvag):
    cv2.imwrite(str(sokvag), np.clip(bild * 255, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 88])


def gor(nr):
    dd = C / "design" / f"{nr:02d}"
    meta = json.loads((dd / "meta.json").read_text())
    ut = UT / f"{nr:02d}-{meta['id']}"
    ut.mkdir(parents=True, exist_ok=True)
    resultat = {}

    # Transporter, vänster sida.
    foto, lack, bil = vy("t_vanster")
    b = folie(foto, lack, las(dd / "t_vanster_lack.png", True))
    resultat["transporter-sida"] = beskar(studio(b, bil, "t_vanster"), bil)

    # Transporter bak.
    foto, lack, bil = vy("t_bak")
    b = folie(foto, lack, las(dd / "t_bak_lack.png", True))
    b = overlagg(b, las(dd / "t_bak_skylt.png", True))
    resultat["transporter-bak"] = beskar(studio(b, bil, "t_bak"), bil, 1400)

    # Transporter 3/4 framifrån: sidan warpas in, resten av lacken får basfärgen.
    v = V["t_34"]
    foto, lack, bil = vy("t_34")
    h, w = lack.shape
    kalla = las(dd / "t_vanster_lack.png", True)
    prgb = np.zeros((h, w, 3), np.float32)
    pa = np.zeros((h, w), np.float32)
    for pl in v["planes"]:
        lw, rw = warpa(kalla, pl, (w, h))
        vikt = np.clip(rw, 0, 1) * (1 - pa)
        la = lw[..., 3] / np.maximum(rw, 1e-3)
        lrgb = lw[..., :3] / np.maximum(rw, 1e-3)[..., None]
        prgb += lrgb * (vikt * la)[..., None]
        pa += vikt * la
    bas = meta["basT"]
    if bas:
        prgb += hexrgb(bas) * (1 - pa)[..., None]
        pa = np.ones_like(pa)
    acc = np.dstack([prgb / np.maximum(pa, 1e-3)[..., None], pa])
    b = folie(foto, lack, np.clip(acc, 0, 1))
    b = skylt_quad(b, v["plateQuad"], "AMP 001")
    resultat["transporter-34"] = beskar(studio(b, bil, "t_34"), bil)

    # Caddy, vänster sida.
    foto, lack, bil = vy("c_vanster")
    b = folie(foto, lack, las(dd / "c_vanster_lack.png", True))
    resultat["caddy-sida"] = beskar(studio(b, bil, "c_vanster"), bil)

    # Caddy 3/4 bakifrån: bakdörrar och höger sida warpas in.
    v = V["c_34bak"]
    foto, lack, bil = vy("c_34bak")
    h, w = lack.shape
    acc = np.zeros((h, w, 4), np.float32)
    skylt = np.zeros((h, w, 4), np.float32)
    for pl in v["planes"]:
        src = las(dd / f"{pl['kalla']}_lack.png", True)
        lw, rw = warpa(src, pl, (w, h), kalla_planfilter=False)
        dmask = np.ones((h, w), np.float32)
        if "xmax" in pl:
            dmask[:, pl["xmax"]:] = 0
        if "xmin" in pl:
            dmask[:, : pl["xmin"]] = 0
        acc += lw * dmask[..., None]
        if pl["kalla"] == "c_bak":
            sw, _ = warpa(las(dd / "c_bak_skylt.png", True), pl, (w, h), kalla_planfilter=False)
            skylt += sw * dmask[..., None]
    b = folie(foto, lack, np.clip(acc, 0, 1), meta["basC"])
    b = overlagg(b, np.clip(skylt, 0, 1))
    resultat["caddy-34bak"] = beskar(studio(b, bil, "c_34bak"), bil)

    for k, im in resultat.items():
        spara(im, ut / f"{k}.jpg")
    (ut / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
    return ut


if __name__ == "__main__":
    nr = [int(a) for a in sys.argv[1:]] or [int(p.name) for p in sorted((C / "design").iterdir()) if p.name.isdigit()]
    for n in nr:
        print("klar", gor(n))
