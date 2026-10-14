import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import type { CanalAnualRow, CanalMesRow } from "../data/transforms";
import { fmtInt, fmtPct } from "../data/transforms";

interface Props {
  meses: CanalMesRow[];
  anual: CanalAnualRow[];
  resumen: {
    terrazas2026: number;
    comercial2026: number;
    participacion2026: number;
    terrazas2025: number;
    comercial2025: number;
  };
  fuente: string;
}

type Vista = "mensual" | "anual" | "participacion";

export function Canales({ meses, anual, resumen, fuente }: Props) {
  const [vista, setVista] = useState<Vista>("mensual");
  const [verDetalle, setVerDetalle] = useState(false);

  const pills = [
    { label: "Terrazas 2026", valor: fmtInt(resumen.terrazas2026), color: "#3b82f6" },
    { label: "Comercializadora 2026", valor: fmtInt(resumen.comercial2026), color: "#10b981" },
    { label: "Participación", valor: fmtPct(resumen.participacion2026), color: "#8b5cf6" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Controles + resumen compacto */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="seg">
          {(
            [
              ["mensual", "Mensual"],
              ["anual", "Comparativo anual"],
              ["participacion", "Participación"],
            ] as [Vista, string][]
          ).map(([v, label]) => (
            <button key={v} className={`seg-btn ${vista === v ? "active" : ""}`} onClick={() => setVista(v)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pills.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--color-border))] px-2.5 py-1 text-[11px]"
              title={p.label}
            >
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
              <span className="text-[hsl(var(--color-muted))]">{p.label}</span>
              <span className="font-mono font-semibold tabular-nums">{p.valor}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Gráfica según vista */}
      {vista === "mensual" && (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={meses} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={42} />
            <Tooltip formatter={(v: unknown) => (v == null ? "—" : fmtInt(Number(v)))} labelStyle={{ fontWeight: 700 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="terrazas2026" name="Terrazas 2026" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="comercial2026" name="Comercializadora 2026" stroke="#10b981" strokeWidth={2.5} dot={false} />
            <Line
              type="monotone"
              dataKey="terrazas2025"
              name="Terrazas 2025"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="comercial2025"
              name="Comercializadora 2025"
              stroke="#a3e635"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {vista === "anual" && (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={anual} margin={{ left: 0, right: 8, top: 8, bottom: 0 }} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `${(Number(v) / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: unknown) => fmtInt(Number(v))} labelStyle={{ fontWeight: 700 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="terrazas" name="Terrazas" fill="#3b82f6" radius={[5, 5, 0, 0]} maxBarSize={44} />
            <Bar dataKey="comercializadora" name="Comercializadora" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {vista === "participacion" && (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={meses} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={46}
              tickFormatter={(v) => `${v}%`}
              domain={[0, "auto"]}
            />
            <Tooltip formatter={(v: unknown) => (v == null ? "—" : fmtPct(Number(v)))} labelStyle={{ fontWeight: 700 }} />
            <ReferenceLine
              y={resumen.participacion2026}
              stroke="#8b5cf6"
              strokeDasharray="6 4"
              label={{ value: `Promedio ${fmtPct(resumen.participacion2026)}`, position: "insideTopRight", fontSize: 11, fill: "#8b5cf6" }}
            />
            <Line
              type="monotone"
              dataKey="pct2026"
              name="Participación 2026"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Detalle anual (colapsado por defecto para no saturar) */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setVerDetalle((p) => !p)}
          className="self-start text-[12px] font-semibold text-[hsl(var(--color-brand))] hover:underline"
        >
          {verDetalle ? "Ocultar detalle anual" : "Ver detalle anual"}
        </button>
        {verDetalle && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--color-border))]">
                  {["Año", "Terrazas", "Comercializadora", "Total", "Part. Comerc."].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))] ${
                        i === 0 ? "text-left" : "text-right"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {anual.map((r) => (
                  <tr key={r.year} className="border-b border-[hsl(var(--color-border))]/50 hover:bg-[hsl(var(--color-surface))]">
                    <td className="py-1.5 pr-3 font-medium">
                      {r.year}
                      {r.year === 2026 && <span className="ml-1 text-[11px] text-[hsl(var(--color-muted))]">(Ene–Sep)</span>}
                    </td>
                    <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtInt(r.terrazas)}</td>
                    <td className="py-1.5 pr-3 text-right font-mono tabular-nums">{fmtInt(r.comercializadora)}</td>
                    <td className="py-1.5 pr-3 text-right font-mono font-semibold tabular-nums">{fmtInt(r.total)}</td>
                    <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">
                      {r.terrazas > 0 ? fmtPct((r.comercializadora / r.terrazas) * 100) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] text-[hsl(var(--color-muted))]">
              Fuente: <span className="font-mono">{fuente}</span> · Participación = Comercializadora ÷ Terrazas ·
              2026 con datos a Septiembre.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
