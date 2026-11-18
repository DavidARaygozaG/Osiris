'use client';

import { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { money } from '@/lib/format';

/**
 * Número que "rueda" hasta su nuevo valor (dinero por defecto).
 * <AnimatedNumber value={total} />                                   → $1,234
 * <AnimatedNumber value={n} format={v => `${Math.round(v)}%`} from={0} />
 * Aprende: actualiza el texto directo en el DOM (ref) para no re-renderizar React 60 veces/seg.
 * Nota: pasa `format` como función estable (definida fuera del componente) para no reiniciar la animación.
 */
export default function AnimatedNumber({ value = 0, format = money, from, duration = 0.9, className }) {
  const ref = useRef(null);
  const actual = useRef(from ?? value);
  const reducir = useReducedMotion();

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    if (reducir) {
      nodo.textContent = format(value);
      actual.current = value;
      return;
    }
    const ctl = animate(actual.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => {
        actual.current = v;
        nodo.textContent = format(v);
      },
    });
    return () => ctl.stop();
  }, [value, duration, reducir, format]);

  return (
    <span ref={ref} className={className}>
      {format(from ?? value)}
    </span>
  );
}
