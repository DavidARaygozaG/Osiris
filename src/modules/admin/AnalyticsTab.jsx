'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PiCoinsDuotone, PiTrendDownDuotone, PiSparkleDuotone, PiReceiptDuotone, PiCalendarXDuotone } from 'react-icons/pi';
import Glass from '@/components/ui/Glass';
import EmptyState from '@/components/ui/EmptyState';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { estadoDe } from '@/lib/format';
import Kpi, { entero } from './Kpi';
import { VentasBars, CuadreBar, ReparteBars } from './Charts';

const PERIODOS = [7, 15, 30, 60];

/** Análisis de los últimos N cortes (un corte por día ≈ N días). Todo sale de /api/admin/stats. */
export default function AnalyticsTab({ stats }) {
  const [n, setN] = useState(30);

  // useMemo: solo recalcula al cambiar el periodo o los datos
  const r = useMemo(() => {
    const cortes = stats.ultimosCortes.slice(0, n).reverse(); // el API manda el más nuevo primero
    const suma = k => cortes.reduce((a, c) => a + (c[k] ?? 0), 0);
    const ventas = suma('totalVentas');
    const gastos = suma('totalGastos');
    return {
      cortes,
      ventas,
      gastos,
      neto: ventas - gastos,
      tortilla: suma('ventaTortilla'),
      productos: suma('ventaProductos'),
      cuadro: cortes.filter(c => estadoDe(c) === 'cuadro').length,
      falto: cortes.filter(c => estadoDe(c) === 'falto').length,
      sobro: cortes.filter(c => estadoDe(c) === 'sobro').length,
    };
  }, [stats, n]);

  if (!stats.ultimosCortes.length) {
    return <EmptyState icon={PiCalendarXDuotone} title="Aún no hay datos" text="Las gráficas aparecen cuando haya cortes guardados." />;
  }

  return (
    <Stagger className="grid gap-4">
      {/* Selector de periodo: la gota verde se desliza de una opción a otra */}
      <StaggerItem>
        <div role="group" aria-label="Cuántos cortes ver" className="glass flex w-full gap-1 p-1.5">
          {PERIODOS.map(p => (
            <motion.button
              key={p}
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-pressed={n === p}
              onClick={() => setN(p)}
              className="relative h-12 flex-1 rounded-xl text-lg font-bold">
              {n === p && (
                <motion.span
                  layoutId="periodo-gota"
                  className="btn-liquid absolute inset-0 rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }}
                />
              )}
              <span className={`relative ${n === p ? 'text-[color:var(--on-nopal)]' : 'text-ink'}`}>{p}</span>
            </motion.button>
          ))}
        </div>
        <p className="mt-2 px-1 text-ink-soft">Últimos {r.cortes.length} cortes</p>
      </StaggerItem>

      <StaggerItem className="grid grid-cols-2 gap-3">
        <Kpi icon={PiCoinsDuotone} label="Ventas" value={r.ventas} />
        <Kpi icon={PiTrendDownDuotone} label="Gastos" value={r.gastos} />
        <Kpi icon={PiSparkleDuotone} label="Quedó" value={r.neto} tone={r.neto >= 0 ? 'ok' : 'bad'} sub="ventas menos gastos" />
        <Kpi icon={PiReceiptDuotone} label="Cortes" value={r.cortes.length} format={entero} />
      </StaggerItem>

      <StaggerItem>
        <Glass as="section" className="glass-liquid p-4">
          <h2 className="mb-3 text-xl font-extrabold">Ventas por día</h2>
          <VentasBars key={n} data={r.cortes.map(c => ({ fecha: c.fecha, ventas: c.totalVentas, estado: estadoDe(c) }))} />
        </Glass>
      </StaggerItem>

      <StaggerItem>
        <Glass as="section" className="p-4">
          <h2 className="mb-3 text-xl font-extrabold">¿Cuadró la caja?</h2>
          <CuadreBar key={n} cuadro={r.cuadro} falto={r.falto} sobro={r.sobro} />
        </Glass>
      </StaggerItem>

      <StaggerItem>
        <Glass as="section" className="p-4">
          <h2 className="mb-3 text-xl font-extrabold">¿De dónde viene la venta?</h2>
          <ReparteBars
            key={n}
            items={[
              { label: 'Tortilla', value: r.tortilla, className: 'bg-nopal' },
              { label: 'Productos', value: r.productos, className: 'bg-cafe' },
            ]}
          />
        </Glass>
      </StaggerItem>
    </Stagger>
  );
}
