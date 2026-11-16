'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import styles from './Calendario.module.css';

const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function Calendario({ year, month, corteMap, selectedKey, onPrev, onNext, onSelect }) {
  const hoy = new Date();

  const dias = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const isHoy = (d) => d === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear();
  const keyOf = (d) => `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  return (
    <div className={styles.calCard}>
      <div className={styles.mesNav}>
        <motion.button whileTap={{ scale: 0.85 }} className={styles.navBtn} onClick={onPrev} aria-label="Mes anterior">
          <MdChevronLeft />
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.span
            key={`${year}-${month}`}
            className={styles.mesLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
          >
            {MESES[month]} {year}
          </motion.span>
        </AnimatePresence>
        <motion.button whileTap={{ scale: 0.85 }} className={styles.navBtn} onClick={onNext} aria-label="Mes siguiente">
          <MdChevronRight />
        </motion.button>
      </div>

      <div className={styles.grid7}>
        {DIAS.map(d => <span key={d} className={styles.diaHeader}>{d}</span>)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}-grid`}
          className={styles.grid7}
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: { opacity: 0 },
            show:   { opacity: 1, transition: { staggerChildren: 0.012 } },
            exit:   { opacity: 0, transition: { duration: 0.1 } },
          }}
        >
          {dias.map((dia, i) => {
            if (!dia) return <div key={`e${i}`} />;
            const key   = keyOf(dia);
            const corte = corteMap[key];
            const sel   = selectedKey === key;
            const today = isHoy(dia);
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.85 }}
                whileHover={corte ? { scale: 1.05, y: -2 } : { scale: 1.03 }}
                variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                className={[
                  styles.diaBtn,
                  corte ? styles[`dia_${corte.estado}`] : '',
                  today ? styles.diaHoy : '',
                ].join(' ')}
                onClick={() => onSelect(dia, key, corte ?? null)}
              >
                {sel && (
                  <motion.span
                    layoutId="diaRing"
                    className={styles.diaRing}
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className={styles.diaNum}>{dia}</span>
                {corte && <span className={styles.diaDot} />}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className={styles.leyenda}>
        <span className={styles.leyItem} style={{ color: '#34d399' }}>● Coincidió</span>
        <span className={styles.leyItem} style={{ color: '#f87171' }}>● Faltó</span>
      </div>
    </div>
  );
}
