"use client";

import { useDatos } from "@/context/DatosContext";
import { useToast } from "@/context/ToastContext";
import FormularioNombre from "./FormularioNombre";
import { IconoCandado } from "./Iconos";
import PiePagina from "./PiePagina";

/** Pantalla de entrada: se muestra mientras la persona no haya escrito su nombre. */
export default function Bienvenida() {
  const { despachar } = useDatos();
  const toast = useToast();

  return (
    <div className="flex min-h-dvh flex-col bg-marca">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon.svg"
              alt=""
              width={88}
              height={88}
              className="mx-auto rounded-3xl shadow-lg ring-4 ring-white/30"
            />
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Cuentas Claras</h1>
            <p className="mt-2 text-lg text-white/90">Tus ingresos, gastos, deudas y ahorros, en un solo lugar.</p>
          </div>

          <div className="tarjeta">
            <h2 className="mb-1 text-2xl font-extrabold">¡Hola! 👋</h2>
            <p className="mb-5 text-suave">Escribe tu nombre para empezar.</p>
            <FormularioNombre
              textoBoton="Entrar"
              onGuardar={(nombre) => {
                despachar({ tipo: "definirNombre", nombre });
                toast(`¡Hola, ${nombre}!`);
              }}
            />
            <p className="mt-5 flex items-start gap-2 rounded-2xl bg-marca-claro p-3 text-sm text-emerald-900">
              <IconoCandado width={18} height={18} className="mt-0.5 shrink-0" />
              No necesitas contraseña. Tu nombre y tus datos se guardan solo en este celular.
            </p>
          </div>
        </div>
      </div>
      <div className="text-white/85 [&_footer]:text-white/85">
        <PiePagina />
      </div>
    </div>
  );
}
