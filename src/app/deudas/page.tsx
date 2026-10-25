import type { Metadata } from "next";
import TituloPagina from "@/components/TituloPagina";
import DeudasVista from "@/components/vistas/DeudasVista";

export const metadata: Metadata = { title: "Deudas" };

export default function Deudas() {
  return (
    <>
      <TituloPagina titulo="Mis deudas">Ve cuánto debes y organiza cómo salir de ellas.</TituloPagina>
      <DeudasVista />
    </>
  );
}
