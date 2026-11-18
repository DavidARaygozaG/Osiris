'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  PiGearSixDuotone,
  PiCalculatorDuotone,
  PiReceiptDuotone,
  PiPencilSimpleLineDuotone,
  PiWarningFill,
  PiArrowClockwiseBold,
  PiCaretRightBold,
} from 'react-icons/pi';
import { useCorteStore } from '@/stores/useCorteStore';
import Page from '@/components/ui/Page';
import Glass from '@/components/ui/Glass';
import StatusBadge from '@/components/ui/StatusBadge';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import LiquidGauge from '@/components/ui/LiquidGauge';
import ThemeToggle from '@/components/ui/ThemeToggle';
import ProductoIcon from '@/components/ui/ProductoIcon';
import HarinaSheet from '@/components/HarinaSheet';
import { money, fechaLarga, saludo, estadoDe } from '@/lib/format';
import { diaMX } from '@/lib/fecha';

const pctTxt = v => `${Math.round(v)}%`;

// Entrada orquestada: el padre escalona a los hijos (una sola vez por pantalla)
const contenedor = { show: { transition: { staggerChildren: 0.08 } } };
const item = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

export default function HomeActions() {
  const router = useRouter();
  const setModo = useCorteStore(s => s.setModo);
  const [harinaOpen, setHarinaOpen] = useState(false);
  const [data, setData] = useState({ status: 'cargando', corteHoy: null, ventasMes: 0, meta: 50000 });
  const [intento, setIntento] = useState(0);

  const reintentar = () => {
    setData(d => ({ ...d, status: 'cargando' }));
    setIntento(n => n + 1);
  };

  useEffect(() => {
    let vivo = true;
    Promise.all([
      fetch('/api/historial').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/admin/config')
        .then(r => (r.ok ? r.json() : {}))
        .catch(() => ({})),
    ])
      .then(([cortes, cfg]) => {
        if (!vivo) return;
        const hoy = diaMX(); // mismo criterio que el servidor: día de Ciudad de México
        const mes = hoy.slice(0, 7);
        const cs = Array.isArray(cortes) ? cortes : [];
        const ventasMes = cs
          .filter(c => diaMX(c.fecha).startsWith(mes))
          .reduce((s, c) => s + (c.totalVentas || 0), 0);
        setData({
          status: 'ok',
          corteHoy: cs.find(c => diaMX(c.fecha) === hoy) ?? null,
          ventasMes,
          meta: Number(cfg?.meta_mensual) || 50000,
        });
      })
      .catch(() => vivo && setData(d => ({ ...d, status: 'error' })));
    return () => {
      vivo = false;
    };
  }, [intento]);

  const irACorte = modo => {
    setModo(modo);
    router.push('/corte');
  };

  const { status, corteHoy, ventasMes, meta } = data;
  const pct = Math.min(100, Math.round((ventasMes / meta) * 100));
  const faltan = Math.max(0, meta - ventasMes);

  return (
    <>
      <Page
        title={<span suppressHydrationWarning>{saludo()}</span>}
        subtitle={
          <span className="inline-block first-letter:uppercase" suppressHydrationWarning>
            {fechaLarga()}
          </span>
        }
        action={
          <div className="flex gap-2">
            <ThemeToggle />
            <Link href="/admin" aria-label="Administración" className="btn btn-circle btn-glass size-12 min-h-12">
              <PiGearSixDuotone className="size-6" />
            </Link>
          </div>
        }>
        <motion.div variants={contenedor} initial="hidden" animate="show" className="flex flex-col gap-4">
          {/* ── Hoja principal: meta del mes (medidor líquido) + estado de hoy ── */}
          <motion.div variants={item}>
            <Glass as="section" aria-label="Resumen" className="glass-liquid flex flex-col gap-5 p-5">
              {status === 'cargando' && (
                <div className="flex items-center gap-4" aria-busy="true">
                  <div className="skeleton size-24 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="skeleton h-4 w-24" />
                    <div className="skeleton h-9 w-40" />
                    <div className="skeleton h-4 w-32" />
                  </div>
                </div>
              )}
              {status === 'error' && (
                <p role="alert" className="tone-bad flex items-center gap-2 font-semibold text-[color:var(--tone)]">
                  <PiWarningFill className="size-6 shrink-0" aria-hidden />
                  No pudimos revisar el día. Revisa tu conexión.
                </p>
              )}
              {status === 'ok' && (
                <>
                  <div className="flex items-center gap-4">
                    <LiquidGauge value={pct} size={104} label={`Meta del mes al ${pct} por ciento`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-ink-soft">Llevas este mes</p>
                      <p className="num text-4xl font-extrabold leading-tight">
                        <AnimatedNumber value={ventasMes} from={0} />
                      </p>
                      <p className="text-ink-soft">
                        <span className="num font-bold text-ink">
                          <AnimatedNumber value={pct} from={0} format={pctTxt} />
                        </span>{' '}
                        de {money(meta)}
                        {faltan > 0 && <span className="block text-sm">Te faltan {money(faltan)}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
                    {corteHoy ? (
                      <>
                        <p className="text-lg font-bold leading-tight">La cuenta de hoy está hecha</p>
                        <StatusBadge estado={estadoDe(corteHoy)} size="lg" />
                      </>
                    ) : (
                      <p className="flex items-center gap-2 text-lg font-bold leading-tight">
                        <span className="pulse-ring size-3 shrink-0 rounded-full bg-maiz" aria-hidden />
                        Falta hacer la cuenta de hoy
                      </p>
                    )}
                  </div>
                </>
              )}
            </Glass>
          </motion.div>

          {/* ── Acción principal (verde). Si ya hay cuenta, lleva a verla. ── */}
          <motion.div variants={item}>
            {status === 'cargando' ? (
              <div className="skeleton h-32 w-full rounded-2xl" aria-busy="true" role="status" aria-label="Revisando tu día" />
            ) : status === 'error' ? (
              <button type="button" onClick={reintentar} className="btn btn-big btn-cafe h-32 w-full flex-col gap-1 text-xl">
                <PiArrowClockwiseBold className="size-9" aria-hidden />
                Intentar otra vez
              </button>
            ) : corteHoy ? (
              <Link
                href="/historial"
                className="btn btn-big btn-liquid h-24 w-full justify-between gap-3 px-6 text-xl">
                <span className="flex min-w-0 items-center gap-4">
                  <PiReceiptDuotone className="size-11 shrink-0 drop-shadow-[0_3px_4px_rgb(0_0_0/0.25)]" aria-hidden />
                  <span className="min-w-0 text-left leading-tight">
                    Ver la cuenta de hoy
                    <span className="block text-sm font-semibold opacity-80">Ya está guardada</span>
                  </span>
                </span>
                <PiCaretRightBold className="size-5 shrink-0 opacity-80" aria-hidden />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => irACorte('corte')}
                className="btn btn-big btn-liquid h-32 w-full justify-start gap-4 px-5 text-left text-2xl">
                <PiCalculatorDuotone className="float size-12 shrink-0 drop-shadow-[0_3px_4px_rgb(0_0_0/0.25)]" aria-hidden />
                <span className="flex-1 leading-tight">
                  Hacer cuenta del día
                  <span className="block text-base font-semibold opacity-80">Cierra y guarda el día</span>
                </span>
                <PiCaretRightBold className="size-6 opacity-80" aria-hidden />
              </button>
            )}
          </motion.div>

          {/* ── Acciones secundarias ── */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => irACorte('calcular')}
              className="btn btn-big btn-glass h-24 justify-start gap-3 px-3 text-left text-base leading-tight">
              <PiPencilSimpleLineDuotone className="size-9 shrink-0 text-cafe drop-shadow-[0_3px_4px_rgb(var(--shadow-rgb)/0.3)]" aria-hidden />
              <span>
                Practicar cuenta
                <span className="block text-sm font-medium text-ink-soft">No se guarda</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setHarinaOpen(true)}
              className="btn btn-big btn-glass h-24 justify-start gap-3 px-3 text-left text-base leading-tight">
              <ProductoIcon nombre="harina" size="md" />
              <span>
                Llegó harina
                <span className="block text-sm font-medium text-ink-soft">Anotar bultos</span>
              </span>
            </button>
          </motion.div>
        </motion.div>
      </Page>
      <HarinaSheet open={harinaOpen} onClose={() => setHarinaOpen(false)} />
    </>
  );
}
