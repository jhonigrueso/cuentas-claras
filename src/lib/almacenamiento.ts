import { ID_FONDO_EMERGENCIA, type DatosApp, type Meta } from "./tipos";

export const CLAVE_ALMACENAMIENTO = "cuentas-claras-v1";

export function fondoVacio(): Meta {
  return { id: ID_FONDO_EMERGENCIA, nombre: "Fondo de emergencia", objetivoManual: null, aportes: [] };
}

export function datosVacios(): DatosApp {
  return { perfil: { nombre: "" }, movimientos: [], deudas: [], metas: [fondoVacio()] };
}

/** Revisa que lo guardado tenga la forma esperada y que siempre exista el fondo de emergencia */
function normalizar(crudo: unknown): DatosApp {
  const base = datosVacios();
  if (!crudo || typeof crudo !== "object") return base;
  const d = crudo as Partial<DatosApp>;
  const metas = Array.isArray(d.metas) ? d.metas.filter((m) => m && typeof m.id === "string") : [];
  if (!metas.some((m) => m.id === ID_FONDO_EMERGENCIA)) metas.unshift(fondoVacio());
  const nombre = typeof d.perfil?.nombre === "string" ? d.perfil.nombre.trim().slice(0, 30) : "";
  return {
    perfil: { nombre },
    movimientos: Array.isArray(d.movimientos)
      ? d.movimientos.filter((m) => m && typeof m.valor === "number" && typeof m.fecha === "string")
      : [],
    deudas: Array.isArray(d.deudas) ? d.deudas.filter((x) => x && typeof x.saldoInicial === "number") : [],
    metas: metas.map((m) => ({ ...m, aportes: Array.isArray(m.aportes) ? m.aportes : [] })),
  };
}

/** Lee los datos guardados. Solo debe llamarse en el navegador. */
export function leerDatos(): DatosApp {
  try {
    const texto = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    return texto ? normalizar(JSON.parse(texto)) : datosVacios();
  } catch {
    return datosVacios();
  }
}

/** Guarda los datos. Devuelve false si el navegador no permite guardar (modo privado, sin espacio…). */
export function guardarDatos(datos: DatosApp): boolean {
  try {
    window.localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));
    return true;
  } catch {
    return false;
  }
}
