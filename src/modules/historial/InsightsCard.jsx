'use client';

import { motion } from 'motion/react';
import { MdLocalFireDepartment, MdStar, MdInsights, MdShowChart } from 'react-icons/md';
import Section from '@/components/cards/Section';
import styles from './InsightsCard.module.css';

const fmt = n => `$${Number(n || 0).toLocaleString('es-MX')}`;

export default function InsightsCard({ stats }) {
  const { rachaActual, mejorDia, productoEstrella, sparkline, insights, totalCortes } = stats;
  if (totalCortes === 0) return null;

  return (
    <Section delay={0.1} title="Análisis del mes" icon={<MdInsights />}>
      <div className={styles.grid}>
        <div className={styles.statBox}>
          <span className={styles.statIcon} style={{ color: '#fb923c' }}><MdLocalFireDepartment /></span>
          <span className={styles.statVal}>{rachaActual}</span>
          <span className={styles.statLbl}>Racha actual</span>
        </div>
        {mejorDia && (
          <div className={styles.statBox}>
            <span className={styles.statIcon} style={{ color: '#818cf8' }}><MdShowChart /></span>
            <span className={styles.statVal}>{mejorDia.dia}</span>
            <span className={styles.statLbl}>Mejor día</span>
          </div>
        )}
        {productoEstrella && (
          <div className={styles.statBox}>
            <span className={styles.statIcon} style={{ color: '#fbbf24' }}><MdStar /></span>
            <span className={styles.statVal}>{productoEstrella.cantidad}</span>
            <span className={styles.statLbl}>{productoEstrella.nombre}</span>
          </div>
        )}
      </div>

      {sparkline?.length > 0 && (
        <div className={styles.sparkWrap}>
          <Sparkline data={sparkline} />
          <span className={styles.sparkLbl}>Ventas día a día</span>
        </div>
      )}

      {insights.length > 0 && (
        <ul className={styles.insightsList}>
          {insights.map((t, i) => (
            <motion.li
              key={t}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.25 }}
              className={styles.insightItem}
            >
              {t}
            </motion.li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/* Mini SVG sparkline animado con stroke-dasharray */
function Sparkline({ data, width = 280, height = 56 }) {
  const max = Math.max(...data, 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((v, i) => `${i * step},${height - (v / max) * (height - 8) - 4}`).join(' ');

  // path para el área bajo la línea
  const areaPath = `M0,${height} L${points.split(' ').join(' L')} L${width},${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.sparkSvg} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6ee7b7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <motion.polyline
        points={points}
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}
