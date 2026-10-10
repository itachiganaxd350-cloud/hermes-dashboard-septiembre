# -*- coding: utf-8 -*-
"""Verificacion independiente: dataset.json del dashboard vs celdas del .xls"""
import xlrd, json

XLS = r"C:\Users\ASUS\Desktop\CIERRE SEPTIEMBRE 2026.xls"
DS = r"C:\Users\ASUS\Documents\cierre-septiembre-2026\src\data\dataset.json"
ds = json.load(open(DS, encoding="utf-8"))
b = xlrd.open_workbook(XLS)
s1, s2, s3, s4 = (b.sheet_by_name(n) for n in ["CIERRE SEPTIEMBRE ", "VARIACION EN PESOS AÑO AÑO ", "VARIACION EN KILOS AÑO AÑO", "CIERRE SEPTIEMBRE CIUDADES"])

fails = []
checks = 0


def cmp(name, excel, ds_val):
    global checks
    checks += 1
    if isinstance(excel, float) and isinstance(ds_val, (int, float)):
        ok = abs(excel - ds_val) < 1e-6
    else:
        ok = excel == ds_val
    if not ok:
        fails.append(f"{name}: excel={excel!r} ds={ds_val!r}")


def cell(sh, r, c):
    v = sh.cell_value(r, c)
    if v == "":
        return None
    try:
        f = float(v)
        return int(f) if f.is_integer() else f
    except (TypeError, ValueError):
        return str(v).strip()


# hoja 1 (morado)
cmp("cierre.comoCerramos", cell(s1, 37, 5), ds["cierre"]["comoCerramos"])
cmp("cierre.presupuesto1", cell(s1, 38, 5), ds["cierre"]["presupuesto1"])
cmp("cierre.cumplimiento1", cell(s1, 39, 5), ds["cierre"]["cumplimiento1"])
cmp("cierre.presupuesto2", cell(s1, 40, 5), ds["cierre"]["presupuesto2"])
cmp("cierre.cumplimiento2", cell(s1, 41, 5), ds["cierre"]["cumplimiento2"])

# hoja 2 (pesos)
for i, r in enumerate(range(1, 13)):
    for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026")]:
        cmp(f"pesos.{key}[{ds['pesos']['meses'][i]}]", cell(s2, r, c), ds["pesos"][key][i])
for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026")]:
    cmp(f"pesos.totales.{key}", cell(s2, 13, c), ds["pesos"]["totales"][key])

# hoja 3 (kilos)
for i, r in enumerate(range(2, 14)):
    for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026"), (5, "crecimiento2026"), (6, "proyeccion2027")]:
        cmp(f"kilos.{key}[{ds['kilos']['meses'][i]}]", cell(s3, r, c), ds["kilos"][key][i])
for c, key in [(1, "venta2024"), (2, "real2025"), (3, "presupuesto2026"), (4, "real2026"), (6, "proyeccion2027")]:
    cmp(f"kilos.totales.{key}", cell(s3, 14, c), ds["kilos"]["totales"][key])

# hoja 4 (ciudades)
for i, r in enumerate(range(1, 20)):
    cmp(f"ciudades[{i}].ciudad", cell(s4, r, 0), ds["ciudades"][i]["ciudad"])
    cmp(f"ciudades[{i}].pesos", cell(s4, r, 1), ds["ciudades"][i]["pesos"])
    cmp(f"ciudades[{i}].kilos", cell(s4, r, 2), ds["ciudades"][i]["kilos"])
cmp("ciudadesTotales.pesos", cell(s4, 20, 1), ds["ciudadesTotales"]["pesos"])
cmp("ciudadesTotales.kilos", cell(s4, 20, 2), ds["ciudadesTotales"]["kilos"])

# sumas internas
sr26 = sum(v for v in ds["kilos"]["real2026"] if v)
cmp("suma kilos real2026", ds["kilos"]["totales"]["real2026"], sr26)
sp26 = sum(v for v in ds["pesos"]["real2026"] if v)
cmp("suma pesos real2026", ds["pesos"]["totales"]["real2026"], sp26)
cmp("suma ciudades pesos", ds["ciudadesTotales"]["pesos"], sum(c["pesos"] for c in ds["ciudades"]))
cmp("suma ciudades kilos", round(ds["ciudadesTotales"]["kilos"], 3), round(sum(c["kilos"] for c in ds["ciudades"]), 3))

print(f"CHECKS: {checks} | FALLOS: {len(fails)}")
print("RESULTADO:", "100% FIEL AL ARCHIVO" if not fails else "REVISAR")
for f in fails:
    print(" -", f)
print("\nYTD kilos:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in ds["kilos"]["ytd"].items()})
print("YTD pesos:", {k: (round(v, 2) if isinstance(v, float) else v) for k, v in ds["pesos"]["ytd"].items()})
