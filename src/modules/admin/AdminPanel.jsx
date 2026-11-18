'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  PiSquaresFourDuotone,
  PiReceiptDuotone,
  PiChartBarDuotone,
  PiPackageDuotone,
  PiTruckDuotone,
  PiGrainsDuotone,
  PiGearSixDuotone,
  PiSignOutBold,
  PiCaretRightBold,
} from 'react-icons/pi';
import Page from '@/components/ui/Page';
import { useAdminStore } from '@/stores/useAdminStore';
import Async from './Async';
import Flash from './Flash';
import { useApi } from './useApi';
import { useFlash } from './useFlash';
import ResumenTab from './ResumenTab';
import CortesTab from './CortesTab';
import AnalyticsTab from './AnalyticsTab';
import ProductosTab from './ProductosTab';
import ProveedoresTab from './ProveedoresTab';
import HarinaTab from './HarinaTab';
import ConfigTab from './ConfigTab';

// Para agregar una sección: súmala aquí y renderízala abajo en <Seccion />.
const SECCIONES = [
  { id: 'resumen', label: 'Resumen', Icon: PiSquaresFourDuotone },
  { id: 'cortes', label: 'Cuentas', Icon: PiReceiptDuotone },
  { id: 'analytics', label: 'Números', Icon: PiChartBarDuotone },
  { id: 'productos', label: 'Productos', Icon: PiPackageDuotone },
  { id: 'proveedores', label: 'Proveedores', Icon: PiTruckDuotone },
  { id: 'harina', label: 'Harina', Icon: PiGrainsDuotone },
  { id: 'ajustes', label: 'Ajustes', Icon: PiGearSixDuotone },
];

/** Las secciones que dependen de las estadísticas comparten UNA sola consulta. */
function Seccion({ id, stats, flash, ir }) {
  switch (id) {
    case 'resumen':
      return <Async query={stats}>{s => <ResumenTab stats={s} onGo={ir} />}</Async>;
    case 'cortes':
      return <Async query={stats}>{s => <CortesTab stats={s} onChanged={stats.reload} flash={flash} />}</Async>;
    case 'analytics':
      return <Async query={stats}>{s => <AnalyticsTab stats={s} />}</Async>;
    case 'productos':
      return <ProductosTab flash={flash} />;
    case 'proveedores':
      return <ProveedoresTab flash={flash} />;
    case 'harina':
      return <HarinaTab flash={flash} />;
    default:
      return <ConfigTab flash={flash} />;
  }
}

/** Panel del dueño: pestañas grandes que se desplazan + sección activa + cerrar sesión. */
export default function AdminPanel() {
  const logout = useAdminStore(s => s.logout);
  const [id, setId] = useState('resumen');
  const [msg, flash] = useFlash();
  const stats = useApi('/api/admin/stats');
  const lista = useRef(null);
  const [mas, setMas] = useState(true); // ¿hay más pestañas a la derecha?

  useEffect(() => {
    const el = lista.current;
    if (el) setMas(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const ir = nuevo => {
    setId(nuevo);
    // Centra la pestaña elegida dentro de la barra desplazable
    lista.current?.querySelector(`[data-id="${nuevo}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  };

  return (
    <Page title="Administración" subtitle="Solo para el dueño." back="/" dock={false}>
      {/* Pestañas: daisyUI `tabs` en una barra de cristal que se desplaza de lado */}
      <div className="sticky top-2 z-30 mb-5">
        <div
          ref={lista}
          role="tablist"
          aria-label="Secciones"
          onScroll={e => {
            const el = e.currentTarget;
            setMas(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
          }}
          className="tabs glass no-scrollbar flex-nowrap gap-1 overflow-x-auto p-1.5">
          {SECCIONES.map(({ id: sid, label, Icon }) => {
            const activa = sid === id;
            return (
              <motion.button
                key={sid}
                whileTap={{ scale: 0.94 }}
                type="button"
                role="tab"
                data-id={sid}
                aria-selected={activa}
                onClick={() => ir(sid)}
                className="relative flex h-12 shrink-0 items-center gap-2 rounded-2xl px-4 text-lg font-bold whitespace-nowrap">
                {activa && (
                  <motion.span
                    layoutId="admin-tab"
                    className="btn-liquid absolute inset-0 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }}
                  />
                )}
                <motion.span
                  className="relative"
                  animate={activa ? { y: [0, -4, 0], scale: [1, 1.15, 1] } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                  <Icon className={`size-6 ${activa ? 'text-[color:var(--on-nopal)]' : 'text-ink-soft'}`} aria-hidden />
                </motion.span>
                <span className={`relative ${activa ? 'text-[color:var(--on-nopal)]' : 'text-ink-soft'}`}>{label}</span>
              </motion.button>
            );
          })}
        </div>
        {/* Pista: degradado + flecha cuando hay más pestañas a la derecha */}
        {mas && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 flex w-14 items-center justify-end rounded-r-2xl bg-linear-to-l from-masa via-masa/80 to-transparent pr-2 text-ink-soft">
            <PiCaretRightBold className="size-5" />
          </span>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={id}
          role="tabpanel"
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}>
          <Seccion id={id} stats={stats} flash={flash} ir={ir} />
        </motion.div>
      </AnimatePresence>

      <button type="button" onClick={() => fetch('/api/admin/auth', { method: 'DELETE' }).finally(logout)} className="btn btn-big btn-glass mt-8 w-full">
        <PiSignOutBold className="size-6" aria-hidden />
        Cerrar sesión de admin
      </button>

      <Flash msg={msg} />
    </Page>
  );
}
