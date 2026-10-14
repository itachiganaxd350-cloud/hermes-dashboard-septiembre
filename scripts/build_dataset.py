# -*- coding: utf-8 -*-
"""Precomputa dataset.json del dashboard CIERRE SEPTIEMBRE 2026:
   - CIERRE SEPTIEMBRE 2026.xls  (4 hojas)
   - canales 2026.xlsx           (INFORM CANALES)
"""
import xlrd, json, os
import openpyxl

XLS = r"C:\Users\ASUS\Desktop\CIERRE SEPTIEMBRE 2026.xls"
CAN = r"C:\Users\ASUS\Desktop\canales 2026.xlsx"
OUT = r"C:\Users\ASUS\Documents\cierre-septiembre-2026\src\data\dataset.json"

book = xlrd.open_workbook(XLS)
sh1 = book.sheet_by_name("CIERRE SEPTIEMBRE ")
sh2 = book.sheet_by_name("VARIACION EN PESOS AÑO AÑO ")
sh3 = book.sheet_by_name("VARIACION EN KILOS AÑO AÑO")
sh4 = book.sheet_by_name("CIERRE SEPTIEMBRE CIUDADES")


def num(sh, r, c):
    v = sh.cell_value(r, c)
    if v == "" or v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return int(f) if f.is_integer() else f


def txt(sh, r, c):
    return str(sh.cell_value(r, c)).strip()


# ---------- HOJA 1: cuadro morado ----------
cierre = {
    "comoCerramos": num(sh1, 37, 5),
    "presupuesto1": num(sh1, 38, 5),
    "cumplimiento1": num(sh1, 39, 5),
    "presupuesto2": num(sh1, 40, 5),
    "cumplimiento2": num(sh1, 41, 5),
}

# ---------- HOJA 2: pesos ----------
pesos = {
    "meses": [txt(sh2, r, 0) for r in range(1, 13)],
    "venta2024": [num(sh2, r, 1) for r in range(1, 13)],
    "real2025": [num(sh2, r, 2) for r in range(1, 13)],
    "presupuesto2026": [num(sh2, r, 3) for r in range(1, 13)],
    "real2026": [num(sh2, r, 4) for r in range(1, 13)],
    "totales": {
        "venta2024": num(sh2, 13, 1),
        "real2025": num(sh2, 13, 2),
        "presupuesto2026": num(sh2, 13, 3),
        "real2026": num(sh2, 13, 4),
    },
}

# ---------- HOJA 3: kilos ----------
kilos = {
    "meses": [txt(sh3, r, 0) for r in range(2, 14)],
    "venta2024": [num(sh3, r, 1) for r in range(2, 14)],
    "real2025": [num(sh3, r, 2) for r in range(2, 14)],
    "presupuesto2026": [num(sh3, r, 3) for r in range(2, 14)],
    "real2026": [num(sh3, r, 4) for r in range(2, 14)],
    "crecimiento2026": [num(sh3, r, 5) for r in range(2, 14)],
    "proyeccion2027": [num(sh3, r, 6) for r in range(2, 14)],
    "totales": {
        "venta2024": num(sh3, 14, 1),
        "real2025": num(sh3, 14, 2),
        "presupuesto2026": num(sh3, 14, 3),
        "real2026": num(sh3, 14, 4),
        "proyeccion2027": num(sh3, 14, 6),
    },
}

n_real = sum(1 for v in kilos["real2026"] if v is not None)
r26 = sum(v for v in kilos["real2026"] if v is not None)
r25 = sum(v for v in kilos["real2025"][:n_real] if v is not None)
b26 = sum(v for v in kilos["presupuesto2026"][:n_real] if v is not None)
r24 = sum(v for v in kilos["venta2024"][:n_real] if v is not None)
kilos["ytd"] = {
    "meses": n_real,
    "real2026": r26,
    "real2025": r25,
    "venta2024": r24,
    "presupuesto2026": b26,
    "crecimientoPct": (r26 - r25) / r25 * 100,
    "cumplimientoPct": r26 / b26 * 100,
}
pesos["ytd"] = {
    "meses": n_real,
    "real2026": sum(v for v in pesos["real2026"] if v is not None),
    "real2025": sum(v for v in pesos["real2025"][:n_real] if v is not None),
}
pesos["ytd"]["crecimientoPct"] = (
    (pesos["ytd"]["real2026"] - pesos["ytd"]["real2025"]) / pesos["ytd"]["real2025"] * 100
)

# ---------- HOJA 4: ciudades ----------
ciudades = []
for r in range(1, 20):
    name = txt(sh4, r, 0)
    if not name:
        continue
    ciudades.append({"ciudad": name, "pesos": num(sh4, r, 1), "kilos": num(sh4, r, 2)})
tot_p = num(sh4, 20, 1)
tot_k = num(sh4, 20, 2)
for c in ciudades:
    c["pctPesos"] = c["pesos"] / tot_p * 100
    c["pctKilos"] = c["kilos"] / tot_k * 100

# ---------- CANALES (canales 2026.xlsx) ----------
cw = openpyxl.load_workbook(CAN, data_only=True)
cs = cw["INFORM CANALES "]


def cval(r, c):
    v = cs.cell(row=r, column=c).value
    if v is None or v == "":
        return None
    if isinstance(v, str):
        try:
            f = float(v)
            return int(f) if f.is_integer() else f
        except ValueError:
            return v.strip()
    return v


COLS = {2022: 5, 2023: 8, 2024: 11, 2025: 12, 2026: 13}  # E, H, K, L, M
BLOCKS = {"terrazas": (3, 14), "comercializadora": (21, 32)}  # filas de meses por bloque


def read_canal(r0, r1):
    return {str(y): [cval(r, col) for r in range(r0, r1 + 1)] for y, col in COLS.items()}


canales = {
    "terrazas": read_canal(*BLOCKS["terrazas"]),
    "comercializadora": read_canal(*BLOCKS["comercializadora"]),
    "participacion2026": [cval(r, 14) for r in range(21, 33)],  # col N: solo bloque comercializadora
    "meses": [str(cval(r, 2)).strip() for r in range(21, 33)],
    "totales": {
        "terrazas": {str(y): cval(15, c) for y, c in COLS.items()},
        "comercializadora": {str(y): cval(33, c) for y, c in COLS.items()},
        "participacion2026": cval(33, 14),
    },
    "fuente": "canales 2026.xlsx",
}

dataset = {
    "meta": {
        "titulo": "CIERRE SEPTIEMBRE 2026",
        "periodo": "Enero – Septiembre 2026",
        "fuente": "CIERRE SEPTIEMBRE 2026.xls · canales 2026.xlsx",
    },
    "cierre": cierre,
    "pesos": pesos,
    "kilos": kilos,
    "ciudades": ciudades,
    "ciudadesTotales": {"pesos": tot_p, "kilos": tot_k},
    "canales": canales,
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print("dataset.json OK")
print("cierre:", cierre)
print("kilos ytd:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in kilos["ytd"].items()})
print("pesos ytd:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in pesos["ytd"].items()})
print("ciudades:", len(ciudades))
print("terrazas 2026:", canales["terrazas"]["2026"])
print("comerc 2026:", canales["comercializadora"]["2026"])
print("totales:", canales["totales"])
print("participacion 2026:", [None if p is None else round(p, 3) for p in canales["participacion2026"]])
