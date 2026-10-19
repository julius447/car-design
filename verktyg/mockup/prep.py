"""Förbereder fotona: lackmask (var folie kan ligga), rensad bakgrund och kontrollbilder.

Kör: python3 verktyg/mockup/prep.py [--debug]
Skriver till verktyg/mockup/cache/<vy>/.
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np

ROT = Path(__file__).resolve().parent
V = json.loads((ROT / "vyer.json").read_text())
CACHE = ROT / "cache"


def poly_mask(shape, polys, fill=255):
    m = np.zeros(shape[:2], np.uint8)
    for p in polys:
        cv2.fillPoly(m, [np.array(p, np.int32)], fill)
    return m


def prep(namn, v):
    img = cv2.imread(str(ROT / "foton" / v["foto"]))
    bil = cv2.imread(str(ROT / "foton" / (Path(v["foto"]).stem + "_mask.png")), 0)
    h, w = bil.shape
    ut = CACHE / namn
    ut.mkdir(parents=True, exist_ok=True)

    # 1. Rensa bakgrunden: handlarlogotyper och takräcken.
    rensa = np.zeros((h, w), np.uint8)
    bil_d = cv2.dilate((bil > 128).astype(np.uint8) * 255, np.ones((15, 15), np.uint8))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    if "removeAbove" in v:
        x0, x1, y = v["removeAbove"]
        rensa[:y, x0:x1] = ((bil[:y, x0:x1] > 60) * 255).astype(np.uint8)
        bil = bil.copy()
        bil[:y, x0:x1] = 0
    # Mörka eller färgade detaljer på ljus bakgrund (logotyper, skyltar), utanför bilen.
    bakgrund = (bil_d == 0)
    farg = ((hsv[..., 1] > 70) | (hsv[..., 2] < 120)) & bakgrund
    # Bara i övre och nedre kanten, där handlarnas logotyper sitter.
    zon = np.zeros((h, w), bool)
    zon[: int(h * 0.30)] = True
    zon[int(h * 0.80):, : int(w * 0.35)] = True
    if namn in ("c_vanster", "c_hoger", "c_bak", "c_34bak"):
        zon[int(h * 0.80):] = True
    rensa |= ((farg & zon) * 255).astype(np.uint8)
    for x0, y0, x1, y1 in v.get("wipe", []):
        r = np.zeros((h, w), np.uint8)
        r[y0:y1, x0:x1] = 255
        rensa |= (r & ~bil_d & ((hsv[..., 2] < 235) * 255).astype(np.uint8))
    rensa = cv2.dilate(rensa, np.ones((9, 9), np.uint8))
    rent = cv2.inpaint(img, rensa, 9, cv2.INPAINT_TELEA) if rensa.any() else img.copy()

    # 2. Lackmask: ljus, omättad yta inom bilen, med dörrspringor stängda.
    Vch = hsv[..., 2].astype(np.float32) / 255
    Sch = hsv[..., 1].astype(np.float32) / 255
    lack = ((bil > 128) & (Vch > 0.50) & (Sch < 0.20)).astype(np.uint8) * 255
    lack = cv2.morphologyEx(lack, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    lack = cv2.morphologyEx(lack, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    # Fyll små hål (handtag, skarvar) men inte fönster.
    n, lab, st, _ = cv2.connectedComponentsWithStats(255 - lack)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < 900:
            lack[lab == i] = 255
    lack &= ((bil > 100) * 255).astype(np.uint8)
    lack &= ~poly_mask(img.shape, v.get("exclude", []))
    ut_hjul = np.zeros((h, w), np.uint8)
    for k in ("wheelF", "wheelR"):
        if k in v:
            x, y, r = v[k]
            cv2.circle(ut_hjul, (x, y), int(r * 1.04), 255, -1)
    for cx, cy, rx, ry in v.get("excludeEllipse", []):
        cv2.ellipse(ut_hjul, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
    lack &= ~ut_hjul
    # Behåll bara de stora ytorna (bort med reflexer i golv).
    n, lab, st, _ = cv2.connectedComponentsWithStats(lack)
    keep = np.zeros_like(lack)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 4000:
            keep[lab == i] = 255
    lack = keep

    cv2.imwrite(str(ut / "foto.png"), rent)
    cv2.imwrite(str(ut / "lack.png"), lack)
    cv2.imwrite(str(ut / "bil.png"), bil)
    return rent, lack


def debug(namn, v, rent, lack):
    d = rent.copy()
    over = d.copy()
    over[lack > 0] = (0.5 * over[lack > 0] + 0.5 * np.array([255, 0, 255])).astype(np.uint8)
    d = over
    col = (0, 160, 255)
    for p in v.get("exclude", []):
        cv2.polylines(d, [np.array(p, np.int32)], True, (0, 0, 255), 3)
    if v["typ"] == "sida":
        for k in ("front", "rear", "paintRear", "bpillar", "doorFront"):
            cv2.line(d, (v[k], 0), (v[k], d.shape[0]), col, 2)
            cv2.putText(d, k, (v[k] + 4, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.1, col, 2)
        for k in ("roof", "sill", "ground", "belt", "crease"):
            cv2.line(d, (0, v[k]), (d.shape[1], v[k]), (255, 120, 0), 2)
            cv2.putText(d, k, (10, v[k] - 6), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (255, 120, 0), 2)
        for k in ("wheelF", "wheelR"):
            x, y, r = v[k]
            cv2.circle(d, (x, y), r, (0, 255, 0), 3)
            cv2.circle(d, (x, y), v["arch"], (0, 200, 0), 2)
        x0, y0, x1, y1 = v["cargo"]
        cv2.rectangle(d, (x0, y0), (x1, y1), (0, 255, 255), 3)
    if v["typ"] == "bak":
        x0, y0, x1, y1 = v["doors"]
        cv2.rectangle(d, (x0, y0), (x1, y1), (0, 255, 255), 3)
        cv2.line(d, (v["seam"], y0), (v["seam"], y1), col, 3)
        x0, y0, x1, y1 = v["panel"]
        cv2.rectangle(d, (x0, y0), (x1, y1), (0, 200, 0), 2)
        x0, y0, x1, y1 = v["plate"]
        cv2.rectangle(d, (x0, y0), (x1, y1), (255, 0, 0), 3)
    for pl in v.get("planes", []):
        for (x, y) in pl["dst"]:
            cv2.circle(d, (int(x), int(y)), 12, (0, 255, 0), -1)
    if "plateQuad" in v:
        cv2.polylines(d, [np.array(v["plateQuad"], np.int32)], True, (255, 0, 0), 3)
    s = 1100 / d.shape[1]
    cv2.imwrite(str(CACHE / f"debug_{namn}.jpg"), cv2.resize(d, None, fx=s, fy=s, interpolation=cv2.INTER_AREA))


if __name__ == "__main__":
    for namn, v in V.items():
        if namn.startswith("_"):
            continue
        rent, lack = prep(namn, v)
        if "--debug" in sys.argv:
            debug(namn, v, rent, lack)
        print(namn, "klar")
