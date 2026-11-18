'use client';

import { useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PiSunDuotone, PiMoonStarsDuotone } from 'react-icons/pi';

/**
 * Cambia entre claro y oscuro. Guarda la elección en localStorage ('osiris-tema').
 * El script del <head> (layout.js) aplica el tema ANTES de pintar para evitar el parpadeo.
 */
// El tema vive en <html data-theme>. useSyncExternalStore "escucha" ese atributo:
// en el servidor devuelve false y en el cliente lee el valor real (sin parpadeo ni setState en effect).
const suscribir = cb => {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => obs.disconnect();
};
const leerOscuro = () => document.documentElement.dataset.theme === 'maiz-oscuro';

export default function ThemeToggle() {
  const oscuro = useSyncExternalStore(suscribir, leerOscuro, () => false);

  const alternar = () => {
    const siguiente = !oscuro;
    const aplicar = () => {
      const h = document.documentElement;
      h.dataset.theme = siguiente ? 'maiz-oscuro' : 'maiz';
      h.style.colorScheme = siguiente ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', siguiente ? '#272b29' : '#f6eedb');
    };
    try {
      localStorage.setItem('osiris-tema', siguiente ? 'oscuro' : 'claro');
    } catch {
      // sin localStorage (modo privado): el cambio funciona igual, solo no se recuerda
    }
    // Transición suave del navegador si existe; si no, cambio directo
    if (document.startViewTransition) document.startViewTransition(aplicar);
    else aplicar();
  };

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="btn btn-circle btn-glass size-12 min-h-12">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={oscuro ? 'luna' : 'sol'}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="grid place-items-center">
          {oscuro ? <PiMoonStarsDuotone className="size-6" /> : <PiSunDuotone className="size-6" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
