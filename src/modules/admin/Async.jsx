'use client';

import { PiWifiSlashDuotone, PiArrowClockwiseBold } from 'react-icons/pi';
import EmptyState from '@/components/ui/EmptyState';

/** Esqueleto de carga (daisyUI `skeleton`): bloques que imitan el contenido real. */
export function Esqueleto({ filas = 3, alto = 'h-24' }) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className={`skeleton w-full rounded-2xl ${alto}`} />
      ))}
    </div>
  );
}

/**
 * Resuelve los 3 estados de cualquier consulta: cargando, error (con reintento) y listo.
 * <Async query={useApi('/api/x')}>{data => <Lista data={data} />}</Async>
 */
export default function Async({ query, skeleton, children }) {
  if (query.status === 'loading') return skeleton ?? <Esqueleto />;
  if (query.status === 'error') {
    return (
      <EmptyState
        icon={PiWifiSlashDuotone}
        title="No se pudo cargar"
        text={query.error}
        action={
          <button type="button" onClick={query.reload} className="btn btn-big btn-liquid mt-2">
            <PiArrowClockwiseBold className="size-5" aria-hidden />
            Intentar otra vez
          </button>
        }
      />
    );
  }
  return children(query.data);
}
