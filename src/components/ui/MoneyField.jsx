'use client';

import { useState } from 'react';
import { PiBackspaceDuotone, PiEraserDuotone } from 'react-icons/pi';
import Sheet from './Sheet';
import { money } from '@/lib/format';

/**
 * Teclado numérico grande en una hoja de cristal.
 * Mucho más fácil que el teclado del teléfono: solo dígitos, sin errores de formato.
 */
export function NumPad({ initial = 0, decimals = false, onConfirm, confirmLabel = 'Listo', prefix = '$', suffix = '' }) {
  const [txt, setTxt] = useState(initial ? String(initial) : '');
  // Mientras no se toque una tecla, el valor inicial se REEMPLAZA (250 + 5 = 5, no 2505)
  const [limpio, setLimpio] = useState(true);

  const press = k => {
    const reemplaza = limpio && k !== 'back';
    setLimpio(false);
    setTxt(prev => {
      const t = reemplaza ? '' : prev;
      if (k === 'back') return t.slice(0, -1);
      if (k === '.') return decimals && !t.includes('.') ? (t || '0') + '.' : t;
      if (t.length >= 8) return t;
      if (t === '0') return k; // evita 05
      if (t.includes('.') && t.split('.')[1].length >= 2) return t;
      return t + k;
    });
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', decimals ? '.' : '', '0', 'back'];
  const shown = txt === '' ? '0' : txt;

  return (
    <div>
      <p className="num mb-4 truncate text-center text-6xl font-extrabold" aria-live="polite">
        <span className="text-ink-soft">{prefix}</span>
        {shown}
        <span className="text-3xl text-ink-soft">{suffix}</span>
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {keys.map((k, i) =>
          k === '' ? (
            <span key={`vacio-${i}`} />
          ) : (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={k === 'back' ? 'Borrar' : k === '.' ? 'Punto decimal' : k}
              className="btn btn-glass num h-16 min-h-16 text-3xl font-bold text-ink">
              {k === 'back' ? <PiBackspaceDuotone className="size-8" /> : k}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setTxt('');
          setLimpio(false);
        }}
        className="btn btn-big btn-ghost mt-3 w-full text-ink">
        <PiEraserDuotone className="size-6" aria-hidden />
        Borrar todo
      </button>
      <button
        type="button"
        onClick={() => onConfirm?.(Number(txt) || 0)}
        className="btn btn-big btn-liquid mt-2 w-full">
        {confirmLabel}
      </button>
    </div>
  );
}

/**
 * Campo de dinero (o número) que abre el teclado.
 * <MoneyField label="Dinero en caja" value={x} onChange={setX} />
 */
export default function MoneyField({ label, hint, value = 0, onChange, decimals = false, prefix = '$', suffix = '', display }) {
  const [open, setOpen] = useState(false);
  const shown = display ? display(value) : prefix === '$' ? money(value) : `${value}${suffix}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass flex min-h-20 w-full items-center justify-between gap-3 px-5 py-3 text-left active:scale-[0.99]">
        <span className="min-w-0">
          <span className="block font-semibold">{label}</span>
          {hint && <span className="block text-sm text-ink-soft">{hint}</span>}
        </span>
        <span className="num shrink-0 text-3xl font-extrabold">{shown}</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <NumPad
          initial={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          onConfirm={v => {
            onChange?.(v);
            setOpen(false);
          }}
        />
      </Sheet>
    </>
  );
}
