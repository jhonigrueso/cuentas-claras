export type TipoMovimiento = "ingreso" | "gasto";
export type Naturaleza = "fijo" | "variable";

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  valor: number;
  categoria: string;
  /** Fecha en formato AAAA-MM-DD */
  fecha: string;
  descripcion?: string;
  /** Solo para gastos */
  naturaleza?: Naturaleza;
  /** Solo para gastos variables */
  hormiga?: boolean;
  /** Si el gasto es un abono a una deuda, guarda el id de esa deuda */
  deudaId?: string;
  creadoEn: number;
}

export interface Deuda {
  id: string;
  nombre: string;
  /** Saldo que tenía la deuda cuando se registró. El saldo actual se calcula restando los abonos. */
  saldoInicial: number;
  cuota: number;
  /** Tasa de interés mensual en %, opcional */
  tasa?: number;
  creadoEn: number;
}

export interface Aporte {
  id: string;
  valor: number;
  fecha: string;
}

export interface Meta {
  id: string;
  nombre: string;
  /** null = usar la meta sugerida (3 meses de gastos fijos promedio) */
  objetivoManual: number | null;
  aportes: Aporte[];
}

export interface Perfil {
  /** Nombre con el que la persona quiere que la app la salude */
  nombre: string;
}

export interface DatosApp {
  perfil: Perfil;
  movimientos: Movimiento[];
  deudas: Deuda[];
  metas: Meta[];
}

export const ID_FONDO_EMERGENCIA = "fondo-emergencia";
