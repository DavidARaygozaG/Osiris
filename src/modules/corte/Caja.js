'use client';

import { useCorteStore } from '@/stores/useCorteStore';
import styles from './styles/Caja.module.css';
import { NumberInput } from '@mantine/core';
import { root } from 'postcss/lib/postcss';
import { color } from 'motion';

export default function Caja() {
  const { dineroEnCaja, setDineroEnCaja, notas, setNotas } = useCorteStore();

  return (
    <div className={styles.wrapper}>
      <span className={styles.cajaIcon}>💰</span>
      <p className={styles.label}>¿Cuánto dinero hay físicamente en caja?</p>

      <div className={styles.inputWrapper}>
        <NumberInput
          classNames={{ input: 'cajaInput' }}
          size="xl"
          placeholder="0"
          value={dineroEnCaja ?? 0}
          onChange={setDineroEnCaja}
          prefix="$ "
          suffix=" MXN"
          decimalScale={2}
          fixedDecimalScale
        />
      </div>

      <span className={styles.notasLabel}>Notas del día (opcional)</span>
      <textarea className={styles.notas} placeholder="Algo que recordar del día..." value={notas} onChange={e => setNotas(e.target.value)} />
    </div>
  );
}
