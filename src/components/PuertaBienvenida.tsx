"use client";

import type { ReactNode } from "react";
import { useDatos } from "@/context/DatosContext";
import Bienvenida from "./Bienvenida";

/** Muestra la pantalla de bienvenida hasta que la persona escriba su nombre. */
export default function PuertaBienvenida({ children }: { children: ReactNode }) {
  const { datos, cargado } = useDatos();
  if (cargado && !datos.perfil.nombre) return <Bienvenida />;
  return <>{children}</>;
}
