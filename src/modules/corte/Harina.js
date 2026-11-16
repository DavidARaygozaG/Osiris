'use client';

import { motion, AnimatePresence } from 'motion/react';
import { MdAdd, MdDelete } from 'react-icons/md';
import { useCorteStore } from '@/stores/useCorteStore';
import styles from './styles/Harina.module.css';

const FRACCIONES = [
  { valor: 0,    label: '0'   },
  { valor: 0.25, label: '¼'  },
  { valor: 0.5,  label: '½'  },
  { valor: 0.75, label: '¾'  },
  { valor: 1,    label: '1'   },
];

function FraccionSelector({ value, onChange, color }) {
  return (
    <div className={styles.fraccionRow}>
      {FRACCIONES.map(f => (
        <motion.button
          key={f.valor}
          whileTap={{ scale: 0.82 }}
          className={`${styles.fraccionBtn} ${value === f.valor ? styles.fraccionBtnActive : ''}`}
          style={value === f.valor ? { '--btn-color': color } : {}}
          onClick={() => onChange(f.valor)}
          type="button"
        >
          {f.label}
        </motion.button>
      ))}
    </div>
  );
}

export default function Harina() {
  const { tandas, addTanda, removeTanda, updateTanda } = useCorteStore();
  const totalBultos    = tandas.reduce((acc, t) => acc + t.harina + t.masa, 0);
  const ventaEstimada  = totalBultos * 880;

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {tandas.map((t, i) => {
          const bultosTanda = t.harina + t.masa;
          return (
            <motion.div
              key={i}
              className={styles.tanda}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40, scale: 0.95 }}
              transition={{ duration: 0.22 }}
            >
              {/* Header */}
              <div className={styles.tandaHeader}>
                <div className={styles.tandaHeaderLeft}>
                  <span className={styles.tandaNum}>{i + 1}</span>
                  <span className={styles.tandaLabel}>Tanda</span>
                </div>
                <div className={styles.tandaHeaderRight}>
                  <motion.span
                    className={styles.bultosChip}
                    key={bultosTanda}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    {bultosTanda.toFixed(2)} bultos
                  </motion.span>
                  <motion.button
                    whileTap={{ scale: 0.82 }}
                    className={styles.deleteBtn}
                    onClick={() => removeTanda(i)}
                  >
                    <MdDelete />
                  </motion.button>
                </div>
              </div>

              {/* Selectores */}
              <div className={styles.selectores}>
                <div className={styles.selectorGroup}>
                  <div className={styles.selectorLabelRow}>
                    <span className={styles.selectorEmoji}>🌾</span>
                    <span className={styles.selectorLabel}>Harina</span>
                    <span className={styles.selectorValor}>{t.harina === 0 ? '—' : t.harina === 1 ? '1 bulto' : `${FRACCIONES.find(f=>f.valor===t.harina)?.label} bulto`}</span>
                  </div>
                  <FraccionSelector value={t.harina} onChange={v => updateTanda(i, 'harina', v)} color="#f59e0b" />
                </div>
                <div className={styles.selectorGroup}>
                  <div className={styles.selectorLabelRow}>
                    <span className={styles.selectorEmoji}>🫙</span>
                    <span className={styles.selectorLabel}>Masa</span>
                    <span className={styles.selectorValor}>{t.masa === 0 ? '—' : t.masa === 1 ? '1 bulto' : `${FRACCIONES.find(f=>f.valor===t.masa)?.label} bulto`}</span>
                  </div>
                  <FraccionSelector value={t.masa} onChange={v => updateTanda(i, 'masa', v)} color="#818cf8" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.97 }} className={styles.addBtn} onClick={addTanda}>
        <MdAdd /> Agregar tanda
      </motion.button>

      {tandas.length > 0 && (
        <motion.div
          className={styles.totales}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>TOTAL EN BULTOS</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={totalBultos}
                className={styles.totalBultos}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {totalBultos.toFixed(2)}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className={styles.divider} />
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>VENTA ESTIMADA DE TORTILLA</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={ventaEstimada}
                className={styles.totalVenta}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                ${ventaEstimada.toLocaleString('es-MX')}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
