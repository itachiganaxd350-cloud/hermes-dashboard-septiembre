import { useEffect, useState } from "react";
import { Scale, Target, TrendingUp, Store, Package } from "lucide-react";
import { cn } from "../lib/utils";

const icons = { scale: Scale, target: Target, trending: TrendingUp, store: Store, package: Package };

export type KpiFormat = "int" | "kg" | "money" | "pct" | "pct2";

export interface Kpi {
  label: string;
  value: string;
  detail: string;
  icon: keyof typeof icons;
  positive: boolean;
  accent?: string;
  raw?: { n: number; fmt: KpiFormat; suffix?: string };
}

interface Props {
  kpi: Kpi;
  delay?: number;
}

const nf0 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmtByKind(n: number, kind: KpiFormat): string {
  switch (kind) {
    case "money":
      return `$ ${nf0.format(n)}`;
    case "kg":
      return nf1.format(n);
    case "pct":
      return `${nf1.format(n)}%`;
    case "pct2":
      return `${nf2.format(n)}%`;
    default:
      return nf0.format(n);
  }
}

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function KpiCard({ kpi, delay = 0 }: Props) {
  const Icon = icons[kpi.icon];
  const accent = kpi.accent ?? "#2563eb";
  const animated = useCountUp(kpi.raw?.n ?? 0);
  const shown = kpi.raw
    ? `${fmtByKind(animated, kpi.raw.fmt)}${kpi.raw.suffix ?? ""}`
    : kpi.value;

  return (
    <div
      className="kpi-card animate-in"
      style={
        {
          animationDelay: `${delay}s`,
          "--kpi-accent": `linear-gradient(90deg, ${accent}, ${accent}55)`,
          "--kpi-glow": `${accent}26`,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center gap-2 text-[hsl(var(--color-muted))] text-[11px] font-semibold uppercase tracking-wider">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Icon size={13} strokeWidth={2.2} />
        </span>
        <span className="truncate">{kpi.label}</span>
      </div>
      <div className="kpi-value">{shown}</div>
      <div
        className={cn(
          "text-[11px] font-semibold leading-snug",
          kpi.positive ? "text-[hsl(var(--color-positive))]" : "text-[hsl(var(--color-negative))]"
        )}
      >
        {kpi.detail}
      </div>
    </div>
  );
}
