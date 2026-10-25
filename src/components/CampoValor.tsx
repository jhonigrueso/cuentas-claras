"use client";

import { useId } from "react";
import { leerValor, miles } from "@/lib/formato";

interface Props {
  etiqueta: string;
  valor: number;
  onCambio: (valor: number) => void;
  error?: string;
  ayuda?: string;
  grande?: boolean;
}

/** Campo de dinero: muestra los puntos de miles mientras la persona escribe. */
export default function CampoValor({ etiqueta, valor, onCambio, error, ayuda, grande }: Props) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="etiqueta">
        {etiqueta}
      </label>
      <div className="relative">
        <span
          className={`pointer-events-none absolute inset-y-0 left-4 flex items-center font-bold text-suave ${grande ? "text-2xl" : "text-lg"}`}
        >
          $
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={miles(valor)}
          onChange={(e) => onCambio(leerValor(e.target.value))}
          aria-invalid={Boolean(error)}
          aria-describedby={error || ayuda ? `${id}-nota` : undefined}
          className={`campo pl-9 ${grande ? "py-4 text-3xl font-extrabold" : ""} ${error ? "border-rose-500" : ""}`}
        />
      </div>
      {(error || ayuda) && (
        <p id={`${id}-nota`} className={`mt-1.5 text-sm ${error ? "font-semibold text-rose-600" : "text-suave"}`}>
          {error || ayuda}
        </p>
      )}
    </div>
  );
}
