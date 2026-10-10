import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { MesSerie } from "../data/transforms";
import type { TotalesPesos } from "../data/types";
import { fmtAxisMoney, fmtMoney } from "../data/transforms";

interface Props {
  series: MesSerie[];
  totales: TotalesPesos;
}

type Vista = "barras" | "lineas";

export function AnalisisPesos({ series, totales }: Props) {
  const [vista, setVista] = useState<Vista>("barras");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[hsl(var(--color-muted))]">
          Mes a mes · Venta 2024, Real 2025, Presupuesto 2026 y Real 2026 · <span className="font-mono">pesos COP</span>
        </p>
        <div className="seg">
          {(["barras", "lineas"] as Vista[]).map((v) => (
            <button key={v} className={`seg-btn ${vista === v ? "active" : ""}`} onClick={() => setVista(v)}>
              {v === "barras" ? "Barras" : "Líneas"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={series} margin={{ left: 4, right: 8, top: 8, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="mesCorto" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={(v) => fmtAxisMoney(Number(v))}
          />
          <Tooltip formatter={(v: unknown) => fmtMoney(Number(v))} labelStyle={{ fontWeight: 700 }} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {vista === "barras" ? (
            <>
              <Bar dataKey="venta2024" name="Venta 2024" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="real2025" name="Real 2025" fill="#3b82f6" fillOpacity={0.55} radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="real2026" name="Real 2026" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={16} />
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

      <TablaMeses series={series} totales={totales} />
    </div>
  );
}

function TablaMeses({ series, totales }: Props) {
  const rows: { mes: string; v24: number | null; r25: number | null; p26: number | null; r26: number | null }[] =
    series.map((s) => ({ mes: s.mes, v24: s.venta2024, r25: s.real2025, p26: s.presupuesto2026, r26: s.real2026 }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-[hsl(var(--color-border))]">
            {["Mes", "Venta 2024", "Real 2025", "Presupuesto 2026", "Real 2026"].map((h) => (
              <th
                key={h}
                className={`py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))] ${
                  h === "Mes" ? "text-left" : "text-right"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.mes} className="border-b border-[hsl(var(--color-border))]/50 transition-colors hover:bg-[hsl(var(--color-surface))]">
              <td className="py-1.5 pr-3 font-medium">{r.mes}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtMoney(r.v24)}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtMoney(r.r25)}</td>
              <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">{fmtMoney(r.p26)}</td>
              <td className="py-1.5 pr-3 text-right font-mono font-semibold tabular-nums">{fmtMoney(r.r26)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[hsl(var(--color-border))] font-bold">
            <td className="py-2 pr-3">TOTAL</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(totales.venta2024)}</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(totales.real2025)}</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(totales.presupuesto2026)}</td>
            <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(totales.real2026)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
