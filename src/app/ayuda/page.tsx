import type { Metadata } from "next";
import Link from "next/link";
import TituloPagina from "@/components/TituloPagina";

export const metadata: Metadata = { title: "Ayuda" };

const PASOS = [
  {
    icono: "➕",
    titulo: "Registra cada ingreso y gasto",
    texto: "Toca «Registrar», elige si es ingreso o gasto, escribe el valor y escoge la categoría. Hazlo el mismo día, así no se te olvida.",
  },
  {
    icono: "🐜",
    titulo: "Marca si el gasto es fijo o variable",
    texto: "Fijo es lo que pagas igual cada mes (arriendo, servicios). Variable es lo que cambia. Los gastos pequeños quedan marcados como «gasto hormiga».",
  },
  {
    icono: "📊",
    titulo: "Revisa tu resumen en Inicio",
    texto: "Mira cuánto entró, cuánto salió y en qué se fue la plata. Lee el consejo del mes y cambia de mes con las flechas.",
  },
  {
    icono: "💳",
    titulo: "Anota tus deudas y abonos",
    texto: "En «Deudas» agrega cada crédito con su saldo y cuota. Cada vez que pagues, toca «Registrar abono»: baja el saldo y se anota como gasto.",
  },
  {
    icono: "🛟",
    titulo: "Arma tu fondo de emergencia",
    texto: "En «Metas» la app te sugiere cuánto ahorrar (3 meses de gastos fijos). Cada vez que guardes plata, toca «Agregar ahorro».",
  },
];

export default function Ayuda() {
  return (
    <>
      <TituloPagina titulo="¿Cómo se usa?">Cinco pasos para tener las cuentas claras.</TituloPagina>
      <ol className="space-y-3">
        {PASOS.map((p, i) => (
          <li key={p.titulo} className="tarjeta flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-marca text-xl font-extrabold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="text-lg font-extrabold">
                <span aria-hidden>{p.icono}</span> {p.titulo}
              </h2>
              <p className="mt-1 text-base text-suave">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="tarjeta mt-4 space-y-2 bg-sky-50/60">
        <h2 className="text-lg font-extrabold">🔒 ¿Dónde quedan mis datos?</h2>
        <p>
          Solo en este celular, dentro del navegador. No se envían a internet y nadie más los ve. Si borras los datos del
          navegador o cambias de celular, se pierden: usa <b>⚙️ Ajustes → Descargar mis datos</b> para guardar una copia.
        </p>
        <h2 className="pt-2 text-lg font-extrabold">📲 Tenerla como app</h2>
        <p>
          En Chrome toca el menú <b>⋮</b> y luego <b>«Agregar a la pantalla principal»</b> (en iPhone: botón Compartir →
          «Agregar a inicio»).
        </p>
      </section>

      <Link href="/registrar" className="boton-primario mt-4 w-full">
        Empezar a registrar
      </Link>
    </>
  );
}
