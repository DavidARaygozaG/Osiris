'use client';

import { PiCoinsDuotone, PiGrainsDuotone, PiShoppingCartDuotone, PiTruckDuotone, PiReceiptDuotone, PiChatTextDuotone } from 'react-icons/pi';
import { money, cuadre } from '@/lib/format';
import ProductoIcon from '@/components/ui/ProductoIcon';
import StatusBadge from '@/components/ui/StatusBadge';

/** Una línea "etiqueta ........ valor" */
function Fila({ label, value, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-ink/10 py-2 last:border-0">
      <dt className={strong ? 'font-bold' : ''}>{label}</dt>
      <dd className={`num text-right ${strong ? 'text-xl font-extrabold' : 'font-bold'}`}>{value}</dd>
    </div>
  );
}

function Seccion({ icon: Icon, title, children }) {
  return (
    <section className="mt-5">
      <h3 className="mb-1 flex items-center gap-2 text-lg font-extrabold">
        <Icon className="size-6 text-cafe" aria-hidden />
        {title}
      </h3>
      <dl>{children}</dl>
    </section>
  );
}

/** Detalle completo de un corte (se muestra dentro de una Sheet). */
export default function CorteDetalle({ c }) {
  const cobros = (c.proveedores ?? []).filter(p => p.paso).reduce((a, p) => a + p.cobro, 0);
  const extras = (c.gastos ?? []).reduce((a, g) => a + g.monto, 0);
  const merma = Math.max(0, c.totalGastos - cobros - extras); // lo que sobra de gastos = merma
  const q = cuadre(c.diferencia);

  return (
    <div>
      <p className={`tone-${q.tone} flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-(--tone-bg) px-4 py-3`}>
        <StatusBadge tone={q.tone} size="lg" />
        <span className="font-bold text-(--tone)">{q.detalle}</span>
      </p>

      <Seccion icon={PiCoinsDuotone} title="Dinero">
        <Fila label="Venta de tortilla" value={money(c.ventaTortilla)} />
        <Fila label="Venta de productos" value={money(c.ventaProductos)} />
        <Fila label="Total vendido" value={money(c.totalVentas)} strong />
        <Fila label="Merma" value={money(merma)} />
        <Fila label="Cobro de proveedores" value={money(cobros)} />
        <Fila label="Gastos extra" value={money(extras)} />
        <Fila label="Total de gastos" value={money(c.totalGastos)} strong />
        <Fila label="Debería haber" value={money(c.deberiaHaber)} />
        <Fila label="Había en caja" value={money(c.dineroEnCaja)} />
      </Seccion>

      {c.tandas?.length > 0 && (
        <Seccion icon={PiGrainsDuotone} title={`Tandas (${c.tandas.length})`}>
          {c.tandas.map((t, i) => (
            <Fila key={t.id} label={`Tanda ${i + 1}`} value={`${t.harina} harina + ${t.masa} masa`} />
          ))}
        </Seccion>
      )}

      {c.productos?.length > 0 && (
        <Seccion icon={PiShoppingCartDuotone} title="Productos vendidos">
          {c.productos.map(p => (
            <div key={p.id} className="flex items-center gap-3 border-b border-ink/10 py-2 last:border-0">
              <ProductoIcon nombre={p.producto.nombre} size="md" />
              <div className="min-w-0 flex-1">
                <dt className="truncate font-bold">{p.producto.nombre}</dt>
                <dd className="text-ink-soft">
                  {p.cantidad} × {money(p.producto.precio)}
                </dd>
              </div>
              <dd className="num text-right font-extrabold">{money(p.cantidad * p.producto.precio)}</dd>
            </div>
          ))}
        </Seccion>
      )}

      {c.proveedores?.some(p => p.paso) && (
        <Seccion icon={PiTruckDuotone} title="Proveedores que pasaron">
          {c.proveedores
            .filter(p => p.paso)
            .map(p => (
              <Fila key={p.id} label={`${p.proveedor?.nombre ?? 'Proveedor'} (dejó ${p.dejo})`} value={money(p.cobro)} />
            ))}
        </Seccion>
      )}

      {c.gastos?.length > 0 && (
        <Seccion icon={PiReceiptDuotone} title="Gastos extra">
          {c.gastos.map(g => (
            <Fila key={g.id} label={g.concepto} value={money(g.monto)} />
          ))}
        </Seccion>
      )}

      {c.notas && (
        <p className="mt-5 flex items-start gap-2 text-ink-soft">
          <PiChatTextDuotone className="mt-0.5 size-6 shrink-0" aria-hidden />
          {c.notas}
        </p>
      )}
    </div>
  );
}
