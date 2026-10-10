# -*- coding: utf-8 -*-
"""Precomputa dataset.json para el dashboard CIERRE SEPTIEMBRE 2026 leyendo el .xls directo."""
import xlrd, json, os

XLS = r"C:\Users\ASUS\Desktop\CIERRE SEPTIEMBRE 2026.xls"
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


def row_nums(sh, r, c0, c1):
    return [num(sh, r, c) for c in range(c0, c1 + 1)]


# ---------- HOJA 1: cuadro morado (filas 37-41, col 4 label / col 5 valor) ----------
cierre = {
    "comoCerramos": num(sh1, 37, 5),
    "presupuesto1": num(sh1, 38, 5),
    "cumplimiento1": num(sh1, 39, 5),
    "presupuesto2": num(sh1, 40, 5),
    "cumplimiento2": num(sh1, 41, 5),
}

# ---------- HOJA 2: pesos, meses -> real 2026 (cols 0-4) ----------
pesos_meses = [txt(sh2, r, 0) for r in range(1, 13)]
pesos = {
    "meses": pesos_meses,
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

# ---------- HOJA 3: kilos completo (mes -> proyeccion 2027), filas 2-13, cols 0-6 ----------
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

# derivados YTD (Ene-Sep = meses con real 2026)
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
p26 = sum(v for v in pesos["real2026"] if v is not None)
p25 = sum(v for v in pesos["real2025"][:n_real] if v is not None)
pesos["ytd"] = {
    "meses": n_real,
    "real2026": p26,
    "real2025": p25,
    "crecimientoPct": (p26 - p25) / p25 * 100,
}

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

dataset = {
    "meta": {
        "titulo": "CIERRE SEPTIEMBRE 2026",
        "periodo": "Enero – Septiembre 2026",
        "fuente": "CIERRE SEPTIEMBRE 2026.xls",
    },
    "cierre": cierre,
    "pesos": pesos,
    "kilos": kilos,
    "ciudades": ciudades,
    "ciudadesTotales": {"pesos": tot_p, "kilos": tot_k},
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print("dataset.json OK")
print("cierre:", cierre)
print("pesos totales:", pesos["totales"], "| ytd:", pesos["ytd"])
print("kilos totales:", kilos["totales"], "| ytd:", {k: (round(v, 4) if isinstance(v, float) else v) for k, v in kilos["ytd"].items()})
print("ciudades:", len(ciudades), "| totales:", dataset["ciudadesTotales"])
print("suma kilos real2026:", r26, "vs total hoja:", kilos["totales"]["real2026"])
print("suma pesos real2026:", p26, "vs total hoja:", pesos["totales"]["real2026"])
print("suma ciudades pesos:", sum(c["pesos"] for c in ciudades), "vs", tot_p)
print("suma ciudades kilos:", round(sum(c["kilos"] for c in ciudades), 4), "vs", tot_k)
