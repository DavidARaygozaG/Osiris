'use client';

import { useRef, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import {
  MdClose, MdTrendingUp, MdTrendingDown, MdShoppingBag,
  MdGrain, MdLocalShipping, MdReceipt, MdEditNote, MdAttachMoney,
  MdAccountBalanceWallet, MdSavings,
} from 'react-icons/md';
import Section from '@/components/cards/Section';
import ShareCorte from './ShareCorte';
import styles from './DetalleCorte.module.css';

const fmt = n => `$${Number(n || 0).toLocaleString('es-MX')}`;
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_LARGO = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];

function fmtFecha(year, month, dia) {
  const d = new Date(year, month, dia);
  return `${DIAS_LARGO[d.getDay()]} ${dia} de ${MESES[month]}, ${year}`;
}

function trendVs(actual, anterior) {
  if (!anterior) return null;
  const pct = ((actual - anterior) / anterior) * 100;
  return { pct, up: pct >= 0 };
}

export default function DetalleCorte({ selected, year, month, prevCorte, onClose }) {
  const { dia, corte: c } = selected;

  if (!c) {
    return (
      <motion.div
        className={styles.detalle}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2 }}
      >
        <div className={styles.headerRow}>
          <span className={styles.fecha}>{fmtFecha(year, month, dia)}</span>
          <motion.button whileTap={{ scale: 0.85 }} className={styles.closeBtn} onClick={onClose}>
            <MdClose />
          </motion.button>
        </div>
        <div className={styles.sinCorte}>
          <span className={styles.sinCorteEmoji}>📭</span>
          <p>Sin corte registrado este día</p>
          <span className={styles.sinCorteHint}>Cierra y registra uno nuevo desde el inicio</span>
        </div>
      </motion.div>
    );
  }

  return <DetalleContenido c={c} dia={dia} year={year} month={month} prevCorte={prevCorte} onClose={onClose} />;
}

function DetalleContenido({ c, dia, year, month, prevCorte, onClose }) {
  const captureRef = useRef(null);
  const scrollRef  = useRef(null);

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  const productosTotal = useMemo(
    () => (c?.productos ?? []).reduce((a, p) => a + p.cantidad * (p.producto?.precio ?? 0), 0),
    [c]
  );

  const tandasResumen = useMemo(() => {
    const tandas = c?.tandas ?? [];
    const totalHarina = tandas.reduce((a, t) => a + (t.harina || 0), 0);
    const totalMasa   = tandas.reduce((a, t) => a + (t.masa || 0), 0);
    return { tandas, totalHarina, totalMasa };
  }, [c]);

  const proveedoresActivos = (c?.proveedores ?? []).filter(p => p.paso || p.cobro > 0 || p.dejo > 0);
  const totalCobrado = proveedoresActivos.reduce((a, p) => a + (p.cobro || 0), 0);

  const trendVentas = prevCorte ? trendVs(c.totalVentas, prevCorte.totalVentas) : null;
  const trendNeto   = prevCorte ? trendVs(c.totalVentas - c.totalGastos, prevCorte.totalVentas - prevCorte.totalGastos) : null;

  const estado = c.estado === 'falto'
    ? { label: 'Faltó',     icon: '❌', color: '#f87171' }
    : { label: 'Coincidió', icon: '✅', color: '#34d399' };

  const neto = c.totalVentas - c.totalGastos;

  return (
    <motion.div
      className={styles.detalleWrapper}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      {/* Scroll progress bar */}
      <motion.div className={styles.progressBar} style={{ scaleX: progress }} />

      <div className={styles.scrollArea} ref={scrollRef}>
        <div ref={captureRef} className={styles.captureRoot}>
          {/* Header */}
          <div className={styles.headerRow}>
            <div className={styles.headerLeft}>
              <span className={styles.fecha}>{fmtFecha(year, month, dia)}</span>
              <span
                className={styles.estadoBadge}
                style={{ background: `${estado.color}1f`, border: `1px solid ${estado.color}55`, color: estado.color }}
              >
                <span>{estado.icon}</span>
                <span>{estado.label}</span>
              </span>
            </div>
            <div className={styles.headerActions}>
              <ShareCorte targetRef={captureRef} corte={c} fecha={fmtFecha(year, month, dia)} />
              <motion.button whileTap={{ scale: 0.85 }} className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                <MdClose />
              </motion.button>
            </div>
          </div>

          {/* Hero financiero */}
          <Section className={styles.hero} delay={0.05}>
            <div className={styles.kpiRow}>
              <KPI label="Ventas" value={fmt(c.totalVentas)} icon={<MdAttachMoney />} color="#6ee7b7" trend={trendVentas} />
              <KPI label="Gastos" value={fmt(c.totalGastos)} icon={<MdAccountBalanceWallet />} color="#f87171" />
              <KPI label="Neto"   value={fmt(neto)}           icon={<MdSavings />}              color="#818cf8" trend={trendNeto} />
            </div>
            {c.diferencia !== 0 && (
              <div
                className={styles.diferencia}
                style={{
                  color: c.diferencia > 0 ? '#34d399' : '#f87171',
                  background: c.diferencia > 0 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                  border: `1px solid ${c.diferencia > 0 ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                }}
              >
                {c.diferencia > 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                <span>
                  <strong>{c.diferencia > 0 ? 'Sobró ' : 'Faltó '}{fmt(Math.abs(c.diferencia))}</strong> en caja
                </span>
              </div>
            )}
          </Section>

          {/* Productos vendidos */}
          {c.productos?.length > 0 && (
            <Section delay={0.1} title="Productos vendidos" icon={<MdShoppingBag />}>
              <div className={styles.tabla}>
                <div className={`${styles.tablaRow} ${styles.tablaHead}`}>
                  <span>Producto</span>
                  <span>Cant.</span>
                  <span>Subtotal</span>
                </div>
                {c.productos.map(p => {
                  const sub = p.cantidad * (p.producto?.precio ?? 0);
                  const pct = productosTotal ? (sub / productosTotal) * 100 : 0;
                  return (
                    <div key={p.id} className={styles.tablaRow}>
                      <div className={styles.prodInfo}>
                        <span className={styles.prodNombre}>{p.producto?.nombre}</span>
                        <span className={styles.prodPrecio}>${p.producto?.precio} c/u · {pct.toFixed(0)}% del total</span>
                      </div>
                      <span className={styles.prodCant}>{p.cantidad}</span>
                      <span className={styles.prodSub}>{fmt(sub)}</span>
                    </div>
                  );
                })}
                <div className={`${styles.tablaRow} ${styles.tablaTotal}`}>
                  <span>Total productos</span>
                  <span />
                  <span>{fmt(productosTotal)}</span>
                </div>
              </div>
            </Section>
          )}

          {/* Tandas de masa */}
          {tandasResumen.tandas.length > 0 && (
            <Section delay={0.15} title="Tandas de masa" icon={<MdGrain />}>
              <div className={styles.statsRow}>
                <Mini label="Tandas"          value={tandasResumen.tandas.length} />
                <Mini label="Bultos harina"   value={tandasResumen.totalHarina.toFixed(2)} />
                <Mini label="Bultos masa"     value={c.totalBultos} />
              </div>
              <div className={styles.tandasList}>
                {tandasResumen.tandas.map((t, i) => (
                  <div key={t.id} className={styles.tandaRow}>
                    <span className={styles.tandaNum}>#{i + 1}</span>
                    <span>🌾 {t.harina} bulto{t.harina !== 1 ? 's' : ''} harina</span>
                    <span>🥟 {t.masa} masa</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Proveedores */}
          {proveedoresActivos.length > 0 && (
            <Section delay={0.2} title="Proveedores del día" icon={<MdLocalShipping />}>
              <div className={styles.tabla}>
                <div className={`${styles.tablaRow} ${styles.tablaHead} ${styles.prov4}`}>
                  <span>Proveedor</span>
                  <span>Pasó</span>
                  <span>Dejó</span>
                  <span>Cobró</span>
                </div>
                {proveedoresActivos.map(p => (
                  <div key={p.id} className={`${styles.tablaRow} ${styles.prov4}`}>
                    <span className={styles.provNombre}>{p.proveedor?.nombre}</span>
                    <span>{p.paso ? '✅' : '—'}</span>
                    <span>{p.dejo > 0 ? p.dejo : '—'}</span>
                    <span className={styles.prodSub}>{p.cobro > 0 ? fmt(p.cobro) : '—'}</span>
                  </div>
                ))}
                <div className={`${styles.tablaRow} ${styles.prov4} ${styles.tablaTotal}`}>
                  <span>Total cobrado</span>
                  <span /><span /><span>{fmt(totalCobrado)}</span>
                </div>
              </div>
            </Section>
          )}

          {/* Gastos */}
          {c.gastos?.length > 0 && (
            <Section delay={0.25} title="Gastos adicionales" icon={<MdReceipt />}>
              <div className={styles.tabla}>
                {c.gastos.map(g => (
                  <div key={g.id} className={styles.gastoRow}>
                    <span className={styles.gastoConcepto}>{g.concepto}</span>
                    <span className={styles.gastoMonto}>{fmt(g.monto)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Notas */}
          {c.notas && (
            <Section delay={0.3} title="Notas" icon={<MdEditNote />}>
              <p className={styles.notas}>{c.notas}</p>
            </Section>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Sub-componentes ─────────────────────────────────────────────────────── */
function KPI({ label, value, icon, color, trend }) {
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiIcon} style={{ color }}>{icon}</span>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiVal} style={{ color }}>{value}</span>
      {trend && (
        <span
          className={styles.kpiTrend}
          style={{ color: trend.up ? '#34d399' : '#f87171' }}
        >
          {trend.up ? '▲' : '▼'} {Math.abs(trend.pct).toFixed(0)}%
        </span>
      )}
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className={styles.mini}>
      <span className={styles.miniVal}>{value}</span>
      <span className={styles.miniLabel}>{label}</span>
    </div>
  );
}
