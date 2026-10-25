import Link from "next/link";

export default function NoEncontrada() {
  return (
    <div className="tarjeta text-center">
      <p className="text-5xl" aria-hidden>
        🧭
      </p>
      <h1 className="mt-2 text-2xl font-extrabold">Esta página no existe</h1>
      <Link href="/" className="boton-primario mt-4">
        Volver al inicio
      </Link>
    </div>
  );
}
