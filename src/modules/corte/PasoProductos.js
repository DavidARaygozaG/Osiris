'use client';

import { motion } from 'motion/react';
import { PiPackageDuotone } from 'react-icons/pi';
import QtyStepper from '@/components/ui/QtyStepper';
import EmptyState from '@/components/ui/EmptyState';
import ProductoIcon from '@/components/ui/ProductoIcon';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useCorteStore } from '@/stores/useCorteStore';
import { money } from '@/lib/format';
import Cargando from './Cargando';
import ErrorCatalogo from './ErrorCatalogo';
import { fila, lista } from './anim';

/** Paso 1: cuántas piezas salieron de cada producto (QtyStepper de 1 en 1). */
export default function PasoProductos({ catalogo }) {
  const cantidades = useCorteStore(s => s.productos);
  const setCantidad = useCorteStore(s => s.setProductoCantidad);
  const { productos, estado, reintentar } = catalogo;

  if (estado === 'cargando') return <Cargando />;
  if (estado === 'error') return <ErrorCatalogo que="los productos" onReintentar={reintentar} />;
  if (productos.length === 0)
    return (
      <EmptyState
        icon={PiPackageDuotone}
        title="Todavía no hay productos"
        text="Pídele al dueño que agregue los productos en la sección Productos. Mientras tanto, toca Siguiente."
      />
    );

  return (
    <motion.ul variants={lista} initial="hidden" animate="show" className="space-y-3">
      {productos.map(p => {
        const cantidad = cantidades[p.id] ?? 0;
        return (
          <motion.li key={p.id} layout="position" variants={fila} className="glass-row flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <ProductoIcon nombre={p.nombre} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold">{p.nombre}</p>
                <p className="num text-sm text-ink-soft">{money(p.precio)} c/u</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="num text-2xl font-extrabold">
                {cantidad > 0 ? <AnimatedNumber value={p.precio * cantidad} from={0} duration={0.5} /> : <span className="text-ink-soft">$0</span>}
              </p>
              <QtyStepper value={cantidad} onChange={v => setCantidad(p.id, v)} label={p.nombre} />
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
