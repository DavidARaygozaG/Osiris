'use client';

import { motion } from 'motion/react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { useCorteStore } from '@/stores/useCorteStore';
import styles from './styles/Gastos.module.css';
import { NumberInput } from '@mantine/core';

const PRECIO_KG = 22;

export default function Gastos() {
  const { gastosExtra, addGasto, removeGasto, updateGasto, mermaKg, setMermaKg } = useCorteStore();

  const totalMerma = mermaKg * PRECIO_KG;
  const totalExtras = gastosExtra.reduce((acc, g) => acc + Number(g.monto), 0);
  const totalGastos = totalExtras + totalMerma;

  return (
    <div className={styles.wrapper}>
      {/* Tortilla sobrante */}
      <div className={styles.mermaCard}>
        <div className={styles.mermaHeader}>
          <span className={styles.mermaIcon}>🫓</span>
          <div>
            <p className={styles.mermaTitle}>
              Tortilla Sobrante <span className={styles.mermaBadge}>Merma</span>
            </p>
            <p className={styles.mermaDesc}>Se calcula a ${PRECIO_KG} MXN por kilo</p>
          </div>
        </div>
        <div className={styles.mermaRow}>
          <div className={styles.mermaField}>
            <NumberInput label="Kilos Sobrantes" placeholder="0.000" step={0.1} min={0.0} onChange={setMermaKg} decimalScale={3} fixedDecimalScale />
          </div>
          <div className={styles.mermaTotal}>
            <label className={styles.mermaLabel}>TOTAL</label>
            <span className={styles.mermaTotalValue}>${totalMerma.toLocaleString('es-MX')}</span>
          </div>
        </div>
      </div>

      {/* Gastos adicionales */}
      <div className={styles.gastosCard}>
        <div className={styles.gastosHeader}>
          <span className={styles.gastosIcon}>🧾</span>
          <span className={styles.gastosTitle}>Gastos Adicionales</span>
        </div>

        {gastosExtra.map((g, i) => (
          <motion.div key={i} className={styles.row} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <input className={styles.input} placeholder="Concepto (Gas, Luz...)" value={g.concepto} onChange={e => updateGasto(i, 'concepto', e.target.value)} />
            <NumberInput
              placeholder="$0.00"
              defaultValue={0}
              min={0}
              value={g.monto ?? 0}
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
              onChange={value => updateGasto(i, 'monto', value)}
            />
            <motion.button whileTap={{ scale: 0.85 }} className={styles.deleteBtn} onClick={() => removeGasto(i)}>
              <MdDelete />
            </motion.button>
          </motion.div>
        ))}

        <motion.button whileTap={{ scale: 0.97 }} className={styles.addBtn} onClick={addGasto}>
          <MdAdd /> Añadir otro gasto
        </motion.button>
      </div>

      {totalGastos > 0 && (
        <div className={styles.total}>
          {totalMerma > 0 && (
            <span className={styles.totalDetalle}>
              Merma ${totalMerma.toLocaleString('es-MX')} + Gastos ${totalExtras.toLocaleString('es-MX')} ={' '}
            </span>
          )}
          <strong>${totalGastos.toLocaleString('es-MX')}</strong>
        </div>
      )}
    </div>
  );
}
