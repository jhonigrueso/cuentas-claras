"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoInicio, IconoLista, IconoMas, IconoMeta, IconoTarjeta } from "./Iconos";

const ENLACES = [
  { href: "/", texto: "Inicio", Icono: IconoInicio },
  { href: "/registrar", texto: "Registrar", Icono: IconoMas },
  { href: "/movimientos", texto: "Movimientos", Icono: IconoLista },
  { href: "/deudas", texto: "Deudas", Icono: IconoTarjeta },
  { href: "/metas", texto: "Metas", Icono: IconoMeta },
];

export default function NavInferior() {
  const ruta = usePathname();

  return (
    <nav
      aria-label="Menú principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {ENLACES.map(({ href, texto, Icono }) => {
          const activo = href === "/" ? ruta === "/" : ruta.startsWith(href);
          const esRegistrar = href === "/registrar";
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[0.72rem] font-bold sm:text-sm ${
                  activo ? "text-marca" : "text-suave"
                }`}
              >
                <span
                  className={`flex h-8 w-12 items-center justify-center rounded-full transition ${
                    esRegistrar
                      ? "bg-marca text-white shadow-md"
                      : activo
                        ? "bg-marca-claro"
                        : ""
                  }`}
                >
                  <Icono width={22} height={22} strokeWidth={esRegistrar ? 2.6 : 2} />
                </span>
                {texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
