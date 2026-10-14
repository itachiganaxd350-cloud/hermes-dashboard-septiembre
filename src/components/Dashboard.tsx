import type { ReactNode } from "react";
import {
  Sun,
  Moon,
  Boxes,
  ClipboardList,
  Coins,
  Scale,
  MapPin,
  LayoutDashboard,
  Handshake,
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import { CierreSeptiembre } from "./CierreSeptiembre";
import { AnalisisPesos } from "./AnalisisPesos";
import { AnalisisKilos } from "./AnalisisKilos";
import { Canales } from "./Canales";
import { Ciudades } from "./Ciudades";
import { buildDashboard } from "../data/transforms";
import type { Dataset } from "../data/types";

interface Props {
  data: Dataset;
  dark: boolean;
  toggleTheme: () => void;
}

function Section({
  id,
  icon,
  title,
  subtitle,
  children,
  delay = 0,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <section id={id} className="chart-card animate-in scroll-mt-24 p-5 md:p-6" style={{ animationDelay: `${delay}s` }}>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "hsl(var(--color-brand) / 0.12)", color: "hsl(var(--color-brand))" }}
          >
            {icon}
          </span>
          <div>
            <h2 className="text-sm font-bold tracking-tight md:text-base">{title}</h2>
            {subtitle && <p className="text-xs text-[hsl(var(--color-muted))]">{subtitle}</p>}
          </div>
        </div>
        <span className="dot mt-1" />
      </header>
      {children}
    </section>
  );
}

const signature = String.raw`
 ╔══════════════════════════════════════════════╗
 ║    J U L I A N   A N D R E S   P A R D O     ║
 ╚══════════════════════════════════════════════╝`;

export function Dashboard({ data, dark, toggleTheme }: Props) {
  const d = buildDashboard(data);

  const nav = [
    { id: "cierre", label: "Cierre Septiembre", icon: <ClipboardList size={13} /> },
    { id: "pesos", label: "Variación en Pesos", icon: <Coins size={13} /> },
    { id: "kilos", label: "Variación en Kilos", icon: <Scale size={13} /> },
    { id: "canales", label: "Canales", icon: <Handshake size={13} /> },
    { id: "ciudades", label: "Ciudades", icon: <MapPin size={13} /> },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 p-4 md:p-8">
      {/* HERO */}
      <header className="hero animate-in p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <Boxes size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">{data.meta.titulo}</h1>
                <span className="hidden rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-widest text-white/90 ring-1 ring-white/20 sm:inline">
                  KG · $
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-white/75">
                Comportamiento comercial · {data.meta.periodo} ·{" "}
                <span className="font-mono text-white/60">{data.meta.fuente}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge-live">
              <span className="pulse-dot" />
              CIERRE CARGADO
            </span>
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/25"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* NAV */}
      <nav className="flex flex-wrap items-center gap-2">
        <span className="mr-1 hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--color-muted))] sm:flex">
          <LayoutDashboard size={14} /> Secciones
        </span>
        {nav.map((n) => (
          <a key={n.id} href={`#${n.id}`} className="chip">
            {n.icon}
            {n.label}
          </a>
        ))}
      </nav>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {d.kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} delay={0.05 + i * 0.06} />
        ))}
      </div>

      {/* SECCIONES */}
      <Section
        id="cierre"
        icon={<ClipboardList size={16} />}
        title="Cierre de Septiembre"
        subtitle="Cuadro «Como cerramos» y cumplimiento de presupuestos"
        delay={0.15}
      >
        <CierreSeptiembre cierre={data.cierre} cumplimientos={d.cumplimientos} />
      </Section>

      <Section
        id="pesos"
        icon={<Coins size={16} />}
        title="Variación en Pesos Año a Año"
        subtitle="Desde el mes hasta el Real 2026 en pesos"
        delay={0.2}
      >
        <AnalisisPesos series={d.pesosSeries} totales={data.pesos.totales} />
      </Section>

      <Section
        id="kilos"
        icon={<Scale size={16} />}
        title="Variación en Kilos Año a Año"
        subtitle="Mes a mes · crecimiento 2026 · proyección 2027 (kg)"
        delay={0.25}
      >
        <AnalisisKilos
          series={d.kilosSeries}
          crecimiento={d.crecimiento}
          proyeccion={d.proyeccion}
          totales={data.kilos.totales}
        />
      </Section>

      <Section
        id="canales"
        icon={<Handshake size={16} />}
        title="Canales"
        subtitle="Terrazas vs Comercializadora · comparativo año a año"
        delay={0.28}
      >
        <Canales
          meses={d.canalMeses}
          anual={d.canalAnual}
          resumen={d.canalResumen}
          fuente={data.canales.fuente}
        />
      </Section>

      <Section
        id="ciudades"
        icon={<MapPin size={16} />}
        title="Cierre Septiembre por Ciudades"
        subtitle={`${data.ciudades.length} ciudades · pesos y kilos`}
        delay={0.3}
      >
        <Ciudades ciudades={data.ciudades} totales={data.ciudadesTotales} />
      </Section>

      {/* FOOTER */}
      <footer className="mt-2 flex flex-col items-center gap-4 border-t border-[hsl(var(--color-border))] pt-6 pb-2 text-center">
        <pre className="ascii-signature text-[10px] md:text-[11px]">{signature}</pre>
        <p className="max-w-3xl text-xs leading-relaxed text-[hsl(var(--color-muted))]">
          Fuente oficial: <span className="font-mono">{data.meta.fuente}</span> · hojas: Cierre Septiembre,
          Variación en Pesos Año a Año, Variación en Kilos Año a Año y Cierre Septiembre Ciudades · Cifras tal
          como figuran en el archivo (kg y pesos COP) · La proyección 2027 viene registrada de Enero a Septiembre ·
          MM = miles de millones.
        </p>
      </footer>
    </div>
  );
}
