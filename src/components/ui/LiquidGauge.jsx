'use client';

import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Medidor líquido: un círculo que se llena con olas (la meta del mes).
 * value: 0-100. El nivel sube con un resorte y dos olas se mueven en bucle.
 */
export default function LiquidGauge({ value = 0, size = 96, label }) {
  const id = useId().replace(/:/g, '');
  const reducir = useReducedMotion();
  const v = Math.max(0, Math.min(100, value));
  // y=100 → vacío; y≈10 → lleno (margen para que la ola siempre se vea)
  const y = 100 - v * 0.9;
  const ola = 'M0 6 Q 12.5 0 25 6 T 50 6 T 75 6 T 100 6 T 125 6 T 150 6 T 175 6 T 200 6 V 120 H 0 Z';

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label ?? `${v}%`} className="shrink-0">
      <defs>
        <clipPath id={`${id}-c`}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--c-nopal-light)' }} />
          <stop offset="1" style={{ stopColor: 'var(--c-nopal-deep)' }} />
        </linearGradient>
        <radialGradient id={`${id}-s`} cx="30%" cy="22%" r="60%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" style={{ fill: 'rgb(var(--glass-rgb) / 0.22)' }} />
      <g clipPath={`url(#${id}-c)`}>
        <motion.g
          initial={{ y: 100 }}
          animate={{ y }}
          transition={reducir ? { duration: 0 } : { type: 'spring', stiffness: 60, damping: 16, delay: 0.25 }}>
          {/* ola de atrás: maíz (destello); ola de adelante: verde */}
          <g className={reducir ? '' : 'wave-b'} style={{ opacity: 0.7 }}>
            <path d={ola} style={{ fill: 'var(--c-maiz)' }} transform="translate(0 -3)" />
          </g>
          <g className={reducir ? '' : 'wave-a'}>
            <path d={ola} fill={`url(#${id}-g)`} />
          </g>
        </motion.g>
        <circle cx="50" cy="50" r="46" fill={`url(#${id}-s)`} />
      </g>
      <circle cx="50" cy="50" r="46" fill="none" style={{ stroke: 'var(--edge)' }} strokeWidth="2" />
    </svg>
  );
}
