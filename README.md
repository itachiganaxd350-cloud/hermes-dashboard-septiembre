# CIERRE SEPTIEMBRE 2026 — Dashboard

Dashboard interactivo construido **a partir del archivo oficial** `CIERRE SEPTIEMBRE 2026.xls` (escritorio).

🔗 **En vivo:** https://itachiganaxd350-cloud.github.io/hermes-dashboard-septiembre/

## 📑 Alcance por hoja (según lo indicado)

| Hoja del archivo | Qué se tomó | Sección del dashboard |
|---|---|---|
| `CIERRE SEPTIEMBRE ` | **Solo el cuadro morado**: Como cerramos, Presupuesto 1 + Cumplimiento, Presupuesto 2 + Cumplimiento | Cierre de Septiembre |
| `VARIACION EN PESOS AÑO AÑO ` | **Cuadro verde claro**: Mes → Real 2026 en pesos (sin cumplimiento/variación/proyección) | Variación en Pesos |
| `VARIACION EN KILOS AÑO AÑO` | **Cuadro completo**: Mes → Proyección 2027 kilos | Variación en Kilos |
| `CIERRE SEPTIEMBRE CIUDADES` | Tabla completa por ciudad (pesos y kilos) | Ciudades |
| `canales 2026.xlsx` → `INFORM CANALES` | Terrazas y Comercializadora 2022–2026 + participación 2026 | Canales |

## ✅ Fidelidad de datos

`src/data/dataset.json` se genera **leyendo los archivos originales directamente** (script `scripts/build_dataset.py`), sin transcripción manual.
Verificación independiente posterior: **342 checks contra las celdas de los archivos · 0 diferencias** (197 del cierre + 145 de canales).

Los valores derivados (YTD Ene–Sep, % de crecimiento, participación por ciudad) se precalculan en Python y también cuadran con los totales del archivo.

## 🧮 Interactividad

- Selector de tema claro / oscuro
- Gráficas con conmutador **Barras / Líneas** y leyendas activables
- **Canales**: una sola tarjeta con conmutador **Mensual / Comparativo anual / Participación** (+ detalle anual colapsable)
- Ciudades: conmutador **Pesos / Kilos**, **Top 10 / Todas**, buscador y tabla **ordenable por columna**
- KPIs con animación de conteo y acentos por color
- Navegación por secciones (chips) con desplazamiento suave

## 🔧 Reconstruir / desplegar

```bash
# 1. Regenerar dataset desde el .xls (requiere python + xlrd)
python scripts/build_dataset.py

# 2. Build
npm install --include=dev
npm run build

# 3. Publicar (rama gh-pages con el contenido de dist/)
git checkout gh-pages && rm -rf assets index.html && cp -r dist/index.html dist/assets . && touch .nojekyll
git add -A assets/ index.html .nojekyll && git commit -m "Deploy" && git push origin gh-pages && git checkout main
```

## 📝 Notas de auditoría (del archivo, no del dashboard)

- La proyección 2027 viene registrada de **Enero a Septiembre**; Oct–Dic figuran en 0 (sin proyección cargada).
- El total de la hoja **Ciudades** (75.432,98 kg / $858.825.399) es mayor que el cierre de la hoja 2 (71.037,635 kg / $846.059.523 como cierre de septiembre): son bases distintas; ambas se muestran tal cual figuran.
- `MM` en los ejes = miles de millones.
