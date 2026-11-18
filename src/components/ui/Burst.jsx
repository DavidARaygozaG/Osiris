'use client';

import { motion, useReducedMotion } from 'motion/react';

/**
 * Ráfaga de gotas (verde, maíz, café) que sale desde el centro. Se usa al celebrar "Cuadró".
 * Decorativa: aria-hidden. Con "menos movimiento" no se muestra.
 */
const COLORES = ['var(--c-nopal)', 'var(--c-maiz)', 'var(--c-cafe)', 'var(--c-nopal-light)'];

export default function Burst({ cantidad = 16, radio = 110 }) {
  const reducir = useReducedMotion();
  if (reducir) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: cantidad }, (_, i) => {
        const ang = (i / cantidad) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
        const d = radio * (0.65 + (i % 3) * 0.22);
        return (
          <motion.i
            key={i}
            className="absolute size-3 rounded-full"
            style={{ background: COLORES[i % COLORES.length] }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: Math.cos(ang) * d, y: Math.sin(ang) * d, scale: [0.4, 1.1, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 1.1, delay: 0.1 + (i % 4) * 0.03, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}
