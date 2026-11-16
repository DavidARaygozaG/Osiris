'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function SwRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'development') return; // Solo en producción

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('[SW] Registrado:', reg.scope);

        // Notificar actualización disponible
        reg.addEventListener('updatefound', () => {
          const newSw = reg.installing;
          newSw?.addEventListener('statechange', () => {
            if (newSw.state === 'installed' && navigator.serviceWorker.controller) {
              toast.info('Nueva versión disponible — recarga para actualizar', {
                action: { label: 'Recargar', onClick: () => window.location.reload() },
                duration: 10000,
              });
            }
          });
        });
      })
      .catch((err) => console.warn('[SW] Error al registrar:', err));

    // Escuchar cuando vuelve la conexión → disparar sync
    const handleOnline = () => {
      if ('SyncManager' in window) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.sync.register('osiris-sync-corte').catch(() => {});
        });
      }
      toast.success('Conexión restaurada — sincronizando datos');
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return null;
}
