'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MdClose, MdAdd, MdRemove, MdGrain } from 'react-icons/md';
import styles from './HarinaModal.module.css';
import { Loader } from '@mantine/core';

export default function HarinaModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [ingresoHoy, setIngresoHoy] = useState(null); // {bultos, fechaDia} | null
  const [stock, setStock] = useState(0);
  const [bultos, setBultos] = useState(1);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/harina/ingreso')
      .then(r => r.json())
      .then(data => {
        setIngresoHoy(data.ingresoHoy);
        setStock(data.stock);
        setLoading(false);
      });
  }, []);

  const handleConfirmar = async () => {
    setSaving(true);
    const res = await fetch('/api/harina/ingreso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bultos }),
    });
    const data = await res.json();
    if (res.ok) {
      setStock(data.stockActual);
      setIngresoHoy({ bultos, fechaDia: new Date().toISOString().slice(0, 10) });
      setDone(true);
    }
    setSaving(false);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

      {/* Wrapper centrador fuera de cualquier transform padre */}
      <div className={styles.modalWrap}>
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <MdGrain className={styles.headerIcon} />
            <div>
              <h2 className={styles.title}>Ingresar Harina</h2>
              <p className={styles.sub}>
                Stock actual: <strong>{stock} bultos</strong>
              </p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.85 }} className={styles.closeBtn} onClick={onClose}>
            <MdClose />
          </motion.button>
        </div>

        {loading ? (
          <Loader size={50} color="green" className="absolute top-1/2 left-1/2" />
        ) : ingresoHoy ? (
          /* Ya se ingresó hoy */
          <div className={styles.yaIngresado}>
            <span className={styles.yaIcon}>✅</span>
            <p className={styles.yaMsg}>
              Ya ingresaste <strong>{ingresoHoy.bultos} bultos</strong> hoy
            </p>
            <p className={styles.yaSub}>Solo se permite un ingreso por día</p>
          </div>
        ) : done ? (
          /* Éxito */
          <motion.div className={styles.exitoCard} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <span className={styles.exitoIcon}>🌾</span>
            <p>
              ¡Ingresaste <strong>{bultos} bultos</strong>!
            </p>
            <p className={styles.yaSub}>Stock actualizado: {stock} bultos</p>
          </motion.div>
        ) : (
          /* Selector */
          <div className={styles.body}>
            <p className={styles.instruccion}>¿Cuántos bultos ingresaron hoy?</p>
            <div className={styles.counter}>
              <motion.button whileTap={{ scale: 0.82 }} className={styles.counterBtn} onClick={() => setBultos(b => Math.max(1, b - 1))}>
                <MdRemove />
              </motion.button>
              <AnimatePresence mode="wait">
                <motion.span
                  key={bultos}
                  className={styles.counterVal}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.12 }}>
                  {bultos}
                </motion.span>
              </AnimatePresence>
              <motion.button whileTap={{ scale: 0.82 }} className={styles.counterBtn} onClick={() => setBultos(b => b + 1)}>
                <MdAdd />
              </motion.button>
            </div>
            <p className={styles.bultosLabel}>{bultos === 1 ? '1 bulto' : `${bultos} bultos`}</p>

            <motion.button className={styles.confirmarBtn} whileTap={{ scale: 0.97 }} onClick={handleConfirmar} disabled={saving}>
              {saving ? 'Guardando...' : '✅ Confirmar ingreso'}
            </motion.button>
          </div>
        )}
      </motion.div>
      </div>
    </>,
    document.body
  );
}
