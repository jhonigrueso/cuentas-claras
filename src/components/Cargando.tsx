/** Esqueleto que se muestra mientras se leen los datos guardados en el celular */
export default function Cargando() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando tus datos">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-3xl bg-white/70" />
      ))}
    </div>
  );
}
