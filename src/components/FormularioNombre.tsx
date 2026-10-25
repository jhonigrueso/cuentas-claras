"use client";

import { useState, type FormEvent } from "react";

interface Props {
  inicial?: string;
  textoBoton: string;
  onGuardar: (nombre: string) => void;
  onCancelar?: () => void;
}

export default function FormularioNombre({ inicial = "", textoBoton, onGuardar, onCancelar }: Props) {
  const [nombre, setNombre] = useState(inicial);
  const [error, setError] = useState("");

  function enviar(e: FormEvent) {
    e.preventDefault();
    const limpio = nombre.trim().replace(/\s+/g, " ");
    if (limpio.length < 2) return setError("Escribe tu nombre (mínimo 2 letras).");
    onGuardar(limpio);
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div>
        <label htmlFor="nombre-usuario" className="etiqueta">
          ¿Cómo te llamas?
        </label>
        <input
          id="nombre-usuario"
          type="text"
          autoComplete="given-name"
          autoCapitalize="words"
          maxLength={30}
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setError("");
          }}
          placeholder="Ej: María"
          aria-invalid={Boolean(error)}
          className={`campo text-xl ${error ? "border-rose-500" : ""}`}
        />
        {error && <p className="mt-1.5 text-sm font-semibold text-rose-600">{error}</p>}
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
