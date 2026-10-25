"use client";

import { useState } from "react";
import Link from "next/link";
import { useDatos } from "@/context/DatosContext";
import { useToast } from "@/context/ToastContext";
import { pesos } from "@/lib/formato";
import type { Movimiento } from "@/lib/tipos";
import Cargando from "../Cargando";
import FormularioMovimiento from "../FormularioMovimiento";

export default function RegistrarVista() {
  const { cargado, despachar, setMes } = useDatos();
  const toast = useToast();
  const [ultimo, setUltimo] = useState<Movimiento | null>(null);

  if (!cargado) return <Cargando />;

  function guardar(movimiento: Movimiento) {
    despachar({ tipo: "agregarMovimiento", movimiento });
    setUltimo(movimiento);
    toast(`${movimiento.tipo === "ingreso" ? "Ingreso" : "Gasto"} de ${pesos(movimiento.valor)} guardado`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-4">
      {ultimo && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-marca-claro px-4 py-3 text-emerald-900">
          <span className="font-semibold">
            ✅ Último: {ultimo.categoria} · {pesos(ultimo.valor)}
          </span>
          <Link
            href="/movimientos"
            onClick={() => setMes(ultimo.fecha.slice(0, 7))}
            className="shrink-0 font-bold underline"
          >
            Ver lista
          </Link>
        </div>
      )}
      <div className="tarjeta">
        <FormularioMovimiento onGuardar={guardar} />
      </div>
    </div>
  );
}
