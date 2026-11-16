'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MdDelete,
  MdAdd,
  MdCheck,
  MdVisibility,
  MdVisibilityOff,
  MdExpandMore,
  MdExpandLess,
  MdEdit,
  MdSave,
  MdClose,
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdInventory,
  MdLocalShipping,
  MdSettings,
  MdBarChart,
  MdDashboard,
} from 'react-icons/md';
import BottomNav from '@/components/navigation/BottomNav';
import { useAdminStore } from '@/stores/useAdminStore';
import styles from './Admin.module.css';
import { Loader } from '@mantine/core';

const fmt = n => `$${Number(n).toLocaleString('es-MX')}`;
const fmtK = n => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : fmt(n));
const fmtFecha = f => new Date(f).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
const ESTADO_COLOR = { coincidio: '#6ee7b7', falto: '#f87171' };
const ESTADO_LABEL = { coincidio: '✅ Coincidió', falto: '❌ Faltó' };

/** Fetch JSON con guard r.ok — evita crash si la API devuelve error/vacío */
const safeJson = async (url, opts, fallback = null) => {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) {
      console.warn('API error', r.status, url);
      return fallback;
    }
    const text = await r.text();
    if (!text) return fallback;
    return JSON.parse(text);
  } catch (e) {
    console.warn('safeJson error', url, e.message);
    return fallback;
  }
};

/* ══════════════════════════════════════════════════════════════
   CHARTS
══════════════════════════════════════════════════════════════ */
function BarChart({ data, height = 110 }) {
  const max = Math.max(...data.map(d => d.ventas), 1);
  return (
    <div className={styles.chartBarsWrap} style={{ height }}>
      {data.map((d, i) => {
        const pct = Math.max((d.ventas / max) * 100, 2);
        const col = ESTADO_COLOR[d.estado] ?? '#6ee7b7';
        return (
          <motion.div
            key={i}
            className={styles.bar}
            title={`${fmtFecha(d.fecha)}: ${fmt(d.ventas)}`}
            style={{ background: `linear-gradient(to top, ${col}33, ${col}bb)`, borderTop: `2px solid ${col}` }}
            initial={{ height: 0 }}
            animate={{ height: `${pct}%` }}
            transition={{ delay: i * 0.015, duration: 0.45, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

function DonutChart({ coincidio = 0, falto = 0 }) {
  const total = coincidio + falto || 1;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const segs = [
    { val: coincidio, color: '#6ee7b7', label: 'Coincidió' },
    { val: falto, color: '#f87171', label: 'Faltó' },
  ];
  let offset = circ / 4; // start at top
  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 100 100" className={styles.donutSvg}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {segs.map((s, i) => {
          const len = (s.val / total) * circ;
          const el = (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${len} ${circ}`}
              strokeDashoffset={circ - offset + circ}
              initial={{ strokeDasharray: `0 ${circ}` }}
              animate={{ strokeDasharray: `${len} ${circ}` }}
              transition={{ delay: i * 0.25, duration: 0.7 }}
            />
          );
          offset += len;
          return el;
        })}
        <text x="50" y="46" textAnchor="middle" fill="#e8e8f0" fontSize="10" fontWeight="700">
          {total}
        </text>
        <text x="50" y="57" textAnchor="middle" fill="#a0a0b8" fontSize="6" style={{ transform: 'none' }}>
          cortes
        </text>
      </svg>
      <div className={styles.donutLegend}>
        {segs.map(s => (
          <div key={s.label} className={styles.donutLegendItem}>
            <span className={styles.donutDot} style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className={styles.donutVal}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PIN
══════════════════════════════════════════════════════════════ */
function PinSection() {
  const { isAdmin, setAdmin, logout } = useAdminStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  const handleUnlock = async () => {
    const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
    const data = await res.json();
    if (data.ok) {
      setAdmin(true);
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className={styles.pinCard}>
      <div className={styles.pinStatus}>
        <span className={`${styles.pinDot} ${isAdmin ? styles.dotAdmin : styles.dotLocked}`} />
        {isAdmin ? '🔓 Admin activo' : '🔒 Modo usuario'}
      </div>
      {isAdmin ? (
        <button className={styles.logoutBtn} onClick={logout}>
          Cerrar sesión
        </button>
      ) : (
        <div className={styles.pinRight}>
          <div className={styles.pinForm}>
            <input
              className={styles.pinInput}
              type={show ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN"
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setError(false);
              }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            />
            <button className={styles.pinBtn} onClick={() => setShow(s => !s)}>
              {show ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
            <button className={styles.pinBtn} onClick={handleUnlock}>
              OK
            </button>
          </div>
          {error && <span className={styles.pinError}>PIN incorrecto</span>}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DETALLE CORTE
══════════════════════════════════════════════════════════════ */
function CorteDetalle({ c }) {
  const cobrosProveedores = (c.proveedores ?? []).filter(p => p.paso).reduce((a, p) => a + p.cobro, 0);
  const gastosExtra = (c.gastos ?? []).reduce((a, g) => a + g.monto, 0);
  const mermaEstimada = c.totalGastos - cobrosProveedores - gastosExtra;

  return (
    <div className={styles.detalleBody}>
      {/* Financiero */}
      <span className={styles.detalleSection}>💰 Financiero</span>
      <div className={styles.detalleGrid}>
        {[
          ['Venta tortilla', fmt(c.ventaTortilla), '#6ee7b7'],
          ['Venta productos', fmt(c.ventaProductos), '#818cf8'],
          ['Total ventas', fmt(c.totalVentas), '#6ee7b7'],
          ['Merma', fmt(mermaEstimada), '#f87171'],
          ['Cobro proveedores', fmt(cobrosProveedores), '#fbbf24'],
          ['Gastos extra', fmt(gastosExtra), '#f87171'],
          ['Total gastos', fmt(c.totalGastos), '#f87171'],
          ['Debería haber', fmt(c.deberiaHaber), '#6ee7b7'],
          ['En caja', fmt(c.dineroEnCaja), '#e8e8f0'],
          ['Diferencia', fmt(c.diferencia), c.diferencia === 0 ? '#6ee7b7' : c.diferencia < 0 ? '#f87171' : '#fbbf24'],
        ].map(([l, v, col]) => (
          <div key={l} className={styles.detalleFin}>
            <span className={styles.detalleFinLabel}>{l}</span>
            <span className={styles.detalleFinVal} style={{ color: col }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      {/* Tandas */}
      {c.tandas?.length > 0 && (
        <>
          <span className={styles.detalleSection}>🫓 Tandas ({c.tandas.length})</span>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>#</th>
                <th>Harina (bultos)</th>
                <th>Masa (bultos)</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {c.tandas.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td>{t.harina}</td>
                  <td>{t.masa}</td>
                  <td>{(t.harina + t.masa).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Productos vendidos */}
      {c.productos?.length > 0 && (
        <>
          <span className={styles.detalleSection}>🛒 Productos vendidos</span>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {c.productos.map(p => (
                <tr key={p.id}>
                  <td>{p.producto.nombre}</td>
                  <td>{p.cantidad}</td>
                  <td>${p.producto.precio}</td>
                  <td style={{ color: '#818cf8' }}>{fmt(p.cantidad * p.producto.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Proveedores */}
      {c.proveedores?.some(p => p.paso) && (
        <>
          <span className={styles.detalleSection}>🚚 Proveedores</span>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Dejó</th>
                <th>Cobró</th>
              </tr>
            </thead>
            <tbody>
              {c.proveedores
                .filter(p => p.paso)
                .map(p => (
                  <tr key={p.id}>
                    <td>{p.proveedor?.nombre ?? '—'}</td>
                    <td>{p.dejo}</td>
                    <td style={{ color: '#fbbf24' }}>{fmt(p.cobro)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {/* Gastos extra */}
      {c.gastos?.length > 0 && (
        <>
          <span className={styles.detalleSection}>📋 Gastos extra</span>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {c.gastos.map(g => (
                <tr key={g.id}>
                  <td>{g.concepto}</td>
                  <td style={{ color: '#f87171' }}>{fmt(g.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {c.notas && <p className={styles.notasDetalle}>💬 {c.notas}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB — RESUMEN
══════════════════════════════════════════════════════════════ */
function TabResumen({ stats, isAdmin, onDelete, deletingId }) {
  const [expandedId, setExpandedId] = useState(null);

  const kpis = [
    { icon: '💰', label: 'Ventas del mes', value: fmtK(stats.totalVentasMes), sub: `${stats.totalCortesMes} cortes`, color: '#6ee7b7' },
    { icon: '📈', label: 'Promedio diario', value: fmtK(stats.promedioDiario), sub: 'por corte', color: '#818cf8' },
    { icon: '❌', label: 'Días con falta', value: stats.diasConFalta, sub: `de ${stats.totalCortesMes}`, color: '#f87171' },
    { icon: '🏆', label: 'Mejor día', value: stats.mejorDia ? fmtK(stats.mejorDia.ventas) : '—', sub: stats.mejorDia ? fmtFecha(stats.mejorDia.fecha) : '—', color: '#fbbf24' },
  ];

  return (
    <div className={styles.tabContent}>
      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            className={styles.kpiCard}
            style={{ '--kc': k.color }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}>
            <span className={styles.kpiIcon}>{k.icon}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiSub} style={{ color: k.color }}>
              {k.sub}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Gráfica */}
      <motion.div className={styles.chartCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className={styles.chartHeader}>
          <span className={styles.chartTitle}>📊 Ventas últimos {stats.grafica.length} días</span>
          <div className={styles.chartLegend}>
            {[
              ['#6ee7b7', 'Coincidió'],
              ['#f87171', 'Faltó'],
            ].map(([c, l]) => (
              <span key={l}>
                <span className={styles.legendDot} style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
        </div>
        <BarChart data={stats.grafica} />
      </motion.div>

      {/* Lista cortes */}
      <span className={styles.sectionLabel}>Historial de cortes</span>
      <div className={styles.cortesList}>
        {stats.ultimosCortes.map((c, i) => {
          const exp = expandedId === c.id;
          const col = ESTADO_COLOR[c.estado];
          return (
            <motion.div
              key={c.id}
              className={styles.corteCard}
              style={{ '--cc': col }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.04 }}>
              {/* Header del corte */}
              <div className={styles.corteHeader} onClick={() => setExpandedId(exp ? null : c.id)}>
                <div className={styles.corteLeft}>
                  <span className={styles.corteFecha}>{fmtFecha(c.fecha)}</span>
                  <span className={styles.corteBadge} style={{ background: `${col}22`, border: `1px solid ${col}55`, color: col }}>
                    {ESTADO_LABEL[c.estado]}
                  </span>
                </div>
                <div className={styles.corteRight}>
                  <span className={styles.corteVentas}>{fmt(c.totalVentas)}</span>
                  <span className={styles.corteGastos} style={{ color: '#f87171' }}>
                    -{fmt(c.totalGastos)}
                  </span>
                  <span className={styles.expandIcon}>{exp ? <MdExpandLess /> : <MdExpandMore />}</span>
                  {isAdmin && (
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      className={styles.deleteBtn}
                      disabled={deletingId === c.id}
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(c.id);
                      }}>
                      <MdDelete />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Detalle expandible */}
              <AnimatePresence>
                {exp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: 'hidden' }}>
                    <CorteDetalle c={c} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB — ANALYTICS
══════════════════════════════════════════════════════════════ */
function TabAnalytics({ stats }) {
  const [periodo, setPeriodo] = useState(30);

  const data = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodo);
    return stats.ultimosCortes.filter(c => new Date(c.fecha) >= cutoff).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [stats, periodo]);

  const totalVentas = data.reduce((a, c) => a + c.totalVentas, 0);
  const totalGastos = data.reduce((a, c) => a + c.totalGastos, 0);
  const totalTortilla = data.reduce((a, c) => a + c.ventaTortilla, 0);
  const totalProductos = data.reduce((a, c) => a + c.ventaProductos, 0);
  const coincidio = data.filter(c => c.estado === 'coincidio').length;
  const falto = data.filter(c => c.estado === 'falto').length;
  const neto = totalVentas - totalGastos;

  return (
    <div className={styles.tabContent}>
      {/* Filtro período */}
      <div className={styles.periodoFilter}>
        {[7, 15, 30, 60].map(d => (
          <button key={d} className={`${styles.periodoBtn} ${periodo === d ? styles.periodoBtnActive : ''}`} onClick={() => setPeriodo(d)}>
            {d}d
          </button>
        ))}
      </div>

      {/* Stats del período */}
      <div className={styles.analyticsGrid}>
        {[
          { label: 'Total ventas', value: fmtK(totalVentas), color: '#6ee7b7', icon: '💰' },
          { label: 'Total gastos', value: fmtK(totalGastos), color: '#f87171', icon: '📉' },
          { label: 'Neto período', value: fmtK(neto), color: neto >= 0 ? '#6ee7b7' : '#f87171', icon: '✨' },
          { label: 'Cortes activos', value: data.length, color: '#818cf8', icon: '📋' },
          { label: 'Venta tortilla', value: fmtK(totalTortilla), color: '#fbbf24', icon: '🫓' },
          { label: 'Venta productos', value: fmtK(totalProductos), color: '#818cf8', icon: '🛒' },
        ].map((s, i) => (
          <motion.div key={s.label} className={styles.analyticCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}>
            <span className={styles.analyticIcon}>{s.icon}</span>
            <span className={styles.analyticVal} style={{ color: s.color }}>
              {s.value}
            </span>
            <span className={styles.analyticLabel}>{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Gráfica período */}
      <div className={styles.chartCard}>
        <span className={styles.chartTitle}>📈 Ventas en los últimos {periodo} días</span>
        <BarChart data={data.map(c => ({ fecha: c.fecha, ventas: c.totalVentas, estado: c.estado }))} height={130} />
      </div>

      {/* Donut + breakdown */}
      <div className={styles.analyticsBottom}>
        <div className={styles.chartCard} style={{ flex: 1 }}>
          <span className={styles.chartTitle}>🎯 Estados</span>
          <DonutChart coincidio={coincidio} falto={falto} />
        </div>
        <div className={styles.chartCard} style={{ flex: 1 }}>
          <span className={styles.chartTitle}>📊 Breakdown ventas</span>
          <div className={styles.breakdownList}>
            {[
              { label: 'Tortilla', val: totalTortilla, pct: totalVentas ? (totalTortilla / totalVentas) * 100 : 0, color: '#fbbf24' },
              { label: 'Productos', val: totalProductos, pct: totalVentas ? (totalProductos / totalVentas) * 100 : 0, color: '#818cf8' },
            ].map(b => (
              <div key={b.label} className={styles.breakdownItem}>
                <div className={styles.breakdownMeta}>
                  <span>{b.label}</span>
                  <span style={{ color: b.color }}>{fmtK(b.val)}</span>
                </div>
                <div className={styles.breakdownBar}>
                  <motion.div
                    className={styles.breakdownFill}
                    style={{ background: b.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className={styles.breakdownPct}>{b.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB — INVENTARIO
══════════════════════════════════════════════════════════════ */
function TabInventario({ isAdmin }) {
  const [productos, setProductos] = useState([]);
  const [harina, setHarina] = useState(0);
  const [draft, setDraft] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [nuevo, setNuevo] = useState({ nombre: '', precio: '' });
  const [showNuevo, setShowNuevo] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([safeJson('/api/productos?all=true', undefined, []), safeJson('/api/harina/stock', undefined, { stock: 0 })]).then(([prods, h]) => {
      setProductos(prods);
      const d = {};
      prods.forEach(p => {
        d[p.id] = { nombre: p.nombre, precio: p.precio, stock: p.stock, activo: p.activo };
      });
      setDraft(d);
      setHarina(h?.stock ?? 0);
    });

  useEffect(() => {
    load();
  }, []);

  const saveAll = async () => {
    setSaving(true);
    await Promise.all([
      ...Object.entries(draft).map(([id, data]) => fetch(`/api/productos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })),
      fetch('/api/harina/stock', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: harina }) }),
    ]);
    setSaving(false);
    setEditingId(null);
  };

  const addProducto = async () => {
    if (!nuevo.nombre || !nuevo.precio) return;
    const res = await fetch('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevo.nombre, precio: Number(nuevo.precio) }),
    });
    await load();
    setNuevo({ nombre: '', precio: '' });
    setShowNuevo(false);
  };

  const deleteProducto = async id => {
    if (!confirm('¿Eliminar producto?')) return;
    await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    await load();
  };

  const upd = (id, field, val) => setDraft(d => ({ ...d, [id]: { ...d[id], [field]: val } }));

  return (
    <div className={styles.tabContent}>
      {/* Harina */}
      <div className={styles.invSection}>
        <div className={styles.invSectionHeader}>
          <span className={styles.invSectionTitle}>🌾 Harina en inventario</span>
        </div>
        <div className={styles.harinaCard}>
          <span className={styles.harinaLabel}>Stock actual (bultos)</span>
          <input className={styles.harinaInput} type="number" value={harina} disabled={!isAdmin} onChange={e => setHarina(Number(e.target.value))} />
        </div>
      </div>

      {/* Productos */}
      <div className={styles.invSection}>
        <div className={styles.invSectionHeader}>
          <span className={styles.invSectionTitle}>📦 Productos</span>
          {isAdmin && (
            <motion.button whileTap={{ scale: 0.9 }} className={styles.addBtn} onClick={() => setShowNuevo(s => !s)}>
              <MdAdd /> Nuevo
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showNuevo && (
            <motion.div className={styles.nuevoForm} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <input className={styles.nuevoInput} placeholder="Nombre del producto" value={nuevo.nombre} onChange={e => setNuevo(n => ({ ...n, nombre: e.target.value }))} />
              <input className={styles.nuevoInput} type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo(n => ({ ...n, precio: e.target.value }))} />
              <button className={styles.nuevoSave} onClick={addProducto}>
                <MdCheck />
              </button>
              <button className={styles.nuevoCancel} onClick={() => setShowNuevo(false)}>
                <MdClose />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabla */}
        <div className={styles.invTableWrap}>
          <table className={styles.invTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Activo</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {Object.entries(draft).map(([id, p]) => {
                const editing = editingId === Number(id);
                return (
                  <tr key={id} className={editing ? styles.rowEditing : ''}>
                    <td>{editing ? <input className={styles.cellInput} value={p.nombre} onChange={e => upd(id, 'nombre', e.target.value)} /> : p.nombre}</td>
                    <td>
                      {editing ? <input className={styles.cellInput} type="number" value={p.precio} onChange={e => upd(id, 'precio', Number(e.target.value))} /> : `$${p.precio}`}
                    </td>
                    <td>{editing ? <input className={styles.cellInput} type="number" value={p.stock} onChange={e => upd(id, 'stock', Number(e.target.value))} /> : p.stock}</td>
                    <td>
                      <button
                        className={`${styles.toggleBtn} ${p.activo ? styles.toggleOn : styles.toggleOff}`}
                        disabled={!isAdmin}
                        onClick={() => isAdmin && upd(id, 'activo', !p.activo)}>
                        {p.activo ? '✅' : '❌'}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className={styles.rowActions}>
                        {editing ? (
                          <button className={styles.iconBtn} style={{ color: '#6ee7b7' }} onClick={saveAll}>
                            <MdSave />
                          </button>
                        ) : (
                          <button className={styles.iconBtn} onClick={() => setEditingId(Number(id))}>
                            <MdEdit />
                          </button>
                        )}
                        <button className={styles.iconBtn} style={{ color: '#f87171' }} onClick={() => deleteProducto(Number(id))}>
                          <MdDelete />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <motion.button whileTap={{ scale: 0.97 }} className={styles.saveAllBtn} onClick={saveAll} disabled={saving}>
            {saving ? 'Guardando...' : '✅ Guardar todos los cambios'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB — PROVEEDORES
══════════════════════════════════════════════════════════════ */
function TabProveedores({ isAdmin }) {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [nuevo, setNuevo] = useState({ nombre: '', productoId: '' });
  const [showNuevo, setShowNuevo] = useState(false);

  const load = () =>
    Promise.all([safeJson('/api/proveedores', undefined, []), safeJson('/api/productos?all=true', undefined, [])]).then(([provs, prods]) => {
      // flatten hijos
      const flat = [];
      provs.forEach(p => {
        flat.push(p);
        (p.hijos ?? []).forEach(h => flat.push(h));
      });
      setProveedores(flat);
      const d = {};
      flat.forEach(p => {
        d[p.id] = { nombre: p.nombre, activo: p.activo, productoId: p.productoId };
      });
      setDraft(d);
      setProductos(prods);
    });

  useEffect(() => {
    load();
  }, []);

  const save = async id => {
    await fetch(`/api/proveedores/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft[id]) });
    setEditingId(null);
    await load();
  };

  const del = async id => {
    if (!confirm('¿Eliminar proveedor?')) return;
    await fetch(`/api/proveedores/${id}`, { method: 'DELETE' });
    await load();
  };

  const add = async () => {
    if (!nuevo.nombre) return;
    await fetch('/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevo.nombre, productoId: nuevo.productoId ? Number(nuevo.productoId) : null }),
    });
    setNuevo({ nombre: '', productoId: '' });
    setShowNuevo(false);
    await load();
  };

  const upd = (id, field, val) => setDraft(d => ({ ...d, [id]: { ...d[id], [field]: val } }));

  return (
    <div className={styles.tabContent}>
      <div className={styles.invSection}>
        <div className={styles.invSectionHeader}>
          <span className={styles.invSectionTitle}>🚚 Proveedores</span>
          {isAdmin && (
            <motion.button whileTap={{ scale: 0.9 }} className={styles.addBtn} onClick={() => setShowNuevo(s => !s)}>
              <MdAdd /> Nuevo
            </motion.button>
          )}
        </div>

        <AnimatePresence>
          {showNuevo && (
            <motion.div className={styles.nuevoForm} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <input className={styles.nuevoInput} placeholder="Nombre proveedor" value={nuevo.nombre} onChange={e => setNuevo(n => ({ ...n, nombre: e.target.value }))} />
              <select className={styles.nuevoInput} value={nuevo.productoId} onChange={e => setNuevo(n => ({ ...n, productoId: e.target.value }))}>
                <option value="">🌾 Harina</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <button className={styles.nuevoSave} onClick={add}>
                <MdCheck />
              </button>
              <button className={styles.nuevoCancel} onClick={() => setShowNuevo(false)}>
                <MdClose />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.invTableWrap}>
          <table className={styles.invTable}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Surte</th>
                <th>Activo</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {proveedores.map(p => {
                const editing = editingId === p.id;
                const prodNombre = productos.find(pr => pr.id === (draft[p.id]?.productoId ?? p.productoId))?.nombre ?? '🌾 Harina';
                return (
                  <tr key={p.id} className={editing ? styles.rowEditing : ''}>
                    <td>
                      {editing ? <input className={styles.cellInput} value={draft[p.id]?.nombre ?? p.nombre} onChange={e => upd(p.id, 'nombre', e.target.value)} /> : p.nombre}
                    </td>
                    <td>
                      {editing ? (
                        <select className={styles.cellInput} value={draft[p.id]?.productoId ?? ''} onChange={e => upd(p.id, 'productoId', e.target.value || null)}>
                          <option value="">🌾 Harina</option>
                          {productos.map(pr => (
                            <option key={pr.id} value={pr.id}>
                              {pr.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        prodNombre
                      )}
                    </td>
                    <td>
                      <button
                        className={`${styles.toggleBtn} ${p.activo ? styles.toggleOn : styles.toggleOff}`}
                        disabled={!isAdmin}
                        onClick={() => isAdmin && upd(p.id, 'activo', !draft[p.id]?.activo)}>
                        {(draft[p.id]?.activo ?? p.activo) ? '✅' : '❌'}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className={styles.rowActions}>
                        {editing ? (
                          <button className={styles.iconBtn} style={{ color: '#6ee7b7' }} onClick={() => save(p.id)}>
                            <MdSave />
                          </button>
                        ) : (
                          <button className={styles.iconBtn} onClick={() => setEditingId(p.id)}>
                            <MdEdit />
                          </button>
                        )}
                        <button className={styles.iconBtn} style={{ color: '#f87171' }} onClick={() => del(p.id)}>
                          <MdDelete />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB — CONFIG
══════════════════════════════════════════════════════════════ */
function TabConfig({ isAdmin }) {
  const [config, setConfig] = useState({ precio_bulto_harina: '880', precio_kg_merma: '22' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    safeJson('/api/admin/config', undefined, {}).then(setConfig);
  }, []);

  const save = async () => {
    setSaving(true);
    await Promise.all(
      Object.entries(config).map(([key, value]) =>
        fetch('/api/admin/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) }),
      ),
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const configs = [
    { key: 'precio_bulto_harina', label: '🌾 Precio por bulto de harina', hint: 'Usado para calcular venta de tortilla', unit: '$ / bulto' },
    { key: 'precio_kg_merma', label: '♻️ Precio por kg de merma', hint: 'Costo por kilo de masa que se pierde', unit: '$ / kg' },
  ];

  return (
    <div className={styles.tabContent}>
      <div className={styles.configCard}>
        <span className={styles.configTitle}>⚙️ Configuración del negocio</span>
        <p className={styles.configHint}>Estos valores afectan los cálculos del corte diario.</p>

        {configs.map(c => (
          <div key={c.key} className={styles.configRow}>
            <div className={styles.configMeta}>
              <span className={styles.configLabel}>{c.label}</span>
              <span className={styles.configHintText}>{c.hint}</span>
            </div>
            <div className={styles.configInputWrap}>
              <input
                className={styles.configInput}
                type="number"
                value={config[c.key] ?? ''}
                disabled={!isAdmin}
                onChange={e => setConfig(cf => ({ ...cf, [c.key]: e.target.value }))}
              />
              <span className={styles.configUnit}>{c.unit}</span>
            </div>
          </div>
        ))}

        {isAdmin && (
          <motion.button whileTap={{ scale: 0.97 }} className={`${styles.saveAllBtn} ${saved ? styles.savedBtn : ''}`} onClick={save} disabled={saving}>
            {saved ? '✅ Guardado' : saving ? 'Guardando...' : '💾 Guardar configuración'}
          </motion.button>
        )}
        {!isAdmin && <p className={styles.lockMsg}>🔒 Ingresa el PIN de admin para editar</p>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'resumen', icon: <MdDashboard />, label: 'Resumen' },
  { id: 'analytics', icon: <MdBarChart />, label: 'Analytics' },
  { id: 'inventario', icon: <MdInventory />, label: 'Inventario' },
  { id: 'proveedores', icon: <MdLocalShipping />, label: 'Proveedores' },
  { id: 'config', icon: <MdSettings />, label: 'Config' },
];

export default function AdminPage() {
  const { isAdmin } = useAdminStore();
  const [tab, setTab] = useState('resumen');
  const [stats, setStats] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    safeJson('/api/admin/stats', undefined, null).then(setStats);
  }, []);

  const handleDelete = async id => {
    if (!confirm('¿Eliminar este corte? El inventario se restaurará.')) return;
    setDeletingId(id);
    await fetch(`/api/admin/corte/${id}`, { method: 'DELETE' });
    setStats(s => ({ ...s, ultimosCortes: s.ultimosCortes.filter(c => c.id !== id) }));
    setDeletingId(null);
  };

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>📊 Dashboard</h1>
            <p>Control total del negocio</p>
          </div>
          <PinSection />
        </header>

        {/* Tab nav */}
        <div className={styles.tabNav}>
          {TABS.map(t => (
            <motion.button key={t.id} whileTap={{ scale: 0.93 }} className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`} onClick={() => setTab(t.id)}>
              <span className={styles.tabIcon}>{t.icon}</span>
              <span className={styles.tabLabel}>{t.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {!stats ? (
            <motion.div key="loading" className={styles.loading} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Loader size={50} color="green" className="absolute top-1/2 left-1/2" />
            </motion.div>
          ) : (
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {tab === 'resumen' && <TabResumen stats={stats} isAdmin={isAdmin} onDelete={handleDelete} deletingId={deletingId} />}
              {tab === 'analytics' && <TabAnalytics stats={stats} />}
              {tab === 'inventario' && <TabInventario isAdmin={isAdmin} />}
              {tab === 'proveedores' && <TabProveedores isAdmin={isAdmin} />}
              {tab === 'config' && <TabConfig isAdmin={isAdmin} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </>
  );
}
