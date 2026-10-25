"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconoCerrar } from "./Iconos";

interface Props {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

/** Ventana emergente propia: en el celular sube desde abajo, en computador aparece centrada. */
export default function Modal({ abierto, titulo, onCerrar, children }: Props) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef(onCerrar);

  useEffect(() => {
    cerrarRef.current = onCerrar;
  });

  useEffect(() => {
    if (!abierto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const desbordeAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Enfoca el primer campo, o el panel si no hay campos
    const primerCampo = panel.current?.querySelector<HTMLElement>("input, select, textarea");
    (primerCampo ?? panel.current)?.focus();

    function alTeclear(e: KeyboardEvent) {
      if (e.key === "Escape") cerrarRef.current();
    }
    document.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = desbordeAnterior;
      anterior?.focus?.();
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="animacion-fondo absolute inset-0 bg-stone-900/50" onClick={onCerrar} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="animacion-panel relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl outline-none sm:rounded-3xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={idTitulo} className="text-xl font-extrabold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="-m-1 rounded-full p-2 text-suave hover:bg-stone-100"
            aria-label="Cerrar"
          >
            <IconoCerrar />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
