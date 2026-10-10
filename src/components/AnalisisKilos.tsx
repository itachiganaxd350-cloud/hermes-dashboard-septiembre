import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import type { CrecimientoRow, KilosSerie, ProyeccionRow } from "../data/transforms";
import type { TotalesKilos } from "../data/types";
import { fmtAxisKg, fmtKg, fmtPct } from "../data/transforms";

interface Props {
  series: KilosSerie[];
  crecimiento: CrecimientoRow[];
  proyeccion: ProyeccionRow[];
  totales: TotalesKilos;
}

type Vista = "barras" | "lineas";

export function AnalisisKilos({ series, crecimiento, proyeccion, totales }: Props) {
  const [vista, setVista] = useState<Vista>("barras");

  return (
    <div className="flex flex-col gap-6">
      {/* Comparativo */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[hsl(var(--color-muted))]">
            Comparativo año / año en kilos · <span className="font-mono">kg</span>
          </p>
          <div className="seg">
            {(["barras", "lineas"] as Vista[]).map((v) => (
              <button key={v} className={`seg-btn ${vista === v ? "active" : ""}`} onClick={() => setVista(v)}>
                {v === "barras" ? "Barras" : "Líneas"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }} barCategoryGap="22%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mesCorto" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={(v) => fmtAxisKg(Number(v))}
            />
            <Tooltip formatter={(v: unknown) => `${fmtKg(Number(v))} kg`} labelStyle={{ fontWeight: 700 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {vista === "barras" ? (
              <>
                <Bar dataKey="venta2024" name="Venta 2024" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar dataKey="real2025" name="Real 2025" fill="#3b82f6" fillOpacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar dataKey="real2026" name="Real 2026" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={15} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="venta2024" name="Venta 2024" stroke="#cbd5e1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="real2025" name="Real 2025" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="real2026" name="Real 2026" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0 }} />
              </>
            )}
            <Line
              type="monotone"
              dataKey="presupuesto2026"
              name="Presupuesto 2026"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="7 5"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Crecimiento % + Proyección 2027 */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))]">
            Crecimiento 2026 vs 2025 (%, Ene–Sep)
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={crecimiento} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={46}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip formatter={(v: unknown) => fmtPct(Number(v))} labelStyle={{ fontWeight: 700 }} />
              <ReferenceLine y={0} stroke="hsl(var(--color-muted))" strokeOpacity={0.4} />
              <Bar dataKey="crecimiento" name="Crecimiento" radius={[5, 5, 0, 0]} maxBarSize={36}>
                {crecimiento.map((c, i) => (
                  <Cell key={i} fill={(c.crecimiento ?? 0) < 0 ? "#f43f5e" : "#10b981"} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))]">
            Real 2026 vs Proyección 2027 (kg)
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={proyeccion} margin={{ left: 0, right: 8, top: 8, bottom: 0 }} barCategoryGap="24%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(v) => fmtAxisKg(Number(v))}
              />
              <Tooltip formatter={(v: unknown) => `${fmtKg(Number(v))} kg`} labelStyle={{ fontWeight: 700 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
              <Bar dataKey="real2026" name="Real 2026" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="proyeccion2027" name="Proyección 2027" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TablaKilos series={series} totales={totales} />
    </div>
  );
}

function TablaKilos({ series, totales }: { series: KilosSerie[]; totales: TotalesKilos }) {
  const proy = (s: KilosSerie) => (s.proyeccion2027 === 0 && s.real2026 == null ? null : s.proyeccion2027);
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            {["Mes", "Venta 2024", "Real 2025", "Presupuesto 2026", "Real 2026", "Crecimiento 2026", "Proyección 2027"].map(
              (h) => (
                <th
                  key={h}
                  className={`py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))] ${
                    h === "Mes" ? "text-left" : "text-right"
                  }`}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.mes} className="border-b border-[hsl(var(--color-border))]/50 transition-colors hover:bg-[hsl(var(--color-surface))]">
              <td className="py-1.5 pr-3 font-medium">{s.mes}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtKg(s.venta2024)}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtKg(s.real2025)}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">{fmtKg(s.presupuesto2026)}</td>
              <td className="py-1.5 pr-3 text-right font-mono font-semibold tabular-nums">{fmtKg(s.real2026)}</td>
              <td
                className={`py-1.5 pr-3 text-right font-mono tabular-nums ${
                  (s.crecimiento2026 ?? 0) >= 0 ? "text-[hsl(var(--color-positive))]" : "text-[hsl(var(--color-negative))]"
                }`}
              >
                {s.crecimiento2026 == null ? "—" : `+${fmtPct(s.crecimiento2026)}`.replace("++", "+")}
              </td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-[#06b6d4]">{fmtKg(proy(s))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[hsl(var(--color-border))] font-bold">
            <td className="py-2 pr-3">TOTAL</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtKg(totales.venta2024)}</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtKg(totales.real2025)}</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtKg(totales.presupuesto2026)}</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtKg(totales.real2026)}</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">—</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums text-[#06b6d4]">{fmtKg(totales.proyeccion2027)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
