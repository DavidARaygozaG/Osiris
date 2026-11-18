'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PiArrowClockwiseBold, PiWifiHighBold, PiWifiSlashBold } from 'react-icons/pi';

/**
 * Registra el service worker (solo producción) y avisa con una tarjeta de cristal:
 *  - hay versión nueva → botón "Actualizar"
 *  - se perdió / volvió el internet
 * Patrón: un solo estado `aviso` = { tipo, texto } y se pinta arriba, sin librerías de toasts.
 */
export default function SwRegister() {
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    // Avisos de red (también en desarrollo)
    let timer;
    const flash = (tipo, texto) => {
      setAviso({ tipo, texto });
      clearTimeout(timer);
      timer = setTimeout(() => setAviso(null), 4000);
    };
    const onOnline = () => {
      flash('online', 'Volvió el internet');
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(reg => reg.sync?.register('osiris-sync-corte')).catch(() => {});
      }
    };
    const onOffline = () => flash('offline', 'Sin internet. Lo que captures no se guardará hasta que vuelva.');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Service worker (solo producción)
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          reg.addEventListener('updatefound', () => {
            const nuevo = reg.installing;
            nuevo?.addEventListener('statechange', () => {
              if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
                clearTimeout(timer);
                setAviso({ tipo: 'update', texto: 'Hay una versión nueva de la app' });
              }
            });
          });
        })
        .catch(() => {});
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const Icon = aviso?.tipo === 'offline' ? PiWifiSlashBold : aviso?.tipo === 'update' ? PiArrowClockwiseBold : PiWifiHighBold;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-safe" aria-live="polite">
      <AnimatePresence>
        {aviso && (
          <motion.div
            key={aviso.tipo}
            role="status"
            className="glass glass-strong glass-liquid pointer-events-auto flex w-full max-w-sm items-center gap-3 px-4 py-3"
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
            <Icon className={`size-8 shrink-0 drop-shadow-sm ${aviso.tipo === 'offline' ? 'text-chile' : 'text-nopal'}`} aria-hidden />
            <p className="flex-1 font-semibold leading-snug">{aviso.texto}</p>
            {aviso.tipo === 'update' && (
              <button type="button" onClick={() => window.location.reload()} className="btn btn-liquid min-h-12 rounded-xl px-4">
                Actualizar
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
