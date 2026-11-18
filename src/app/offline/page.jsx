'use client';

import { PiWifiSlashDuotone } from 'react-icons/pi';
import EmptyState from '@/components/ui/EmptyState';

// Página que el service worker muestra cuando no hay internet. Sin dock: no hay a dónde ir.
export default function OfflinePage() {
  return (
    <main id="contenido" className="mx-auto grid min-h-dvh w-full max-w-xl place-items-center px-4 py-8">
      <EmptyState
        floating
        icon={PiWifiSlashDuotone}
        title="Sin internet"
        text="Lo que captures se guarda y se envía solo cuando vuelva la señal."
        action={
          <button type="button" onClick={() => window.location.reload()} className="btn btn-big btn-liquid mt-2 w-full max-w-xs">
            Reintentar
          </button>
        }
      />
    </main>
  );
}
