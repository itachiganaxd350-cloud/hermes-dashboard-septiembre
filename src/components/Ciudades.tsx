import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
} from "recharts";
import type { Ciudad } from "../data/types";
import { fmtAxisMoney, fmtInt, fmtKg, fmtMoney, fmtPct } from "../data/transforms";

interface Props {
  ciudades: Ciudad[];
  totales: { pesos: number; kilos: number };
}

type Metrica = "pesos" | "kilos";
type SortKey = "ciudad" | "pesos" | "pctPesos" | "kilos" | "pctKilos";

const PALETA = ["#2563eb", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#6366f1", "#14b8a6", "#94a3b8"];

export function Ciudades({ ciudades, totales }: Props) {
  const [metrica, setMetrica] = useState<Metrica>("pesos");
  const [topN, setTopN] = useState<number>(10);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("pesos");
  const [sortAsc, setSortAsc] = useState(false);

  const ordenadas = useMemo(
    () => [...ciudades].sort((a, b) => (b[metrica] as number) - (a[metrica] as number)),
    [ciudades, metrica]
  );

  const ranking = ordenadas.slice(0, topN).map((c) => ({
    ciudad: c.ciudad.length > 22 ? `${c.ciudad.slice(0, 21)}…` : c.ciudad,
    valor: c[metrica] as number,
  }));

  const donut = useMemo(() => {
    const top = ordenadas.slice(0, 8);
    const resto = ordenadas.slice(8).reduce((a, c) => a + (c[metrica] as number), 0);
    return [
      ...top.map((c) => ({ name: c.ciudad, value: c[metrica] as number })),
      ...(resto > 0 ? [{ name: "Resto", value: resto }] : []),
    ];
  }, [ordenadas, metrica]);

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? ciudades.filter((c) => c.ciudad.toLowerCase().includes(q)) : [...ciudades];
    base.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      const cmp = typeof va === "string" ? String(va).localeCompare(String(vb)) : Number(va) - Number(vb);
      return sortAsc ? cmp : -cmp;
    });
    return base;
  }, [ciudades, query, sortKey, sortAsc]);

  const clickSort = (k: SortKey) => {
    if (k === sortKey) setSortAsc((p) => !p);
    else {
      setSortKey(k);
      setSortAsc(k === "ciudad");
    }
  };

  const th = (label: string, k: SortKey, align: "left" | "right" = "right") => (
    <th
      onClick={() => clickSort(k)}
      className={`sortable py-2 pr-3 text-[11px] font-semibold uppercase tracking-wider ${
        sortKey === k ? "sorted" : "text-[hsl(var(--color-muted))]"
      } ${align === "left" ? "text-left" : "text-right"}`}
      title="Clic para ordenar"
    >
      {label} {sortKey === k ? (sortAsc ? "▲" : "▼") : ""}
    </th>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Controles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="seg">
            {(["pesos", "kilos"] as Metrica[]).map((m) => (
              <button key={m} className={`seg-btn ${metrica === m ? "active" : ""}`} onClick={() => setMetrica(m)}>
                {m === "pesos" ? "Pesos" : "Kilos"}
              </button>
            ))}
          </div>
          <div className="seg">
            {[10, 19].map((n) => (
              <button key={n} className={`seg-btn ${topN === n ? "active" : ""}`} onClick={() => setTopN(n)}>
                {n === 19 ? "Todas" : `Top ${n}`}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full sm:w-64">
          <input
            className="search"
            placeholder="Buscar ciudad…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Ranking + donut */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ResponsiveContainer width="100%" height={Math.max(280, ranking.length * 30 + 30)}>
          <BarChart data={ranking} layout="vertical" margin={{ left: 0, right: 40, top: 4, bottom: 4 }} barCategoryGap="24%">
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (metrica === "pesos" ? fmtAxisMoney(Number(v)) : `${(Number(v) / 1000).toFixed(0)}k`)}
            />
            <YAxis
              type="category"
              dataKey="ciudad"
              tick={{ fontSize: 11, fill: "hsl(var(--color-text))" }}
              tickLine={false}
              axisLine={false}
              width={150}
            />
            <Tooltip
              formatter={(v: unknown) => (metrica === "pesos" ? fmtMoney(Number(v)) : `${fmtKg(Number(v))} kg`)}
              cursor={{ fill: "hsl(var(--color-muted) / 0.06)" }}
              labelStyle={{ fontWeight: 700 }}
            />
            <Bar dataKey="valor" name={metrica === "pesos" ? "Pesos" : "Kilos"} radius={[0, 5, 5, 0]} maxBarSize={18}>
              {ranking.map((_, i) => (
                <Cell key={i} fill={PALETA[i % PALETA.length]} fillOpacity={i < 3 ? 1 : 0.55} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex flex-col gap-2">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))]">
            Participación {metrica === "pesos" ? "en pesos" : "en kilos"}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donut}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={104}
                paddingAngle={2}
                strokeWidth={0}
              >
                {donut.map((_, i) => (
                  <Cell key={i} fill={PALETA[i % PALETA.length]} fillOpacity={i < 8 ? 1 : 0.45} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: unknown) => (metrica === "pesos" ? fmtMoney(Number(v)) : `${fmtKg(Number(v))} kg`)}
                contentStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="flex flex-col gap-1 text-xs">
            {donut.slice(0, 5).map((d, i) => (
              <li key={d.name} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 truncate">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETA[i % PALETA.length] }} />
                  {d.name}
                </span>
                <span className="font-mono tabular-nums text-[hsl(var(--color-muted))]">
                  {fmtPct((d.value / (metrica === "pesos" ? totales.pesos : totales.kilos)) * 100)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--color-border))]">
              {th("Ciudad", "ciudad", "left")}
              {th("Pesos", "pesos")}
              {th("% Pesos", "pctPesos")}
              {th("Kilos", "kilos")}
              {th("% Kilos", "pctKilos")}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((c) => (
              <tr key={c.ciudad} className="border-b border-[hsl(var(--color-border))]/50 transition-colors hover:bg-[hsl(var(--color-surface))]">
                <td className="py-1.5 pr-3 font-medium">{c.ciudad}</td>
                <td className={`py-1.5 pr-3 text-right font-mono tabular-nums ${metrica === "pesos" ? "font-semibold" : ""}`}>
                  {fmtMoney(c.pesos)}
                </td>
                <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">{fmtPct(c.pctPesos, 2)}</td>
                <td className={`py-1.5 pr-3 text-right font-mono tabular-nums ${metrica === "kilos" ? "font-semibold" : ""}`}>
                  {fmtKg(c.kilos)}
                </td>
                <td className="py-1.5 pr-3 text-right font-mono tabular-nums text-[hsl(var(--color-muted))]">{fmtPct(c.pctKilos, 2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[hsl(var(--color-border))] font-bold">
              <td className="py-2 pr-3">
                TOTAL {query ? <span className="text-xs font-normal text-[hsl(var(--color-muted))]">({filtradas.length} de {ciudades.length})</span> : `(${ciudades.length} ciudades)`}
              </td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(filtradas.reduce((a, c) => a + c.pesos, 0))}</td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums">
                {fmtPct(filtradas.reduce((a, c) => a + c.pctPesos, 0), 2)}
              </td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtKg(filtradas.reduce((a, c) => a + c.kilos, 0))}</td>
              <td className="py-2 pr-3 text-right font-mono tabular-nums">
                {fmtPct(filtradas.reduce((a, c) => a + c.pctKilos, 0), 2)}
              </td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-2 text-[11px] text-[hsl(var(--color-muted))]">
          Total archivo: {fmtMoney(totales.pesos)} · {fmtInt(totales.kilos)} kg
        </p>
      </div>
    </div>
  );
}
