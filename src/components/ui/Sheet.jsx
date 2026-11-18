'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PiXBold } from 'react-icons/pi';

/**
 * Hoja de cristal inferior (signature move de la app).
 * Se desliza sobre la pantalla con un leve rebote; se cierra arrastrando hacia abajo,
 * tocando fuera, con la X o con Escape. Accesible: mueve el foco a la hoja, lo atrapa
 * con Tab y lo devuelve al botón que la abrió. Con "menos movimiento" solo hace fundido.
 *
 * <Sheet open={open} onClose={() => setOpen(false)} title="Llegó harina">…</Sheet>
 */
export default function Sheet({ open, onClose, title, children, footer, className = '' }) {
  const titleId = useId();
  const hoja = useRef(null);
  const sinMovimiento = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const previo = document.activeElement; // quien tenía el foco antes de abrir
    hoja.current?.focus({ preventScroll: true });

    const onKey = e => {
      if (e.key === 'Escape') return onClose?.();
      if (e.key !== 'Tab' || !hoja.current) return;
      // Trampa de foco simple: Tab y Shift+Tab giran dentro de la hoja
      const foco = [...hoja.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])')];
      if (!foco.length) return e.preventDefault();
      const primero = foco[0];
      const ultimo = foco[foco.length - 1];
      const activo = document.activeElement;
      if (e.shiftKey && (activo === primero || activo === hoja.current)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      if (previo instanceof HTMLElement) previo.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 backdrop-blur-[3px] bg-[var(--scrim)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.section
            ref={hoja}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`glass-sheet relative flex max-h-[92dvh] w-full max-w-xl flex-col ${className}`}
            initial={sinMovimiento ? { opacity: 0 } : { y: '100%' }}
            animate={sinMovimiento ? { opacity: 1 } : { y: 0 }}
            exit={sinMovimiento ? { opacity: 0 } : { y: '100%' }}
            transition={sinMovimiento ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 26, mass: 0.9 }}
            drag={sinMovimiento ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && onClose?.()}>
            <div className="mx-auto mt-3 h-1.5 w-11 shrink-0 rounded-full bg-ink/20" aria-hidden />
            <header className="flex items-center justify-between gap-3 px-6 pb-2 pt-3">
              {title && (
                <h2 id={titleId} className="text-2xl font-extrabold leading-tight">
                  {title}
                </h2>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="btn btn-circle btn-ghost ml-auto size-12 min-h-12 text-ink-soft">
                <PiXBold className="size-6" />
              </button>
            </header>
            <div className="overflow-y-auto px-6 pb-4 pt-2">{children}</div>
            {footer && <div className="pb-safe px-6 pt-2">{footer}</div>}
            {!footer && <div className="pb-safe" />}
          </motion.section>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
