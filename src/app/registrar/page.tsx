import type { Metadata } from "next";
import TituloPagina from "@/components/TituloPagina";
import RegistrarVista from "@/components/vistas/RegistrarVista";

export const metadata: Metadata = { title: "Registrar" };

export default function Registrar() {
  return (
    <>
      <TituloPagina titulo="Registrar">Anota cada peso que entra o sale.</TituloPagina>
      <RegistrarVista />
    </>
  );
}
