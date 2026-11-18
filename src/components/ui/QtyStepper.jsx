'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PiMinusBold, PiPlusBold } from 'react-icons/pi';
import Sheet from './Sheet';
import { NumPad } from './MoneyField';

/**
 * Cantidad con botones grandes − / +. Ideal para piezas (1 en 1) o fracciones (step=0.25).
 * La cifra central es un botón: abre un teclado para escribir la cantidad exacta.
 * Micro-animación: la cifra "rueda" hacia arriba al sumar y hacia abajo al restar.
 */
export default function QtyStepper({ value = 0, onChange, step = 1, min = 0, max = 9999, format, label }) {
  const set = v => onChange?.(Math.min(max, Math.max(min, Math.round(v * 100) / 100)));
  const text = format ? format(value) : String(value);
  const [teclado, setTeclado] = useState(false);
  // Dirección de la animación (1 = sube, -1 = baja). Patrón "ajustar estado durante el render":
  // React lo permite y evita leer/escribir refs mientras se renderiza.
  const [previo, setPrevio] = useState(value);
  const [dir, setDir] = useState(1);
  if (value !== previo) {
    setDir(value > previo ? 1 : -1);
    setPrevio(value);
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.86 }}
        onClick={() => set(value - step)}
        disabled={value <= min}
        aria-label={`Quitar${label ? ` ${label}` : ''}`}
        className="btn btn-circle btn-ghost size-14 min-h-14 text-ink-soft disabled:opacity-30">
        <PiMinusBold className="size-8" />
      </motion.button>
      <button
        type="button"
        onClick={() => setTeclado(true)}
        aria-label={`Escribir cantidad${label ? ` de ${label}` : ''}`}
        className="num relative grid min-h-14 min-w-14 place-items-center overflow-hidden rounded-xl px-1 text-3xl font-extrabold active:bg-ink/10">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={{ y: dir * 18, opacity: 0, filter: 'blur(3px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: dir * -18, opacity: 0, filter: 'blur(3px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
            {text}
          </motion.span>
        </AnimatePresence>
      </button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.86 }}
        onClick={() => set(value + step)}
        aria-label={`Agregar${label ? ` ${label}` : ''}`}
        className="btn btn-circle btn-ghost size-14 min-h-14 text-nopal">
        <PiPlusBold className="size-8 drop-shadow-[0_3px_4px_rgb(var(--nopal-rgb)/0.45)]" />
      </motion.button>
      <Sheet open={teclado} onClose={() => setTeclado(false)} title={label ? `Cantidad: ${label}` : 'Cantidad'}>
        <NumPad
          initial={value}
          decimals={step < 1}
          prefix=""
          confirmLabel="Listo"
          onConfirm={v => {
            set(v);
            setTeclado(false);
          }}
        />
      </Sheet>
    </div>
  );
}
