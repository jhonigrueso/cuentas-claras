"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type TipoToast = "exito" | "error" | "info";

interface Toast {
  id: number;
  mensaje: string;
  tipo: TipoToast;
}

const ToastContext = createContext<((mensaje: string, tipo?: TipoToast) => void) | null>(null);

const ESTILOS: Record<TipoToast, string> = {
  exito: "bg-emerald-700 text-white",
  error: "bg-rose-700 text-white",
  info: "bg-slate-800 text-white",
};

const ICONOS: Record<TipoToast, string> = { exito: "✅", error: "⚠️", info: "ℹ️" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const contador = useRef(0);

  const mostrar = useCallback((mensaje: string, tipo: TipoToast = "exito") => {
    const id = ++contador.current;
    setToasts((lista) => [...lista.slice(-2), { id, mensaje, tipo }]);
    setTimeout(() => setToasts((lista) => lista.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animacion-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold shadow-lg ${ESTILOS[t.tipo]}`}
          >
            <span aria-hidden>{ICONOS[t.tipo]}</span>
            <span>{t.mensaje}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return contexto;
}
