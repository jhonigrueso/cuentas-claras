import { buscarCategoria } from "./categorias";
import { pesos } from "./formato";
import type { Deuda, Meta, Movimiento } from "./tipos";

export function delMes(movimientos: Movimiento[], mes: string): Movimiento[] {
  return movimientos.filter((m) => m.fecha.startsWith(mes));
}

export function ordenarRecientes(movimientos: Movimiento[]): Movimiento[] {
  return [...movimientos].sort(
    (a, b) => b.fecha.localeCompare(a.fecha) || b.creadoEn - a.creadoEn,
  );
}

function sumar(lista: { valor: number }[]): number {
  return lista.reduce((total, m) => total + m.valor, 0);
}

export interface ResumenMes {
  ingresos: number;
  gastos: number;
  saldo: number;
  fijos: number;
  variables: number;
  hormiga: number;
  cantidadHormiga: number;
  porCategoria: { nombre: string; icono: string; color: string; valor: number }[];
}

export function resumenDelMes(movimientos: Movimiento[], mes: string): ResumenMes {
  const lista = delMes(movimientos, mes);
  const ingresos = sumar(lista.filter((m) => m.tipo === "ingreso"));
  const gastos = lista.filter((m) => m.tipo === "gasto");
  const totalGastos = sumar(gastos);
  const hormigas = gastos.filter((m) => m.hormiga);

  const mapa = new Map<string, number>();
  for (const g of gastos) mapa.set(g.categoria, (mapa.get(g.categoria) ?? 0) + g.valor);
  const porCategoria = [...mapa.entries()]
    .map(([nombre, valor]) => ({ ...buscarCategoria("gasto", nombre), nombre, valor }))
    .sort((a, b) => b.valor - a.valor);

  return {
    ingresos,
    gastos: totalGastos,
    saldo: ingresos - totalGastos,
    fijos: sumar(gastos.filter((m) => m.naturaleza === "fijo")),
    variables: sumar(gastos.filter((m) => m.naturaleza !== "fijo")),
    hormiga: sumar(hormigas),
    cantidadHormiga: hormigas.length,
    porCategoria,
  };
}

/** Promedio mensual de gastos fijos, contando solo los meses que tienen gastos fijos registrados */
export function promedioGastosFijos(movimientos: Movimiento[]): number {
  const porMes = new Map<string, number>();
  for (const m of movimientos) {
    if (m.tipo !== "gasto" || m.naturaleza !== "fijo") continue;
    const mes = m.fecha.slice(0, 7);
    porMes.set(mes, (porMes.get(mes) ?? 0) + m.valor);
  }
  if (porMes.size === 0) return 0;
  let total = 0;
  for (const valor of porMes.values()) total += valor;
  return Math.round(total / porMes.size);
}

export function metaSugeridaFondo(movimientos: Movimiento[]): number {
  // Redondeada a miles para que sea una cifra fácil de recordar
  return Math.round((promedioGastosFijos(movimientos) * 3) / 1000) * 1000;
}

export function ahorradoEnMeta(meta: Meta | undefined): number {
  return meta ? sumar(meta.aportes) : 0;
}

export function objetivoDeMeta(meta: Meta | undefined, movimientos: Movimiento[]): number {
  if (meta?.objetivoManual && meta.objetivoManual > 0) return meta.objetivoManual;
  return metaSugeridaFondo(movimientos);
}

export function porcentaje(parte: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((parte / total) * 100)));
}

/* ---------- Deudas ---------- */

export function pagadoDeDeuda(deuda: Deuda, movimientos: Movimiento[]): number {
  return sumar(movimientos.filter((m) => m.deudaId === deuda.id));
}

export function saldoDeDeuda(deuda: Deuda, movimientos: Movimiento[]): number {
  return Math.max(0, deuda.saldoInicial - pagadoDeDeuda(deuda, movimientos));
}

export type MetodoDeuda = "bola" | "avalancha";

export function ordenarDeudas<T extends Deuda & { saldo: number }>(deudas: T[], metodo: MetodoDeuda): T[] {
  return [...deudas].sort((a, b) => {
    // Las deudas ya pagadas van al final
    if ((a.saldo === 0) !== (b.saldo === 0)) return a.saldo === 0 ? 1 : -1;
    if (metodo === "avalancha") {
      const diferencia = (b.tasa ?? -1) - (a.tasa ?? -1);
      if (diferencia !== 0) return diferencia;
    }
    return a.saldo - b.saldo;
  });
}

/* ---------- Consejo del mes ---------- */

export interface Consejo {
  icono: string;
  titulo: string;
  texto: string;
  tono: "alerta" | "aviso" | "bien";
}

export function consejoDelMes(resumen: ResumenMes, ahorroFondo: number, metaFondo: number): Consejo {
  const { ingresos, gastos, hormiga, cantidadHormiga } = resumen;

  if (ingresos === 0 && gastos === 0) {
    return {
      icono: "✍️",
      titulo: "Empieza por anotar",
      texto: "Registra tus ingresos y gastos de este mes. Lo que no se anota, no se puede mejorar.",
      tono: "aviso",
    };
  }
  if (gastos > ingresos * 0.9) {
    return {
      icono: "⚠️",
      titulo: "Tus gastos se están comiendo tus ingresos",
      texto:
        gastos > ingresos
          ? "Este mes sale más plata de la que entra. Revisa los gastos variables y escoge uno o dos para recortar desde ya."
          : "Estás gastando más del 90 % de lo que ganas. Intenta separar al menos el 10 % apenas recibas tu pago, antes de gastar.",
      tono: "alerta",
    };
  }
  if (cantidadHormiga >= 6 || (gastos > 0 && hormiga / gastos >= 0.1)) {
    return {
      icono: "🐜",
      titulo: "Ojo con los gastos hormiga",
      texto: `Llevas ${cantidadHormiga} gastos pequeños que suman ${pesos(hormiga)}. En un año serían ${pesos(
        hormiga * 12,
      )}. Escoge uno para dejarlo esta semana.`,
      tono: "aviso",
    };
  }
  if (ahorroFondo === 0 || (metaFondo > 0 && ahorroFondo < metaFondo * 0.1)) {
    return {
      icono: "🛟",
      titulo: "Arma tu fondo de emergencia",
      texto:
        "Un imprevisto (una enfermedad, un daño en la casa) se puede volver deuda. Aparta aunque sea $5.000 cada semana en un lugar aparte.",
      tono: "aviso",
    };
  }
  return {
    icono: "🌱",
    titulo: "¡Vas por buen camino!",
    texto: "Tus cuentas están en orden. Sigue anotando todo y aumenta poco a poco tu ahorro.",
    tono: "bien",
  };
}
