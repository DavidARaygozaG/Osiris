'use client';

import { motion } from 'motion/react';
import { PiTrendUpDuotone, PiWarningDuotone, PiTrophyDuotone, PiReceiptDuotone, PiCaretRightBold, PiCalendarXDuotone } from 'react-icons/pi';
import Glass from '@/components/ui/Glass';
import EmptyState from '@/components/ui/EmptyState';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import LiquidGauge from '@/components/ui/LiquidGauge';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { money, fechaCorta } from '@/lib/format';
import { useApi } from './useApi';
import Kpi, { entero } from './Kpi';
import { VentasBars } from './Charts';

const pctTxt = v => `${Math.round(v)}%`;

/** Resumen del mes: hoja líquida (con medidor de la meta si existe) + 3 cifras + ventas de los últimos 14 cortes. */
export default function ResumenTab({ stats, onGo }) {
  const cfg = useApi('/api/admin/config'); // aquí vive meta_mensual
  if (!stats.grafica.length) {
    return <EmptyState icon={PiCalendarXDuotone} title="Aún no hay cortes" text="Cuando se haga el primer corte, aquí verás el resumen del mes." />;
  }
  const ultimos = stats.grafica.slice(-14);
  const meta = cfg.status === 'ok' ? Number(cfg.data?.meta_mensual) || 0 : 0;
  const pct = meta ? Math.min(100, Math.round((stats.totalVentasMes / meta) * 100)) : 0;

  return (
    <Stagger className="grid gap-4">
      <StaggerItem>
        <Glass as="section" aria-label="Ventas del mes" className="glass-liquid flex items-center gap-4 p-5">
          {meta > 0 && <LiquidGauge value={pct} size={104} label={`Meta del mes al ${pct} por ciento`} />}
          <div className="min-w-0 flex-1">
            <p className="text-ink-soft">Ventas del mes</p>
            <p className="num text-4xl font-extrabold leading-tight">
              <AnimatedNumber value={stats.totalVentasMes} from={0} />
            </p>
            <p className="text-ink-soft">
              {meta > 0 ? (
                <>
                  <span className="num font-bold text-ink">
                    <AnimatedNumber value={pct} from={0} format={pctTxt} />
                  </span>{' '}
                  de {money(meta)}
                </>
              ) : (
                `${stats.totalCortesMes} cortes este mes`
              )}
            </p>
          </div>
        </Glass>
      </StaggerItem>

      <StaggerItem className="grid grid-cols-2 gap-3">
        <Kpi icon={PiTrendUpDuotone} label="Promedio diario" value={stats.promedioDiario} sub="por corte" />
        <Kpi
          icon={PiWarningDuotone}
          label="Días que faltó"
          value={stats.diasConFalta}
          format={entero}
          sub={`de ${stats.totalCortesMes} cortes`}
          tone={stats.diasConFalta ? 'bad' : 'ok'}
        />
        <Kpi
          icon={PiTrophyDuotone}
          label="Mejor día"
          value={stats.mejorDia ? stats.mejorDia.ventas : '—'}
          sub={stats.mejorDia ? fechaCorta(stats.mejorDia.fecha) : 'Sin datos'}
        />
        <Kpi icon={PiReceiptDuotone} label="Cortes del mes" value={stats.totalCortesMes} format={entero} />
      </StaggerItem>

      <StaggerItem>
        <Glass as="section" className="p-4">
          <h2 className="mb-3 text-xl font-extrabold">Últimos {ultimos.length} días</h2>
          <VentasBars data={ultimos} />
        </Glass>
      </StaggerItem>

      <StaggerItem>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => onGo('cortes')}
          className="btn btn-big btn-glass w-full justify-between">
          <span className="flex items-center gap-2">
            <PiReceiptDuotone className="size-6 text-cafe" aria-hidden />
            Ver y borrar cortes
          </span>
          <PiCaretRightBold className="size-5 text-ink-soft" aria-hidden />
        </motion.button>
      </StaggerItem>
    </Stagger>
  );
}
