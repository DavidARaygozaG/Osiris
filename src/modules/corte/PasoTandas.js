'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PiPlusBold, PiTrashDuotone, PiCookingPotDuotone } from 'react-icons/pi';
import QtyStepper from '@/components/ui/QtyStepper';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useCorteStore } from '@/stores/useCorteStore';
import { fraccion } from '@/lib/format';
import { entraSale, fila, lista, toque } from './anim';

/**
 * Paso 3: tandas. Cada tanda = bultos de harina + bultos de masa, en pasos de ¼.
 * Tip: `step={0.25}` + `format={fraccion}` convierte 0.75 en "¾".
 */
export default function PasoTandas() {
  const tandas = useCorteStore(s => s.tandas);
  const precioBulto = useCorteStore(s => s.precios.bulto);
  const addTanda = useCorteStore(s => s.addTanda);
  const removeTanda = useCorteStore(s => s.removeTanda);
  const updateTanda = useCorteStore(s => s.updateTanda);

  const bultos = tandas.reduce((acc, t) => acc + t.harina + t.masa, 0);

  return (
    <motion.div variants={lista} initial="hidden" animate="show" className="space-y-3">
      {tandas.length === 0 && (
        <motion.p variants={fila} className="glass flex items-center gap-3 px-5 py-4 text-ink-soft">
          <PiCookingPotDuotone className="size-8 shrink-0 text-ink" aria-hidden />
          Todavía no hay tandas. Toca el botón para agregar la primera.
        </motion.p>
      )}

      <AnimatePresence initial={false}>
        {tandas.map((t, i) => (
          <motion.article key={t.id ?? i} layout="position" {...entraSale} className="glass-row space-y-1 p-4">
            <header className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Tanda {i + 1}</h2>
              <motion.button
                type="button"
                whileTap={toque}
                onClick={() => removeTanda(i)}
                aria-label={`Quitar tanda ${i + 1}`}
                className="btn btn-ghost btn-circle size-12 min-h-12 text-chile">
                <PiTrashDuotone className="size-6" />
              </motion.button>
            </header>
            <Fila etiqueta="Harina" valor={t.harina} onChange={v => updateTanda(i, 'harina', v)} />
            <Fila etiqueta="Masa" valor={t.masa} onChange={v => updateTanda(i, 'masa', v)} />
          </motion.article>
        ))}
      </AnimatePresence>

      <motion.div variants={fila} layout="position">
        <motion.button type="button" whileTap={toque} onClick={addTanda} className="btn btn-big btn-cafe w-full">
          <PiPlusBold className="size-5" aria-hidden /> Agregar tanda
        </motion.button>
      </motion.div>

      {tandas.length > 0 && (
        <p className="num text-center text-lg text-ink-soft" aria-live="polite">
          {tandas.length} {tandas.length === 1 ? 'tanda' : 'tandas'} · <strong className="text-ink">{fraccion(bultos)} bultos</strong> ={' '}
          <strong className="text-ink">
            <AnimatedNumber value={bultos * precioBulto} />
          </strong>{' '}
          de tortilla
        </p>
      )}
    </motion.div>
  );
}

function Fila({ etiqueta, valor, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-lg font-semibold">{etiqueta}</span>
      <QtyStepper value={valor} onChange={onChange} step={0.25} max={1} format={fraccion} label={etiqueta} />
    </div>
  );
}
