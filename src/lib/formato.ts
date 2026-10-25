const formatoNumero = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

/** 1250000 -> "$1.250.000" ; -5000 -> "-$5.000" */
export function pesos(valor: number): string {
  const redondeado = Math.round(valor);
  const texto = formatoNumero.format(Math.abs(redondeado));
  return redondeado < 0 ? `-$${texto}` : `$${texto}`;
}

/** Solo los dígitos con puntos de miles, para mostrar dentro de un campo: "1.250.000" */
export function miles(valor: number): string {
  return valor > 0 ? formatoNumero.format(valor) : "";
}

/** Convierte lo que escribe el usuario ("1.250.000", "$ 15000") en número */
export function leerValor(texto: string): number {
  const digitos = texto.replace(/\D/g, "").slice(0, 12);
  return digitos ? Number(digitos) : 0;
}

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function dosDigitos(n: number): string {
  return String(n).padStart(2, "0");
}

export function fechaISO(anio: number, mes0: number, dia: number): string {
  return `${anio}-${dosDigitos(mes0 + 1)}-${dosDigitos(dia)}`;
}

/** Fecha local de hoy en formato AAAA-MM-DD */
export function hoyISO(): string {
  const d = new Date();
  return fechaISO(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Mes actual en formato AAAA-MM */
export function mesActual(): string {
  return hoyISO().slice(0, 7);
}

/** "2026-10-05" -> "5 oct 2026" */
export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split("-").map(Number);
  if (!a || !m || !d) return iso;
  return `${d} ${MESES_CORTOS[m - 1]} ${a}`;
}

/** "2026-10" -> "Octubre 2026" */
export function nombreMes(mes: string): string {
  const [a, m] = mes.split("-").map(Number);
  const nombre = MESES[m - 1] ?? "";
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${a}`;
}

/** Suma (o resta) meses a un mes AAAA-MM */
export function moverMes(mes: string, delta: number): string {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(a, m - 1 + delta, 1);
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}`;
}

/** Identificador único que funciona incluso cuando la página no está en HTTPS */
export function nuevoId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    /* se usa el respaldo */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
