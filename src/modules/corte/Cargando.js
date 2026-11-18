/** Skeleton de lista: se ve mientras llegan productos o proveedores. */
export default function Cargando({ filas = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="skeleton h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}
