'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { MdFlag, MdEdit, MdCheck, MdClose } from 'react-icons/md';
import { toast } from 'sonner';
import Section from '@/components/cards/Section';
import styles from './MetaMensual.module.css';

const fmt = n => `$${Number(n || 0).toLocaleString('es-MX')}`;

export default function MetaMensual({ stats, year, month }) {
  const { totalVentas } = stats;
  const [meta, setMeta]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');

  useEffect(() => {
    fetch('/api/admin/config')
      .then(r => { if (!r.ok || r.headers.get('content-length') === '0') throw new Error('empty'); return r.text(); })
      .then(txt => { if (!txt) throw new Error('empty'); return JSON.parse(txt); })
      .then(cfg => setMeta(Number(cfg.meta_mensual || 50000)))
      .catch(() => setMeta(50000));
  }, []);

  if (meta == null) return null;

  const pct        = Math.min((totalVentas / meta) * 100, 100);
  const hoy        = new Date();
  const enMes      = hoy.getFullYear() === year && hoy.getMonth() === month;
  const totalDias  = new Date(year, month + 1, 0).getDate();
  const diaActual  = enMes ? hoy.getDate() : totalDias;
  const promDiario = diaActual ? totalVentas / diaActual : 0;
  const proyeccion = promDiario * totalDias;
  const restante   = Math.max(meta - totalVentas, 0);
  const diasRest   = Math.max(totalDias - diaActual, 1);
  const necesario  = restante / diasRest;

  const mensaje = pct >= 100
    ? '🎉 ¡Meta alcanzada! Sigue así.'
    : proyeccion >= meta
      ? '🚀 ¡Vas adelantado! Proyección por encima de la meta.'
      : enMes
        ? `Necesitas ${fmt(necesario)} diarios para llegar.`
        : `Cerraste el mes en ${pct.toFixed(0)}% de la meta.`;

  async function guardar() {
    const v = Number(draft);
    if (!v || v <= 0) return toast.error('Meta inválida');
    await fetch('/api/admin/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'meta_mensual', value: v }),
    });
    setMeta(v);
    setEditing(false);
    toast.success('Meta actualizada');
  }

  return (
    <Section
      delay={0.15}
      title="Meta del mes"
      icon={<MdFlag />}
      action={
        !editing ? (
          <button className={styles.editBtn} onClick={() => { setDraft(String(meta)); setEditing(true); }}>
            <MdEdit /> Editar
          </button>
        ) : (
          <div className={styles.editActions}>
            <button className={styles.iconBtn} onClick={guardar} aria-label="Guardar"><MdCheck /></button>
            <button className={styles.iconBtn} onClick={() => setEditing(false)} aria-label="Cancelar"><MdClose /></button>
          </div>
        )
      }
    >
      <div className={styles.body}>
        <ProgressRing pct={pct} />
        <div className={styles.info}>
          {editing ? (
            <div className={styles.inputWrap}>
              <span>$</span>
              <input
                type="number"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                className={styles.input}
                autoFocus
              />
            </div>
          ) : (
            <div className={styles.lineRow}>
              <span className={styles.lineLbl}>Meta</span>
              <span className={styles.lineVal}>{fmt(meta)}</span>
            </div>
          )}
          <div className={styles.lineRow}>
            <span className={styles.lineLbl}>Vendido</span>
            <span className={styles.lineVal} style={{ color: '#6ee7b7' }}>{fmt(totalVentas)}</span>
          </div>
          <div className={styles.lineRow}>
            <span className={styles.lineLbl}>Proyección</span>
            <span className={styles.lineVal}>{fmt(proyeccion)}</span>
          </div>
        </div>
      </div>
      <p className={styles.mensaje}>{mensaje}</p>
    </Section>
  );
}

function ProgressRing({ pct, size = 88, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = useMotionValue(c);
  const num  = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = c - (c * pct) / 100;
    const ctrlDash = animate(dash, target, { duration: 1.1, ease: 'easeOut' });
    const ctrlNum  = animate(num, pct, { duration: 1.1, ease: 'easeOut',
      onUpdate: v => setDisplay(Math.round(v)) });
    return () => { ctrlDash.stop(); ctrlNum.stop(); };
  }, [pct, c, dash, num]);

  return (
    <svg width={size} height={size} className={styles.ring}>
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke="url(#metaGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        style={{ strokeDashoffset: dash }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <defs>
        <linearGradient id="metaGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <text
        x="50%" y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className={styles.ringText}
      >
        {display}%
      </text>
    </svg>
  );
}
