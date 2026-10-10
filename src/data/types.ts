export interface CierreSept {
  comoCerramos: number;
  presupuesto1: number;
  cumplimiento1: number;
  presupuesto2: number;
  cumplimiento2: number;
}

export interface TotalesPesos {
  venta2024: number;
  real2025: number;
  presupuesto2026: number;
  real2026: number;
}

export interface PesosData {
  meses: string[];
  venta2024: (number | null)[];
  real2025: (number | null)[];
  presupuesto2026: (number | null)[];
  real2026: (number | null)[];
  totales: TotalesPesos;
  ytd: { meses: number; real2026: number; real2025: number; crecimientoPct: number };
}

export interface TotalesKilos {
  venta2024: number;
  real2025: number;
  presupuesto2026: number;
  real2026: number;
  proyeccion2027: number;
}

export interface KilosData {
  meses: string[];
  venta2024: (number | null)[];
  real2025: (number | null)[];
  presupuesto2026: (number | null)[];
  real2026: (number | null)[];
  crecimiento2026: (number | null)[];
  proyeccion2027: (number | null)[];
  totales: TotalesKilos;
  ytd: {
    meses: number;
    real2026: number;
    real2025: number;
    venta2024: number;
    presupuesto2026: number;
    crecimientoPct: number;
    cumplimientoPct: number;
  };
}

export interface Ciudad {
  ciudad: string;
  pesos: number;
  kilos: number;
  pctPesos: number;
  pctKilos: number;
}

export interface Dataset {
  meta: { titulo: string; periodo: string; fuente: string };
  cierre: CierreSept;
  pesos: PesosData;
  kilos: KilosData;
  ciudades: Ciudad[];
  ciudadesTotales: { pesos: number; kilos: number };
}
