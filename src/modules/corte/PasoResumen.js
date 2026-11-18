'use client';

import { motion } from 'motion/react';
import { useShallow } from 'zustand/react/shallow';
import { PiPencilSimpleLineDuotone } from 'react-icons/pi';
import StatusBadge from '@/components/ui/StatusBadge';
import Glass from '@/components/ui/Glass';
import ProductoIcon from '@/components/ui/ProductoIcon';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { useCorteStore } from '@/stores/useCorteStore';
import { cuadre, fraccion, money } from '@/lib/format';
import { fila, lista, toque } from './anim';
import Celebracion from './Celebracion';

/** Paso 7: resultado en lenguaje simple. El número grande es lo que importa. */
export default function PasoResumen({ catalogo }) {
  const t = useCorteStore(useShallow(s => s.calcularTotales()));
  const dinero = useCorteStore(s => s.dineroEnCaja);
  const cantidades = useCorteStore(s => s.productos);
  const setPaso = useCorteStore(s => s.setPaso);
  const ir = n => () => setPaso(n); // pasos: 1 productos, 2 proveedores, 3 tandas, 4 merma, 5 gastos, 6 caja
  const c = cuadre(t.diferencia);
  const otrosGastos = t.totalGastos - t.totalMerma - t.totalProveedores;
  const vendidos = (catalogo?.productos ?? []).filter(p => (cantidades[p.id] ?? 0) > 0);

  return (
    <motion.div variants={lista} initial="hidden" animate="show" className="space-y-4">
      <motion.div variants={fila}>
        <Glass variant="strong" className="glass-liquid flex flex-col items-center gap-2 px-5 py-7 text-center" aria-live="polite">
          <Celebracion tone={c.tone} />
          <StatusBadge tone={c.tone} label={c.label} size="lg" />
          <p className={`num tone-${c.tone} text-6xl font-extrabold`} style={{ color: 'var(--tone)' }}>
            <AnimatedNumber value={Math.abs(Math.round(t.diferencia))} from={0} />
          </p>
          <p className="text-lg text-ink-soft">{c.detalle}</p>
        </Glass>
      </motion.div>

      <motion.div variants={fila}>
        <Bloque titulo="Lo que se vendió">
          <Linea texto="Tortilla" valor={t.ventaTortilla} nota={`${fraccion(t.totalBultos)} bultos`} onCorregir={ir(3)} />
          <Linea texto="Productos" valor={t.ventaProductos} onCorregir={ir(1)} />
          <Linea texto="Total vendido" valor={t.totalVentas} fuerte />
        </Bloque>
      </motion.div>

      {vendidos.length > 0 && (
        <motion.div variants={fila}>
          <Bloque titulo="Productos">
            {vendidos.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <ProductoIcon nombre={p.nombre} size="md" />
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {p.nombre} <span className="text-ink-soft">× {cantidades[p.id]}</span>
                </span>
                <span className="num text-xl font-extrabold">{money(p.precio * cantidades[p.id])}</span>
              </div>
            ))}
          </Bloque>
        </motion.div>
      )}

      <motion.div variants={fila}>
        <Bloque titulo="Lo que se gastó">
          <Linea texto="Tortilla que se tiró (merma)" valor={t.totalMerma} onCorregir={ir(4)} />
          <Linea texto="Pagos a proveedores" valor={t.totalProveedores} onCorregir={ir(2)} />
          <Linea texto="Otros gastos" valor={otrosGastos} onCorregir={ir(5)} />
          <Linea texto="Total gastado" valor={t.totalGastos} fuerte />
        </Bloque>
      </motion.div>

      <motion.div variants={fila}>
        <Bloque titulo="En la caja">
          <Linea texto="Debería haber" valor={t.deberiaHaber} fuerte />
          <Linea texto="Hay" valor={dinero} fuerte onCorregir={ir(6)} />
        </Bloque>
      </motion.div>
    </motion.div>
  );
}

/** Bloque de renglones. Los renglones NO son tarjetas: solo filas con divisor. */
function Bloque({ titulo, children }) {
  return (
    <Glass as="section" className="px-5 py-4">
      <h2 className="mb-1 text-lg font-extrabold">{titulo}</h2>
      <dl className="divide-y divide-ink/10">{children}</dl>
    </Glass>
  );
}

/** Renglón del resumen. Con `onCorregir` muestra un botón (≥48px) que lleva directo a ese paso. */
function Linea({ texto, valor, nota, fuerte, onCorregir }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className={`min-w-0 flex-1 ${fuerte ? 'font-bold' : 'text-ink-soft'}`}>
        {texto}
        {nota && <span className="ml-2 text-sm">({nota})</span>}
      </dt>
      <dd className={`num text-xl ${fuerte ? 'font-extrabold' : 'font-semibold'}`}>
        <AnimatedNumber value={valor} from={0} />
      </dd>
      {onCorregir && (
        <motion.button type="button" whileTap={toque} onClick={onCorregir} aria-label={`Corregir: ${texto}`} className="btn btn-ghost h-12 min-h-12 shrink-0 gap-1.5 px-3 text-base font-bold text-ink">
          <PiPencilSimpleLineDuotone className="size-6" aria-hidden />
          Corregir
        </motion.button>
      )}
    </div>
  );
}
