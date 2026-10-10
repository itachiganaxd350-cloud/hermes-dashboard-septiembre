import { Target, Package, TrendingUp } from "lucide-react";
import type { CierreSept } from "../data/types";
import type { CumplimientoRow } from "../data/transforms";
import { fmtKg, fmtPct } from "../data/transforms";

interface Props {
  cierre: CierreSept;
  cumplimientos: CumplimientoRow[];
}

export function CierreSeptiembre({ cierre, cumplimientos }: Props) {
  const maxVal = Math.max(cierre.comoCerramos, cierre.presupuesto1, cierre.presupuesto2);
  const bars = [
    { nombre: "Como cerramos", valor: cierre.comoCerramos, color: "#2563eb" },
    { nombre: "Presupuesto 1", valor: cierre.presupuesto1, color: "#10b981" },
    { nombre: "Presupuesto 2", valor: cierre.presupuesto2, color: "#f59e0b" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Número grande */}
      <div className="flex flex-col justify-center gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-2))] p-5">
        <div className="flex items-center gap-2 text-[hsl(var(--color-muted))] text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2563eb1f] text-[#2563eb]">
            <Package size={13} strokeWidth={2.2} />
          </span>
          Como cerramos · Septiembre 2026
        </div>
        <div className="kpi-big">{fmtKg(cierre.comoCerramos)} <span className="text-base font-semibold text-[hsl(var(--color-muted))]">kg</span></div>
        <div className="flex flex-wrap gap-2">
          {cumplimientos.map((c) => {
            const ok = c.cumplimiento >= 100;
            return (
              <span
                key={c.nombre}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  ok ? "text-[hsl(var(--color-positive))]" : "text-[hsl(var(--color-negative))]"
                }`}
                style={{ background: ok ? "hsl(var(--color-positive) / 0.12)" : "hsl(var(--color-negative) / 0.12)" }}
              >
                <TrendingUp size={12} />
                {c.nombre}: {fmtPct(c.cumplimiento, 2)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Barras comparativas + progreso */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-2))] p-5">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))]">
            Cierre vs presupuestos (kg)
          </h4>
          {bars.map((b) => (
            <div key={b.nombre} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-xs font-medium">{b.nombre}</span>
              <div className="progress flex-1" title={`${b.nombre}: ${fmtKg(b.valor)} kg`}>
                <span style={{ width: `${(b.valor / maxVal) * 100}%`, background: b.color }} />
              </div>
              <span className="w-24 shrink-0 text-right font-mono text-xs tabular-nums">{fmtKg(b.valor)}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {cumplimientos.map((c) => {
            const ok = c.cumplimiento >= 100;
            const pct = Math.min(c.cumplimiento, 100);
            return (
              <div key={c.nombre} className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-2))] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))]">
                    <Target size={12} /> {c.nombre}
                  </span>
                  <span
                    className="font-mono text-sm font-bold tabular-nums"
                    style={{ color: ok ? "hsl(var(--color-positive))" : "hsl(var(--color-negative))" }}
                  >
                    {fmtPct(c.cumplimiento, 2)}
                  </span>
                </div>
                <div className="progress" title={`Meta: ${fmtKg(c.presupuesto)} kg`}>
                  <span style={{ width: `${pct}%`, background: c.color }} />
                </div>
                <p className="mt-2 text-[11px] text-[hsl(var(--color-muted))]">
                  Meta {fmtKg(c.presupuesto)} kg · {ok ? "superada" : `${fmtKg(c.presupuesto - cierre.comoCerramos)} kg por debajo`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
