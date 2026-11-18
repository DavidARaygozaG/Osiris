'use client';

import { AnimatePresence, motion } from 'motion/react';

/** Aviso de éxito flotante: entra con resorte y el check se dibuja solo (.check-draw). Icono + texto. */
export default function Flash({ msg }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-6 z-[60] mx-auto max-w-sm" role="status" aria-live="polite">
      <AnimatePresence>
        {msg && (
          <motion.p
            key={msg}
            initial={{ opacity: 0, y: 28, scale: 0.9, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="glass glass-strong tone-ok flex items-center justify-center gap-3 px-5 py-4 text-lg font-bold text-(--tone)">
            <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
