"use client";

import Link from "next/link";
import { useDatos } from "@/context/DatosContext";
import { IconoAyuda, IconoCandado } from "./Iconos";
import MenuAjustes from "./MenuAjustes";

export default function Encabezado() {
  const { datos, cargado, puedeGuardar } = useDatos();
  const nombre = datos.perfil.nombre;

  return (
    <header className="bg-marca text-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon.svg" alt="" width={40} height={40} className="shrink-0 rounded-xl ring-2 ring-white/30" />
          <span className="min-w-0 leading-tight">
            <span className="block text-xl font-extrabold tracking-tight">Cuentas Claras</span>
            {cargado && nombre && (
              <span className="block truncate text-sm font-semibold text-white/85">Hola, {nombre} 👋</span>
            )}
          </span>
        </Link>
        <div className="flex items-center">
          <Link href="/ayuda" className="rounded-full p-2.5 text-white/90 hover:bg-white/15" aria-label="Ayuda">
            <IconoAyuda />
          </Link>
          <MenuAjustes />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-3">
        {cargado && !puedeGuardar ? (
          <p className="flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-1.5 text-sm font-semibold">
            ⚠️ Este navegador no está guardando tus datos. Sal del modo incógnito.
          </p>
        ) : (
          <p className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 text-sm font-semibold">
            <IconoCandado width={16} height={16} />
            Tus datos se guardan solo en este celular
          </p>
        )}
      </div>
    </header>
  );
}
