import type { Metadata } from "next";
import TituloPagina from "@/components/TituloPagina";
import MovimientosVista from "@/components/vistas/MovimientosVista";

export const metadata: Metadata = { title: "Movimientos" };

export default function Movimientos() {
  return (
    <>
      <TituloPagina titulo="Movimientos">Todo lo que registraste en el mes.</TituloPagina>
      <MovimientosVista />
    </>
  );
}
