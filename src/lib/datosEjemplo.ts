import { CATEGORIA_DEUDAS } from "./categorias";
import { fechaISO, nuevoId } from "./formato";
import { ID_FONDO_EMERGENCIA, type DatosApp, type Movimiento, type Naturaleza } from "./tipos";

/**
 * Datos de una familia de ejemplo para la demostración del taller.
 * Se generan para el mes actual y los dos anteriores, sin fechas futuras.
 */
export function crearDatosEjemplo(): DatosApp {
  const hoy = new Date();
  const movimientos: Movimiento[] = [];
  let orden = 0;

  /** Fecha de un día en el mes actual (0) o en meses anteriores (-1, -2) */
  function fecha(mesesAtras: number, dia: number): string | null {
    const base = new Date(hoy.getFullYear(), hoy.getMonth() + mesesAtras, 1);
    const diasDelMes = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const d = Math.min(dia, diasDelMes);
    if (mesesAtras === 0 && d > hoy.getDate()) return null;
    return fechaISO(base.getFullYear(), base.getMonth(), d);
  }

  function ingreso(mes: number, dia: number, valor: number, categoria: string, descripcion?: string) {
    const f = fecha(mes, dia);
    if (!f) return;
    movimientos.push({ id: nuevoId(), tipo: "ingreso", valor, categoria, fecha: f, descripcion, creadoEn: ++orden });
  }

  function gasto(
    mes: number,
    dia: number,
    valor: number,
    categoria: string,
    naturaleza: Naturaleza,
    descripcion?: string,
    deudaId?: string,
  ) {
    const f = fecha(mes, dia);
    if (!f) return;
    movimientos.push({
      id: nuevoId(),
      tipo: "gasto",
      valor,
      categoria,
      fecha: f,
      descripcion,
      naturaleza,
      hormiga: naturaleza === "variable" && valor <= 15000,
      deudaId,
      creadoEn: ++orden,
    });
  }

  const moto = { id: nuevoId(), nombre: "Crédito moto", saldoInicial: 4800000, cuota: 320000, tasa: 1.9, creadoEn: 1 };
  const tarjeta = { id: nuevoId(), nombre: "Tarjeta de crédito", saldoInicial: 1350000, cuota: 150000, tasa: 2.6, creadoEn: 2 };
  const gota = { id: nuevoId(), nombre: "Préstamo de la tía", saldoInicial: 400000, cuota: 100000, creadoEn: 3 };

  for (const mes of [-2, -1, 0]) {
    ingreso(mes, 1, 1450000, "Salario", "Pago quincena");
    ingreso(mes, 15, 1450000, "Salario", "Pago quincena");
    ingreso(mes, 9, 180000 + (mes + 2) * 20000, "Ventas", "Venta de empanadas");
    if (mes !== -1) ingreso(mes, 22, 150000, "Trabajo extra", "Arreglo de una cocina");

    gasto(mes, 2, 650000, "Vivienda/arriendo", "fijo", "Arriendo");
    gasto(mes, 5, 95000, "Servicios públicos", "fijo", "Energía (Celsia)");
    gasto(mes, 6, 62000, "Servicios públicos", "fijo", "Agua y alcantarillado");
    gasto(mes, 7, 48000, "Servicios públicos", "fijo", "Gas");
    gasto(mes, 4, 55000, "Celular/internet", "fijo", "Plan de internet");
    gasto(mes, 10, 35000, "Celular/internet", "variable", "Recarga celular");
    gasto(mes, 3, 120000, "Educación", "fijo", "Pensión del colegio");

    gasto(mes, 3, 210000, "Mercado", "variable", "Mercado de la quincena");
    gasto(mes, 17, 230000, "Mercado", "variable", "Mercado de la quincena");
    gasto(mes, 12, 38000, "Mercado", "variable", "Plaza: frutas y verduras");
    gasto(mes, 1, 160000, "Transporte", "variable", "Gasolina y pasajes");
    gasto(mes, 16, 140000, "Transporte", "variable", "Gasolina y pasajes");
    gasto(mes, 20, 42000, "Salud", "variable", "Droguería");
    gasto(mes, 13, 85000, "Gustos y salidas", "variable", "Salida en familia");

    // Gastos hormiga
    gasto(mes, 2, 2500, "Gustos y salidas", "variable", "Tinto");
    gasto(mes, 4, 3500, "Gustos y salidas", "variable", "Empanada y gaseosa");
    gasto(mes, 8, 6000, "Gustos y salidas", "variable", "Mecato");
    gasto(mes, 11, 12000, "Gustos y salidas", "variable", "Chance");
    gasto(mes, 14, 4000, "Transporte", "variable", "Mototaxi");
    gasto(mes, 18, 9000, "Gustos y salidas", "variable", "Cerveza");
    gasto(mes, 21, 2500, "Gustos y salidas", "variable", "Tinto");
    gasto(mes, 24, 7000, "Celular/internet", "variable", "Paquete de datos");

    // Abonos a deudas (también son gastos fijos)
    gasto(mes, 5, 320000, CATEGORIA_DEUDAS, "fijo", `Abono a ${moto.nombre}`, moto.id);
    gasto(mes, 15, 150000, CATEGORIA_DEUDAS, "fijo", `Abono a ${tarjeta.nombre}`, tarjeta.id);
    if (mes === -1) gasto(mes, 20, 100000, CATEGORIA_DEUDAS, "fijo", `Abono a ${gota.nombre}`, gota.id);
  }

  const aportes = [-2, -1, 0]
    .map((mes) => fecha(mes, 16))
    .filter((f): f is string => f !== null)
    .map((f) => ({ id: nuevoId(), valor: 60000, fecha: f }));

  return {
    perfil: { nombre: "" },
    movimientos,
    deudas: [moto, tarjeta, gota],
    metas: [{ id: ID_FONDO_EMERGENCIA, nombre: "Fondo de emergencia", objetivoManual: null, aportes }],
  };
}
