interface Props {
  porcentaje: number;
  color?: string;
  etiqueta: string;
}

export default function BarraProgreso({ porcentaje, color = "bg-marca", etiqueta }: Props) {
  const valor = Math.min(100, Math.max(0, porcentaje));
  return (
    <div
      className="h-4 w-full overflow-hidden rounded-full bg-stone-100"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={valor}
      aria-label={etiqueta}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${color}`} style={{ width: `${valor}%` }} />
    </div>
  );
}
