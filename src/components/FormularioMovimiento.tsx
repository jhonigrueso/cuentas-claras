"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIA_DEUDAS, LIMITE_HORMIGA, categoriasDe } from "@/lib/categorias";
import { hoyISO, nuevoId, pesos } from "@/lib/formato";
import type { Movimiento, Naturaleza, TipoMovimiento } from "@/lib/tipos";
import CampoValor from "./CampoValor";

/** Categorías que casi siempre son gastos fijos: se sugieren como "Fijo" al elegirlas */
const SUELEN_SER_FIJOS = ["Vivienda/arriendo", "Servicios públicos", "Educación", CATEGORIA_DEUDAS];

interface Props {
  inicial?: Movimiento;
  textoBoton?: string;
  onGuardar: (movimiento: Movimiento) => void;
  onCancelar?: () => void;
}

export default function FormularioMovimiento({ inicial, textoBoton = "Guardar", onGuardar, onCancelar }: Props) {
  const [tipo, setTipo] = useState<TipoMovimiento>(inicial?.tipo ?? "gasto");
  const [valor, setValor] = useState(inicial?.valor ?? 0);
  const [categoria, setCategoria] = useState(inicial?.categoria ?? "");
  const [fecha, setFecha] = useState(inicial?.fecha ?? hoyISO());
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? "");
  const [naturaleza, setNaturaleza] = useState<Naturaleza>(inicial?.naturaleza ?? "variable");
  const [naturalezaTocada, setNaturalezaTocada] = useState(Boolean(inicial));
  // null = la casilla "Gasto hormiga" se marca sola según el valor
  const [hormigaManual, setHormigaManual] = useState<boolean | null>(inicial ? Boolean(inicial.hormiga) : null);
  const [errores, setErrores] = useState<{ valor?: string; categoria?: string; fecha?: string }>({});

  const esGasto = tipo === "gasto";
  const hormigaAutomatica = valor > 0 && valor <= LIMITE_HORMIGA;
  const hormiga = esGasto && naturaleza === "variable" && (hormigaManual ?? hormigaAutomatica);

  function cambiarTipo(nuevo: TipoMovimiento) {
    if (nuevo === tipo) return;
    setTipo(nuevo);
    setCategoria("");
    setErrores({});
  }

  function elegirCategoria(nombre: string) {
    setCategoria(nombre);
    setErrores((e) => ({ ...e, categoria: undefined }));
    if (esGasto && !naturalezaTocada) setNaturaleza(SUELEN_SER_FIJOS.includes(nombre) ? "fijo" : "variable");
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevosErrores: typeof errores = {};
    if (!(valor > 0)) nuevosErrores.valor = "Escribe un valor mayor que cero.";
    if (!categoria) nuevosErrores.categoria = "Elige una categoría.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) nuevosErrores.fecha = "Elige una fecha.";
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    onGuardar({
      id: inicial?.id ?? nuevoId(),
      creadoEn: inicial?.creadoEn ?? Date.now(),
      deudaId: esGasto ? inicial?.deudaId : undefined,
      tipo,
      valor,
      categoria,
      fecha,
      descripcion: descripcion.trim() || undefined,
      naturaleza: esGasto ? naturaleza : undefined,
      hormiga: esGasto ? hormiga : undefined,
    });

    if (!inicial) {
      // Deja el formulario listo para el siguiente registro (conserva tipo y fecha)
      setValor(0);
      setCategoria("");
      setDescripcion("");
      setNaturaleza("variable");
      setNaturalezaTocada(false);
      setHormigaManual(null);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      {/* Ingreso / Gasto */}
      <div role="radiogroup" aria-label="Tipo de movimiento" className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1.5">
        {(["ingreso", "gasto"] as const).map((t) => {
          const activo = tipo === t;
          const color = t === "ingreso" ? "bg-ingreso" : "bg-gasto";
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => cambiarTipo(t)}
              className={`min-h-14 rounded-xl text-lg font-extrabold transition ${
                activo ? `${color} text-white shadow` : "text-suave hover:bg-white"
              }`}
            >
              {t === "ingreso" ? "⬆️ Ingreso" : "⬇️ Gasto"}
            </button>
          );
        })}
      </div>

      <CampoValor
        etiqueta={esGasto ? "¿Cuánto gastaste?" : "¿Cuánto recibiste?"}
        valor={valor}
        onCambio={(v) => {
          setValor(v);
          if (v > 0) setErrores((e) => ({ ...e, valor: undefined }));
        }}
        error={errores.valor}
        grande
      />

      {/* Categorías como botones grandes */}
      <fieldset>
        <legend className="etiqueta">Categoría</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categoriasDe(tipo).map((c) => {
            const activo = categoria === c.nombre;
            return (
              <button
                key={c.nombre}
                type="button"
                aria-pressed={activo}
                onClick={() => elegirCategoria(c.nombre)}
                className={`flex min-h-14 items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-base font-bold transition ${
                  activo
                    ? esGasto
                      ? "border-gasto bg-rose-50 text-rose-900"
                      : "border-ingreso bg-emerald-50 text-emerald-900"
                    : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {c.icono}
                </span>
                {/* El espacio invisible deja partir "Vivienda/arriendo" después de la barra */}
                <span className="min-w-0 leading-tight break-words">{c.nombre.replace("/", "/​")}</span>
              </button>
            );
          })}
        </div>
        {errores.categoria && <p className="mt-1.5 text-sm font-semibold text-rose-600">{errores.categoria}</p>}
      </fieldset>

      {esGasto && (
        <fieldset className="space-y-3 rounded-2xl bg-stone-50 p-4">
          <legend className="sr-only">Tipo de gasto</legend>
          <p className="etiqueta mb-0">¿Es un gasto fijo o variable?</p>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["fijo", "Fijo", "Igual cada mes"],
                ["variable", "Variable", "Cambia cada mes"],
              ] as const
            ).map(([n, texto, detalle]) => (
              <button
                key={n}
                type="button"
                aria-pressed={naturaleza === n}
                onClick={() => {
                  setNaturaleza(n);
                  setNaturalezaTocada(true);
                }}
                className={`rounded-2xl border-2 px-3 py-2.5 text-center transition ${
                  naturaleza === n ? "border-marca bg-marca-claro" : "border-stone-200 bg-white"
                }`}
              >
                <span className="block text-lg font-extrabold">{texto}</span>
                <span className="block text-sm text-suave">{detalle}</span>
              </button>
            ))}
          </div>

          {naturaleza === "variable" && (
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3">
              <input
                type="checkbox"
                checked={hormiga}
                onChange={(e) => setHormigaManual(e.target.checked)}
                className="mt-0.5 h-6 w-6 shrink-0 accent-[var(--color-marca)]"
              />
              <span>
                <span className="block text-lg font-bold">🐜 Gasto hormiga</span>
                <span className="block text-sm text-suave">
                  Gastos pequeños del día a día (tinto, mecato, chance…). Se marca sola si es de {pesos(LIMITE_HORMIGA)} o
                  menos.
                </span>
              </span>
            </label>
          )}
        </fieldset>
      )}

      <div>
        <label htmlFor="fecha-movimiento" className="etiqueta">
          Fecha
        </label>
        <input
          id="fecha-movimiento"
          type="date"
          value={fecha}
          max="2100-12-31"
          onChange={(e) => setFecha(e.target.value)}
          className={`campo ${errores.fecha ? "border-rose-500" : ""}`}
        />
        {errores.fecha && <p className="mt-1.5 text-sm font-semibold text-rose-600">{errores.fecha}</p>}
      </div>

      <div>
        <label htmlFor="descripcion-movimiento" className="etiqueta">
          Descripción <span className="font-normal text-suave">(opcional)</span>
        </label>
        <input
          id="descripcion-movimiento"
          type="text"
          value={descripcion}
          maxLength={80}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder={esGasto ? "Ej: mercado de la semana" : "Ej: pago de la quincena"}
          className="campo"
        />
      </div>

      <div className={onCancelar ? "grid grid-cols-2 gap-3" : ""}>
        {onCancelar && (
          <button type="button" className="boton-secundario" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="submit" className={`boton-primario w-full ${onCancelar ? "" : "min-h-14 text-xl"}`}>
          {textoBoton}
        </button>
      </div>
    </form>
  );
}
