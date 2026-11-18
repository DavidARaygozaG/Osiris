'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PiTrashDuotone, PiCaretRightBold, PiCalendarXDuotone, PiReceiptDuotone } from 'react-icons/pi';
import Sheet from '@/components/ui/Sheet';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmSheet from '@/components/ui/ConfirmSheet';
import StatusBadge from '@/components/ui/StatusBadge';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { money, fechaLarga, estadoDe } from '@/lib/format';
import { api } from './api';
import Cabecera from './Cabecera';
import { entero } from './Kpi';
import CorteDetalle from './CorteDetalle';
import { tonoDe } from './Charts';

const PAGINA = 15;

/** Lista de cortes recientes. Tocar uno abre su detalle; la papelera pide confirmación. */
export default function CortesTab({ stats, onChanged, flash }) {
  const [ver, setVer] = useState(null); // corte abierto en detalle
  const [borrar, setBorrar] = useState(null); // corte a borrar (hoja de confirmación)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [limite, setLimite] = useState(PAGINA);

  const pedirBorrar = c => {
    setError('');
    setBorrar(c);
  };

  const confirmar = async () => {
    setBusy(true);
    setError('');
    try {
      await api(`/api/admin/corte/${borrar.id}`, { method: 'DELETE', errorMsg: 'No se pudo borrar el corte. Intenta otra vez.' });
      setBorrar(null);
      setVer(null);
      flash('Corte borrado. El inventario se regresó.');
      onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const cortes = stats.ultimosCortes;
  if (!cortes.length) {
    return <EmptyState icon={PiCalendarXDuotone} title="No hay cortes" text="Aún no se ha guardado ningún corte." />;
  }

  return (
    <>
      <Stagger className="grid gap-4">
        <StaggerItem>
          <Cabecera icon={PiReceiptDuotone} label="Cuentas guardadas" value={cortes.length} format={entero} sub="Toca una para ver el detalle" />
        </StaggerItem>

        <StaggerItem>
          {/* popLayout: al borrar, la fila sale y las demás suben suavemente */}
          <ul className="relative grid gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {cortes.slice(0, limite).map(c => (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -40 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}>
                  <div className="glass-row flex items-stretch">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setVer(c)}
                      className="flex min-h-20 min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold first-letter:uppercase">{fechaLarga(c.fecha)}</span>
                        <span className="mt-1 flex flex-wrap items-center gap-2">
                          <StatusBadge tone={tonoDe(estadoDe(c))} />
                          <span className="num text-lg font-extrabold">{money(c.totalVentas)}</span>
                        </span>
                      </span>
                      <PiCaretRightBold className="size-5 shrink-0 text-ink-soft" aria-hidden />
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => pedirBorrar(c)}
                      aria-label={`Borrar corte del ${fechaLarga(c.fecha)}`}
                      className="btn btn-ghost h-auto min-h-12 w-16 shrink-0 rounded-r-2xl text-chile">
                      <PiTrashDuotone className="size-7" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {limite < cortes.length && (
            <button type="button" onClick={() => setLimite(l => l + PAGINA)} className="btn btn-big btn-glass mt-4 w-full">
              Ver más cortes
            </button>
          )}
        </StaggerItem>
      </Stagger>

      <Sheet
        open={!!ver}
        onClose={() => setVer(null)}
        title={ver ? `Corte del ${fechaLarga(ver.fecha)}` : ''}
        footer={
          <button type="button" onClick={() => pedirBorrar(ver)} className="btn btn-big btn-glass w-full text-chile">
            <PiTrashDuotone className="size-6" aria-hidden />
            Borrar este corte
          </button>
        }>
        {ver && <CorteDetalle c={ver} />}
      </Sheet>

      <ConfirmSheet
        open={!!borrar}
        onClose={() => setBorrar(null)}
        name={borrar ? `Corte del ${fechaLarga(borrar.fecha)} · ${money(borrar.totalVentas)}` : ''}
        detail="Se borra el corte completo y el inventario regresa a como estaba antes de hacerlo. No se puede deshacer."
        confirmLabel="Sí, borrar el corte"
        onConfirm={confirmar}
        busy={busy}
        error={error}
      />
    </>
  );
}
