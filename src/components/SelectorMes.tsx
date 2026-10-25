"use client";

import { useDatos } from "@/context/DatosContext";
import { mesActual, moverMes, nombreMes } from "@/lib/formato";
import { IconoDerecha, IconoIzquierda } from "./Iconos";

export default function SelectorMes() {
  const { mes, setMes } = useDatos();
  const esActual = mes === mesActual();

  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
      <button
        type="button"
        onClick={() => setMes(moverMes(mes, -1))}
        className="rounded-xl p-3 text-marca hover:bg-marca-claro"
        aria-label="Mes anterior"
      >
        <IconoIzquierda />
      </button>
      <div className="text-center">
        <p className="text-lg font-extrabold" aria-live="polite">
          {nombreMes(mes)}
        </p>
        {!esActual && (
          <button type="button" onClick={() => setMes(mesActual())} className="text-sm font-bold text-marca underline">
            Volver al mes actual
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => setMes(moverMes(mes, 1))}
        className="rounded-xl p-3 text-marca hover:bg-marca-claro"
        aria-label="Mes siguiente"
      >
        <IconoDerecha />
      </button>
    </div>
  );
}
