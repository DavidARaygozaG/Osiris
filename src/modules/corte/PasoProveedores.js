'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PiTruckDuotone, PiCheckCircleFill } from 'react-icons/pi';
import QtyStepper from '@/components/ui/QtyStepper';
import MoneyField from '@/components/ui/MoneyField';
import EmptyState from '@/components/ui/EmptyState';
import { useCorteStore } from '@/stores/useCorteStore';
import Cargando from './Cargando';
import ErrorCatalogo from './ErrorCatalogo';
import { entraSale, fila, lista } from './anim';

const vacio = { paso: false, dejo: 0, cobro: 0 };

/**
 * Paso 2: ¿quién pasó? Un botón grande "Pasó / No pasó" por proveedor.
 * Al marcarlo aparece lo que dejó y lo que se le pagó (el pago es uno solo, en el padre).
 */
export default function PasoProveedores({ catalogo }) {
  const data = useCorteStore(s => s.proveedores);
  const setProveedor = useCorteStore(s => s.setProveedor);
  const { proveedores, estado, reintentar } = catalogo;

  if (estado === 'cargando') return <Cargando filas={3} />;
  if (estado === 'error') return <ErrorCatalogo que="los proveedores" onReintentar={reintentar} />;
  if (proveedores.length === 0)
    return <EmptyState icon={PiTruckDuotone} title="No hay proveedores registrados" text="No hay nada que anotar aquí. Toca Siguiente para continuar." />;

  const de = id => ({ ...vacio, ...data[id] });

  // Si el proveedor tiene "hijos" (ej. Arroz dentro de Salsas), pasan juntos.
  const marcar = (p, paso) => {
    setProveedor(p.id, { paso });
    p.hijos?.forEach(h => setProveedor(h.id, { paso }));
  };

  return (
    <motion.ul variants={lista} initial="hidden" animate="show" className="space-y-4">
      {proveedores.map(p => {
        const actual = de(p.id);
        return (
          <motion.li key={p.id} layout="position" variants={fila} className="space-y-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              aria-pressed={actual.paso}
              onClick={() => marcar(p, !actual.paso)}
              className="glass-row flex min-h-20 w-full items-center justify-between gap-3 px-5 py-3 text-left">
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold">{p.nombre}</span>
                {p.hijos?.length > 0 && <span className="block truncate text-sm text-ink-soft">También: {p.hijos.map(h => h.nombre).join(', ')}</span>}
              </span>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 font-bold ${actual.paso ? 'tone-ok' : 'bg-ink/10 text-ink-soft'}`}
                style={actual.paso ? { background: 'var(--tone-bg)', color: 'var(--tone)' } : undefined}>
                {actual.paso && <PiCheckCircleFill className="size-5" aria-hidden />}
                {actual.paso ? 'Pasó' : 'No pasó'}
              </span>
            </motion.button>

            <AnimatePresence initial={false}>
              {actual.paso && (
                <motion.div key="detalle" {...entraSale} className="space-y-2 px-1">
                  <Dejo nombre={p.nombre} valor={actual.dejo} onChange={v => setProveedor(p.id, { dejo: v })} />
                  {p.hijos?.map(h => (
                    <Dejo key={h.id} nombre={h.nombre} valor={de(h.id).dejo} onChange={v => setProveedor(h.id, { dejo: v })} />
                  ))}
                  <MoneyField label="Se le pagó" hint={`A ${p.nombre}`} value={actual.cobro} decimals onChange={v => setProveedor(p.id, { cobro: v })} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/** Fila "Dejó X" con − / +. Sin tarjeta propia: vive dentro del bloque del proveedor. */
function Dejo({ nombre, valor, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="min-w-0 truncate font-semibold">Dejó {nombre}</span>
      <QtyStepper value={valor} onChange={onChange} label={nombre} />
    </div>
  );
}
