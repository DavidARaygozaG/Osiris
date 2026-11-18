'use client';

import { motion } from 'motion/react';
import { PiCheckCircleFill, PiWarningFill, PiArrowCircleUpFill } from 'react-icons/pi';

/**
 * Estado del cuadre. Nunca solo color: siempre icono + palabra. Entra con un "pop" elástico.
 * estado: 'cuadro' | 'coincidio' | 'falto' | 'sobro'   (o tone: 'ok' | 'bad' | 'warn')
 */
const MAP = {
  ok: { Icon: PiCheckCircleFill, text: 'Cuadró', cls: 'tone-ok' },
  bad: { Icon: PiWarningFill, text: 'Faltó', cls: 'tone-bad' },
  warn: { Icon: PiArrowCircleUpFill, text: 'Sobró', cls: 'tone-warn' },
};
// Acepta el valor del schema (cuadro/falto/sobro) y el legado (coincidio).
const ESTADO_TONE = { cuadro: 'ok', coincidio: 'ok', falto: 'bad', sobro: 'warn' };

export default function StatusBadge({ estado, tone, label, size = 'md' }) {
  const t = MAP[tone ?? ESTADO_TONE[estado] ?? 'ok'];
  const big = size === 'lg';
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className={`${t.cls} inline-flex items-center gap-1.5 rounded-xl px-3 font-bold ${big ? 'py-2 text-lg' : 'py-1 text-sm'}`}
      style={{ background: 'var(--tone-bg)', color: 'var(--tone)' }}>
      <t.Icon className={big ? 'size-6' : 'size-4'} aria-hidden />
      {label ?? t.text}
    </motion.span>
  );
}
