'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PiPlusBold, PiTrashDuotone, PiReceiptDuotone } from 'react-icons/pi';
import MoneyField from '@/components/ui/MoneyField';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useCorteStore } from '@/stores/useCorteStore';
import { entraSale, fila, lista, toque } from './anim';

// Atajos: un toque agrega el gasto ya con su nombre
const ATAJOS = ['Gas', 'Luz', 'Agua', 'Bolsas'];

/** Paso 5: otros gastos. Cada gasto = nombre + monto (teclado numérico grande). */
export default function PasoGastos() {
  const gastos = useCorteStore(s => s.gastosExtra);
  const addGasto = useCorteStore(s => s.addGasto);
  const removeGasto = useCorteStore(s => s.removeGasto);
  const updateGasto = useCorteStore(s => s.updateGasto);

  const total = gastos.reduce((acc, g) => acc + Number(g.monto ?? 0), 0);

  return (
    <motion.div variants={lista} initial="hidden" animate="show" className="space-y-4">
      {gastos.length === 0 && (
        <motion.p variants={fila} className="glass flex items-center gap-3 px-5 py-4 text-ink-soft">
          <PiReceiptDuotone className="size-8 shrink-0 text-ink" aria-hidden />
          No hay gastos anotados. Si no hubo, toca Siguiente.
        </motion.p>
      )}

      <ul className="space-y-4">
        <AnimatePresence initial={false}>
          {gastos.map((g, i) => (
            <motion.li key={g.id ?? i} layout="position" {...entraSale} className="glass-row space-y-2 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={g.concepto}
                  onChange={e => updateGasto(i, 'concepto', e.target.value)}
                  placeholder="¿En qué fue? (Gas, luz…)"
                  aria-label={`Nombre del gasto ${i + 1}`}
                  className="input input-lg h-14 min-h-14 flex-1 bg-field text-lg"
                />
                <motion.button
                  type="button"
                  whileTap={toque}
                  onClick={() => removeGasto(i)}
                  aria-label={`Quitar gasto ${i + 1}`}
                  className="btn btn-ghost btn-circle size-14 min-h-14 text-chile">
                  <PiTrashDuotone className="size-7" />
                </motion.button>
              </div>
              <MoneyField label="Cuánto fue" value={g.monto} decimals onChange={v => updateGasto(i, 'monto', v)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <motion.div variants={fila} className="flex flex-wrap gap-2">
        {ATAJOS.map(a => (
          <motion.button key={a} type="button" whileTap={toque} onClick={() => addGasto(a)} className="btn btn-glass h-12 min-h-12 text-base font-bold">
            <PiPlusBold className="size-4" aria-hidden /> {a}
          </motion.button>
        ))}
      </motion.div>
      <motion.div variants={fila}>
        <motion.button type="button" whileTap={toque} onClick={() => addGasto('')} className="btn btn-big btn-cafe w-full">
          <PiPlusBold className="size-5" aria-hidden /> Otro gasto
        </motion.button>
      </motion.div>

      {total > 0 && (
        <p className="num text-center text-lg text-ink-soft" aria-live="polite">
          Gastos anotados:{' '}
          <strong className="text-ink">
            <AnimatedNumber value={total} />
          </strong>
        </p>
      )}
    </motion.div>
  );
}
