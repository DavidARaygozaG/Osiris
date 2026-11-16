'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MdCheckCircle, MdLocalFireDepartment, MdInventory2 } from 'react-icons/md';
import BottomNav from '@/components/navigation/BottomNav';
import Calendario from '@/modules/historial/Calendario';
import DetalleCorte from '@/modules/historial/DetalleCorte';
import InsightsCard from '@/modules/historial/InsightsCard';
import MetaMensual from '@/modules/historial/MetaMensual';
import { useHistorialStats } from '@/hooks/useHistorialStats';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import styles from './Historial.module.css';

export default function HistorialPage() {
  const hoy = new Date();
  const [year,    setYear]    = useState(hoy.getFullYear());
  const [month,   setMonth]   = useState(hoy.getMonth());
  const [cortes,  setCortes]  = useState([]);
  const [selected, setSelected] = useState(null);

  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    fetch('/api/historial')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(setCortes)
      .catch(err => console.warn('historial fetch error:', err));
  }, []);

  const corteMap = useMemo(() => {
    const m = {};
    cortes.forEach(c => {
      const key = new Date(c.fecha).toISOString().slice(0, 10);
      m[key] = c;
    });
    return m;
  }, [cortes]);

  const stats = useHistorialStats(cortes, { year, month });

  const prevMes = () => {
    setSelected(null);
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const nextMes = () => {
    setSelected(null);
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  const handleSelect = (dia, key, corte) => {
    setSelected({ dia, key, corte });
  };

  // Corte del día anterior cronológicamente (para trends)
  const prevCorte = useMemo(() => {
    if (!selected?.corte) return null;
    const sorted = [...cortes].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const idx = sorted.findIndex(c => c.id === selected.corte.id);
    return idx > 0 ? sorted[idx - 1] : null;
  }, [selected, cortes]);

  return (
    <>
      <main className={styles.page}>
        {/* ── Hero header ── */}
        <motion.header
          className={styles.hero}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className={styles.heroTitle}>📋 Historial</h1>
            <p className={styles.heroSub}>Análisis y registro de cortes</p>
          </div>
          <div className={styles.heroStats}>
            <HeroStat icon={<MdInventory2 />} label="Cortes" value={stats.totalCortes} />
            <HeroStat icon={<MdCheckCircle />} label="Coincidencia" value={`${stats.coincidencia.toFixed(0)}%`} accent="#34d399" />
            <HeroStat icon={<MdLocalFireDepartment />} label="Racha" value={stats.rachaActual} accent="#fb923c" />
          </div>
        </motion.header>

        {/* ── Layout responsive ── */}
        <div className={styles.layout}>
          {/* Columna izquierda: Calendario + Insights + Meta */}
          <div className={styles.colLeft}>
            <Calendario
              year={year}
              month={month}
              corteMap={corteMap}
              selectedKey={selected?.key}
              onPrev={prevMes}
              onNext={nextMes}
              onSelect={handleSelect}
            />
            <InsightsCard stats={stats} />
            <MetaMensual stats={stats} year={year} month={month} />
          </div>

          {/* Columna derecha: Detalle */}
          <div className={styles.colRight}>
            <AnimatePresence mode="wait">
              {selected ? (
                <DetalleCorte
                  key={selected.key}
                  selected={selected}
                  year={year}
                  month={month}
                  prevCorte={prevCorte}
                  onClose={() => setSelected(null)}
                />
              ) : (
                isDesktop && (
                  <motion.div
                    key="empty"
                    className={styles.emptyDesktop}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className={styles.emptyEmoji}>👆</span>
                    <p>Selecciona un día del calendario</p>
                    <span className={styles.emptyHint}>
                      Los días con punto tienen corte registrado
                    </span>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function HeroStat({ icon, label, value, accent }) {
  return (
    <motion.div
      className={styles.heroStat}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <span className={styles.heroStatIcon} style={{ color: accent || 'var(--color-primary)' }}>{icon}</span>
      <div>
        <span className={styles.heroStatVal}>{value}</span>
        <span className={styles.heroStatLbl}>{label}</span>
      </div>
    </motion.div>
  );
}
