'use client';

import { useEffect } from 'react';

/**
 * Efectos táctiles globales (un solo listener para toda la app):
 *  1. Onda líquida que nace donde toca el dedo en cualquier .btn
 *  2. Vibración corta en Android (feedback háptico)
 *  3. El brillo del cristal (.glass) sigue al dedo / cursor
 * Aprende: "event delegation" = un listener en document en vez de uno por botón.
 */
export default function LiquidEffects() {
  useEffect(() => {
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;

    const onDown = e => {
      const btn = e.target.closest?.('.btn:not(:disabled)');
      if (!btn) return;
      if (!sinMovimiento) {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--px', `${((e.clientX - r.left) / r.width) * 100}%`);
        btn.style.setProperty('--py', `${((e.clientY - r.top) / r.height) * 100}%`);
        btn.classList.remove('rip');
        void btn.offsetWidth; // reinicia la animación aunque se toque rápido
        btn.classList.add('rip');
      }
      navigator.vibrate?.(6);
    };
    const onEnd = e => e.target.classList?.remove?.('rip');

    const onMove = e => {
      if (sinMovimiento) return;
      const g = e.target.closest?.('.glass, .glass-dock, .glass-sheet');
      if (!g) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = g.getBoundingClientRect();
        g.style.setProperty('--sx', `${e.clientX - r.left}px`);
        g.style.setProperty('--sy', `${e.clientY - r.top}px`);
      });
    };

    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('animationend', onEnd);
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('animationend', onEnd);
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
