import type { TipoMovimiento } from "./tipos";

export interface Categoria {
  nombre: string;
  icono: string;
  color: string;
}

export const CATEGORIAS_INGRESO: Categoria[] = [
  { nombre: "Salario", icono: "💼", color: "#16a34a" },
  { nombre: "Trabajo extra", icono: "🛠️", color: "#0d9488" },
  { nombre: "Ventas", icono: "🛍️", color: "#65a30d" },
  { nombre: "Otro", icono: "➕", color: "#4d7c0f" },
];

export const CATEGORIA_DEUDAS = "Deudas y créditos";

export const CATEGORIAS_GASTO: Categoria[] = [
  { nombre: "Vivienda/arriendo", icono: "🏠", color: "#e11d48" },
  { nombre: "Servicios públicos", icono: "💡", color: "#f59e0b" },
  { nombre: "Mercado", icono: "🛒", color: "#10b981" },
  { nombre: "Transporte", icono: "🚌", color: "#3b82f6" },
  { nombre: CATEGORIA_DEUDAS, icono: "💳", color: "#8b5cf6" },
  { nombre: "Salud", icono: "🩺", color: "#ec4899" },
  { nombre: "Educación", icono: "📚", color: "#0891b2" },
  { nombre: "Celular/internet", icono: "📱", color: "#6366f1" },
  { nombre: "Gustos y salidas", icono: "🍦", color: "#f97316" },
  { nombre: "Otro", icono: "📦", color: "#78716c" },
];

export function categoriasDe(tipo: TipoMovimiento): Categoria[] {
  return tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
}

export function buscarCategoria(tipo: TipoMovimiento, nombre: string): Categoria {
  const lista = categoriasDe(tipo);
  return lista.find((c) => c.nombre === nombre) ?? lista[lista.length - 1];
}

/** Un gasto variable de este valor o menos se marca como "gasto hormiga" */
export const LIMITE_HORMIGA = 15000;
