import type { Metadata } from "next";
import TituloPagina from "@/components/TituloPagina";
import MetasVista from "@/components/vistas/MetasVista";

export const metadata: Metadata = { title: "Metas" };

export default function Metas() {
  return (
    <>
      <TituloPagina titulo="Metas de ahorro">Un colchón para los imprevistos.</TituloPagina>
      <MetasVista />
    </>
  );
}
