'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { PiCalendarBlankDuotone, PiCloudSlashDuotone } from 'react-icons/pi';
import Page from '@/components/ui/Page';
import Glass from '@/components/ui/Glass';
import Sheet from '@/components/ui/Sheet';
import EmptyState from '@/components/ui/EmptyState';
import { money } from '@/lib/format';
import { claveDia, useHistorialStats } from '@/hooks/useHistorialStats';
import Calendario, { nombreMes } from '@/modules/historial/Calendario';
import DetalleCorte from '@/modules/historial/DetalleCorte';
import InsightsCard from '@/modules/historial/InsightsCard';
import MetaMensual from '@/modules/historial/MetaMensual';
import ShareCorte from '@/modules/historial/ShareCorte';

// Entrada orquestada: los bloques aparecen uno tras otro, con blur como en el Inicio
const lista = { show: { transition: { staggerChildren: 0.08 } } };
const bloque = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

const fechaDe = (key, opts) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', opts);
};

export default function HistorialPage() {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());
  const [cortes, setCortes] = useState(null); // null = cargando
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [elegido, setElegido] = useState(null); // { key, corte }

  // Cargar historial. `intento` permite reintentar sin recargar la página.
  useEffect(() => {
    let vivo = true;
    fetch('/api/historial')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => vivo && setCortes(d))
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
  }, [intento]);

  const reintentar = () => {
    setError(false);
    setCortes(null);
    setIntento(n => n + 1);
  };

  const corteMap = useMemo(() => Object.fromEntries((cortes ?? []).map(c => [claveDia(c), c])), [cortes]);
  const stats = useHistorialStats(cortes, year, month);

  const esMesActual = year === hoy.getFullYear() && month === hoy.getMonth();
  const cambiarMes = delta => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  // Frase de resumen del mes
  const resumen = stats.totalCortes
    ? `En ${nombreMes(year, month)} hiciste ${stats.totalCortes} ${stats.totalCortes === 1 ? 'cuenta' : 'cuentas'} y vendiste ${money(stats.totalVentas)}. ` +
      (stats.cuadraron === stats.totalCortes
        ? 'Todas cuadraron.'
        : `Cuadraron ${stats.cuadraron}${stats.faltaron ? `, faltó dinero en ${stats.faltaron}` : ''}${stats.sobraron ? `, sobró en ${stats.sobraron}` : ''}.`)
    : null;

  return (
    <Page title="Días" subtitle="Toca un día para ver su cuenta">
      {error ? (
        <EmptyState
          icon={PiCloudSlashDuotone}
          title="No se pudieron cargar los días"
          text="Parece que no hay internet. Revisa tu conexión y vuelve a intentar."
          action={
            <button type="button" onClick={reintentar} className="btn btn-big btn-liquid mt-2 px-8">
              Intentar otra vez
            </button>
          }
        />
      ) : cortes === null ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando días">
          <div className="skeleton h-20 w-full rounded-2xl" />
          <div className="skeleton h-44 w-full rounded-2xl" />
          <div className="skeleton h-96 w-full rounded-2xl" />
        </div>
      ) : (
        <motion.div className="flex flex-col gap-4" variants={lista} initial="hidden" animate="show">
          <motion.div variants={bloque}>
            <Glass variant="strong" className="p-5">
              <p className="text-lg font-semibold leading-snug">
                {resumen ?? `Todavía no hay cuentas en ${nombreMes(year, month)}.`}
              </p>
            </Glass>
          </motion.div>

          <motion.div variants={bloque}>
            <MetaMensual totalVentas={stats.totalVentas} year={year} month={month} />
          </motion.div>

          <motion.div variants={bloque}>
            <Calendario
              year={year}
              month={month}
              corteMap={corteMap}
              puedeAvanzar={!esMesActual}
              onPrev={() => cambiarMes(-1)}
              onNext={() => cambiarMes(1)}
              onSelect={(key, corte) => setElegido({ key, corte })}
            />
          </motion.div>

          {stats.totalCortes === 0 ? (
            <motion.div variants={bloque}>
              <EmptyState
                icon={PiCalendarBlankDuotone}
                title="Este mes no tiene cuentas"
                text="Cuando cierres un día aparecerá aquí. Puedes ver otro mes con las flechas."
                action={
                  <Link href="/" className="btn btn-big btn-liquid mt-2 px-8">
                    Ir al inicio
                  </Link>
                }
              />
            </motion.div>
          ) : (
            <motion.div variants={bloque}>
              <InsightsCard stats={stats} />
            </motion.div>
          )}
        </motion.div>
      )}

      <Sheet
        open={!!elegido}
        onClose={() => setElegido(null)}
        title={elegido ? fechaDe(elegido.key, { weekday: 'long', day: 'numeric', month: 'long' }) : ''}
        footer={elegido && <ShareCorte corte={elegido.corte} fecha={fechaDe(elegido.key, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />}>
        {elegido && <DetalleCorte corte={elegido.corte} />}
      </Sheet>
    </Page>
  );
}
