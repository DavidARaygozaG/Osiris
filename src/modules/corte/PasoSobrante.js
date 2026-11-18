'use client';

import { motion } from 'motion/react';
import MoneyField from '@/components/ui/MoneyField';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useCorteStore } from '@/stores/useCorteStore';
import { money } from '@/lib/format';
import { fila, lista } from './anim';

/** Paso 4: merma (tortilla que se tiró) en kilos; se descuenta al precio de Ajustes por kilo. */
export default function PasoSobrante() {
  const mermaKg = useCorteStore(s => s.mermaKg);
  const PRECIO_KG = useCorteStore(s => s.precios.merma);
  const setMermaKg = useCorteStore(s => s.setMermaKg);

  return (
    <motion.div variants={lista} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={fila}>
        <MoneyField
          label="Tortilla que se tiró"
          hint="En kilos"
          value={mermaKg}
          decimals
          prefix=""
          suffix=" kg"
          display={v => `${v} kg`}
          onChange={setMermaKg}
        />
      </motion.div>
      <motion.p variants={fila} className="num px-1 text-center text-lg text-ink-soft" aria-live="polite">
        {mermaKg > 0 ? (
          <>
            {mermaKg} kg × {money(PRECIO_KG)} ={' '}
            <strong className="text-ink">
              <AnimatedNumber value={mermaKg * PRECIO_KG} />
            </strong>{' '}
            de merma
          </>
        ) : (
          `La tortilla que se tira se cuenta a ${money(PRECIO_KG)} el kilo.`
        )}
      </motion.p>
    </motion.div>
  );
}
