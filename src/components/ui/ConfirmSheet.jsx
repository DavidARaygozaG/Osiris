'use client';

import { PiTrashDuotone, PiWarningCircleFill } from 'react-icons/pi';
import Sheet from './Sheet';

/**
 * Confirmación explícita para acciones que no se pueden deshacer (nunca window.confirm).
 * Siempre dice QUÉ se borra (`name`) y qué pasa después (`detail`).
 *
 * <ConfirmSheet open={!!x} onClose={…} name="Tortilla de maíz" detail="Ya no aparecerá."
 *   onConfirm={borrar} busy={cargando} error={mensaje} />
 */
export default function ConfirmSheet({
  open,
  onClose,
  title = '¿Seguro que quieres borrarlo?',
  name,
  detail,
  confirmLabel = 'Sí, borrar',
  onConfirm,
  busy = false,
  error = '',
}) {
  return (
    <Sheet
      open={open}
      onClose={busy ? undefined : onClose}
      title={title}
      footer={
        <div className="grid gap-2.5">
          <button type="button" onClick={onConfirm} disabled={busy} className="btn btn-big w-full border-0 bg-chile text-masa">
            {busy ? <span className="loading loading-spinner" aria-hidden /> : <PiTrashDuotone className="size-6" aria-hidden />}
            {busy ? 'Borrando…' : confirmLabel}
          </button>
          <button type="button" onClick={onClose} disabled={busy} className="btn btn-big glass w-full border-0 text-ink">
            No, mejor no
          </button>
        </div>
      }>
      <p className="tone-bad rounded-2xl bg-(--tone-bg) px-4 py-3 text-xl font-extrabold">
        {name}
      </p>
      {detail && <p className="mt-3 text-ink-soft">{detail}</p>}
      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 font-semibold text-chile">
          <PiWarningCircleFill className="mt-0.5 size-6 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </Sheet>
  );
}
