'use client';

import { motion } from 'motion/react';
import StatusBadge from '@/components/ui/StatusBadge';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import ProductoIcon from '@/components/ui/ProductoIcon';
import { money, fraccion, cuadre } from '@/lib/format';
import { PiCheckBold, PiMinusBold } from 'react-icons/pi';

// Contenido escalonado con blur (igual que el Inicio)
const lista = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } } };
const item = {
  hidden: { opacity: 0, y: 14, filter: 'blur(5px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

/** Fila simple "etiqueta ........ cifra" (la cifra rueda desde 0) */
function Fila({ k, v }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="num text-xl font-extrabold">
        <AnimatedNumber value={v} from={0} />
      </dd>
    </div>
  );
}

/** Bloque con título; se separa con una línea fina (nada de tarjetas dentro de la hoja) */
function Bloque({ titulo, children }) {
  return (
    <motion.section variants={item} className="border-t border-ink/10 pt-4">
      <h3 className="mb-2 text-lg font-extrabold">{titulo}</h3>
      {children}
    </motion.section>
  );
}

/** Contenido de la hoja de un día: resultado grande primero, detalle después. */
export default function DetalleCorte({ corte: c }) {
  const r = cuadre(c.diferencia);
  const proveedores = (c.proveedores ?? []).filter(p => p.paso || p.cobro > 0 || p.dejo > 0);
  const tandas = c.tandas ?? [];

  return (
    <motion.div className="flex flex-col gap-4" variants={lista} initial="hidden" animate="show">
      {/* Resultado: lo primero que se entiende */}
      <motion.div variants={item} className="flex flex-col items-start gap-2">
        <StatusBadge tone={r.tone} label={r.label} size="lg" />
        <p className="num text-5xl font-extrabold leading-none">
          <AnimatedNumber value={c.totalVentas} from={0} />
        </p>
        <p className="text-ink-soft">
          vendidos ese día{c.diferencia ? `. ${r.detalle}.` : '. No faltó ni sobró nada.'}
        </p>
      </motion.div>

      <motion.dl variants={item} className="border-t border-ink/10 pt-3">
        <Fila k="Ventas" v={c.totalVentas} />
        <Fila k="Gastos" v={c.totalGastos} />
        <Fila k="Debería haber" v={c.deberiaHaber} />
        <Fila k="Había en caja" v={c.dineroEnCaja} />
      </motion.dl>

      {c.productos?.length > 0 && (
        <Bloque titulo="Productos vendidos">
          <ul className="flex flex-col gap-1">
            {c.productos.map(p => (
              <li key={p.id} className="flex items-center gap-3 py-1">
                <ProductoIcon nombre={p.producto?.nombre} size="md" />
                <span className="min-w-0 flex-1">
                  {p.cantidad} × {p.producto?.nombre}
                </span>
                <span className="num text-lg font-bold">{money(p.subtotal ?? p.cantidad * (p.producto?.precio ?? 0))}</span>
              </li>
            ))}
          </ul>
        </Bloque>
      )}

      {tandas.length > 0 && (
        <Bloque titulo={`Tandas de masa (${tandas.length})`}>
          <ul className="flex flex-col">
            {tandas.map((t, i) => (
              <li key={t.id} className="py-1.5">
                Tanda {i + 1}: <strong>{fraccion(t.harina)}</strong> de harina, <strong>{fraccion(t.masa)}</strong> de masa
              </li>
            ))}
          </ul>
        </Bloque>
      )}

      {proveedores.length > 0 && (
        <Bloque titulo="Proveedores">
          <ul className="flex flex-col">
            {proveedores.map(p => (
              <li key={p.id} className="flex items-start justify-between gap-3 py-1.5">
                <span>
                  <span className="font-semibold">{p.proveedor?.nombre}</span>
                  <span className="flex items-center gap-1 text-ink-soft">
                    {p.paso ? <PiCheckBold className="size-4 text-nopal" aria-hidden /> : <PiMinusBold className="size-4" aria-hidden />}
                    {p.paso ? 'Pasó' : 'No pasó'}
                    {p.dejo > 0 && `, dejó ${p.dejo}`}
                  </span>
                </span>
                <span className="num text-lg font-bold">{p.cobro > 0 ? money(p.cobro) : ''}</span>
              </li>
            ))}
          </ul>
        </Bloque>
      )}

      {c.gastos?.length > 0 && (
        <Bloque titulo="Otros gastos">
          <ul className="flex flex-col">
            {c.gastos.map(g => (
              <li key={g.id} className="flex items-baseline justify-between gap-3 py-1.5">
                <span>{g.concepto}</span>
                <span className="num text-lg font-bold">{money(g.monto)}</span>
              </li>
            ))}
          </ul>
        </Bloque>
      )}

      {c.notas && (
        <Bloque titulo="Notas">
          <p>{c.notas}</p>
        </Bloque>
      )}
    </motion.div>
  );
}
