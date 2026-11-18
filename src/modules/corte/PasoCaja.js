'use client';

import { motion } from 'motion/react';
import { PiCashRegisterDuotone } from 'react-icons/pi';
import MoneyField from '@/components/ui/MoneyField';
import Glass from '@/components/ui/Glass';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useCorteStore } from '@/stores/useCorteStore';
import { fila, lista } from './anim';

/** Paso 6: el dinero que hay en la caja (+ nota opcional). */
export default function PasoCaja() {
  const dinero = useCorteStore(s => s.dineroEnCaja);
  const setDinero = useCorteStore(s => s.setDineroEnCaja);
  const notas = useCorteStore(s => s.notas);
  const setNotas = useCorteStore(s => s.setNotas);

  return (
    <motion.div variants={lista} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fila}>
        <Glass className="glass-liquid flex flex-col items-center gap-1 px-5 py-6 text-center" aria-live="polite">
          <PiCashRegisterDuotone className="float size-14 text-nopal drop-shadow-md" aria-hidden />
          <p className="text-ink-soft">En la caja hay</p>
          <p className="num text-6xl font-extrabold">
            <AnimatedNumber value={dinero} />
          </p>
        </Glass>
      </motion.div>
      <motion.div variants={fila}>
        <MoneyField label="Dinero en caja" hint="Billetes y monedas. Toca para cambiarlo" value={dinero} decimals onChange={setDinero} />
      </motion.div>
      <motion.label variants={fila} className="block">
        <span className="mb-1.5 block px-1 font-semibold">Algo que recordar del día (opcional)</span>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={3}
          placeholder="Por ejemplo: se descompuso la máquina por la tarde"
          className="textarea w-full bg-field text-lg"
        />
      </motion.label>
    </motion.div>
  );
}
