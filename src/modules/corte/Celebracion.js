'use client';

import { motion, useReducedMotion } from 'motion/react';
import { PiWarningFill, PiArrowCircleUpFill } from 'react-icons/pi';
import Burst from '@/components/ui/Burst';

/**
 * Sello de resultado, animado. Iconos sueltos (sin contenedor), coloreados con el tono.
 *  - ok   (Cuadró): gotas + check que se dibuja.
 *  - bad  (Faltó): sacudida corta, sobria.
 *  - warn (Sobró): el icono sube suave.
 */
export default function Celebracion({ tone }) {
  const reducir = useReducedMotion();
  const estilo = { color: 'var(--tone)' };
  const pop = { type: 'spring', stiffness: 320, damping: 18 };

  if (tone === 'ok')
    return (
      <div className="tone-ok relative grid size-28 place-items-center">
        <Burst />
        <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={pop} className="drop-shadow-md" style={estilo}>
          <svg viewBox="0 0 24 24" className="size-24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </motion.span>
      </div>
    );

  if (tone === 'bad')
    return (
      <div className="tone-bad grid size-28 place-items-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0, x: 0 }}
          animate={{ scale: 1, opacity: 1, x: reducir ? 0 : [0, -7, 7, -5, 5, 0] }}
          transition={{ scale: pop, opacity: { duration: 0.2 }, x: { duration: 0.5, delay: 0.3 } }}
          className="drop-shadow-md"
          style={estilo}>
          <PiWarningFill className="size-24" aria-hidden />
        </motion.span>
      </div>
    );

  return (
    <div className="tone-warn grid size-28 place-items-center">
      <motion.span
        initial={{ scale: 0.7, opacity: 0, y: 14 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        className="drop-shadow-md"
        style={estilo}>
        <PiArrowCircleUpFill className="size-24" aria-hidden />
      </motion.span>
    </div>
  );
}
