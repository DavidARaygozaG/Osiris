'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PiCaretLeftBold, PiCaretRightBold, PiCheckCircleFill, PiWarningFill, PiArrowCircleUpFill, PiMinusBold } from 'react-icons/pi';
import Glass from '@/components/ui/Glass';
import { toneDe } from '@/hooks/useHistorialStats';
import { diaMX } from '@/lib/fecha';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Icono + palabra por estado: nunca solo color
const TONOS = {
  ok: { Icon: PiCheckCircleFill, texto: 'cuadró', cls: 'tone-ok' },
  bad: { Icon: PiWarningFill, texto: 'faltó', cls: 'tone-bad' },
  warn: { Icon: PiArrowCircleUpFill, texto: 'sobró', cls: 'tone-warn' },
};

export const nombreMes = (year, month) => `${MESES[month]} ${year}`;

// Cambio de mes: la cuadrícula entra deslizando desde el lado al que vas; sus celdas caen en cascada.
const EASE = [0.16, 1, 0.3, 1];
const gridV = {
  enter: d => ({ opacity: 0, x: d * 36 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE, staggerChildren: 0.012 } },
  exit: d => ({ opacity: 0, x: d * -36, transition: { duration: 0.18 } }),
};
const celdaV = {
  enter: { opacity: 0, scale: 0.7 },
  center: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 420, damping: 24 } },
};

/** Calendario mensual táctil. Cada día con cuenta es un botón grande; los demás solo se muestran. */
export default function Calendario({ year, month, corteMap, onPrev, onNext, puedeAvanzar, onSelect }) {
  const sinMov = useReducedMotion();
  const hoy = new Date();
  const hoyKey = diaMX(); // hoy en Ciudad de México

  // Dirección del cambio de mes (patrón "estado derivado": se compara durante el render)
  const idx = year * 12 + month;
  const [previo, setPrevio] = useState(idx);
  const [dir, setDir] = useState(1);
  if (idx !== previo) {
    setDir(idx > previo ? 1 : -1);
    setPrevio(idx);
  }
  const d0 = sinMov ? 0 : dir;

  // Celdas vacías al inicio para alinear el día 1 con su día de la semana
  const celdas = useMemo(() => {
    const vacias = new Array(new Date(year, month, 1).getDay()).fill(null);
    const total = new Date(year, month + 1, 0).getDate();
    return [...vacias, ...Array.from({ length: total }, (_, i) => i + 1)];
  }, [year, month]);

  const keyOf = d => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <section aria-label="Calendario de días">
      <div className="mb-3 flex items-center justify-between gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={onPrev}
          aria-label="Mes anterior"
          className="btn btn-ghost size-14 min-h-14 px-0 text-ink">
          <PiCaretLeftBold className="size-7" />
        </motion.button>
        <h2 className="relative flex-1 text-center text-2xl font-extrabold capitalize" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false} custom={d0}>
            <motion.span
              key={idx}
              custom={d0}
              className="inline-block"
              initial={{ opacity: 0, x: d0 * 24, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: d0 * -24, filter: 'blur(4px)' }}
              transition={{ duration: 0.25, ease: EASE }}>
              {nombreMes(year, month)}
            </motion.span>
          </AnimatePresence>
        </h2>
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={onNext}
          disabled={!puedeAvanzar}
          aria-label="Mes siguiente"
          className="btn btn-ghost size-14 min-h-14 px-0 text-ink disabled:opacity-35">
          <PiCaretRightBold className="size-7" />
        </motion.button>
      </div>

      <Glass className="px-0.5 py-3">
        <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-sm font-bold text-ink-soft" aria-hidden>
          {DIAS.map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="relative">
          <AnimatePresence mode="popLayout" initial={false} custom={d0}>
            <motion.div
              key={idx}
              custom={d0}
              className="grid grid-cols-7 gap-0.5"
              variants={gridV}
              initial="enter"
              animate="center"
              exit="exit">
              {celdas.map((d, i) => {
                if (d === null) return <span key={`v${i}`} />;
                const key = keyOf(d);
                const corte = corteMap[key];
                const esHoy = key === hoyKey;
                const futuro = key > hoyKey;
                // El día de hoy respira con el aro verde (.pulse-ring) y lleva borde café
                const aro = esHoy ? 'pulse-ring border-2 border-ink/70' : '';
                const base = 'flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-lg font-bold';

                if (!corte) {
                  return (
                    <motion.div
                      key={key}
                      variants={celdaV}
                      className={`${base} ${aro} text-ink-soft`}
                      aria-label={`${d}, ${futuro ? 'todavía no llega' : 'sin cuenta'}`}>
                      <span className="num">{d}</span>
                      {!futuro && <PiMinusBold className="size-4" aria-hidden />}
                    </motion.div>
                  );
                }
                const t = TONOS[toneDe(corte)];
                return (
                  <motion.button
                    key={key}
                    type="button"
                    variants={celdaV}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onSelect(key, corte, d)}
                    aria-label={`${d} de ${MESES[month]}, ${t.texto}. Ver el día`}
                    className={`${t.cls} ${base} ${aro} bg-(--tone-bg) text-(--tone)`}>
                    <span className="num">{d}</span>
                    <t.Icon className="size-5" aria-hidden />
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Leyenda: cada símbolo con su palabra */}
        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-semibold text-ink-soft">
          {Object.values(TONOS).map(t => (
            <li key={t.texto} className={`${t.cls} flex items-center gap-1 text-(--tone)`}>
              <t.Icon className="size-4" aria-hidden /> <span className="capitalize">{t.texto}</span>
            </li>
          ))}
          <li className="flex items-center gap-1">
            <PiMinusBold className="size-4" aria-hidden /> Sin cuenta
          </li>
        </ul>
      </Glass>
    </section>
  );
}
