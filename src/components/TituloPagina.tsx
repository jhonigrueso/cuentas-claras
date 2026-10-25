import type { ReactNode } from "react";

export default function TituloPagina({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{titulo}</h1>
      {children && <p className="mt-1 text-base text-suave">{children}</p>}
    </div>
  );
}
