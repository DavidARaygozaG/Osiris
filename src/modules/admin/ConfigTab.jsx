'use client';

import { useState } from 'react';
import { PiWarningFill, PiGearSixDuotone } from 'react-icons/pi';
import Glass from '@/components/ui/Glass';
import MoneyField from '@/components/ui/MoneyField';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { api } from './api';
import Async from './Async';
import Field from './Field';
import { useApi } from './useApi';

// Claves técnicas de la base de datos → nombres que entiende el dueño.
// Para agregar un ajuste nuevo: súmalo aquí y listo (clave, nombre, ayuda, valor por defecto).
const AJUSTES = [
  { key: 'precio_bulto_harina', label: 'Precio de venta por bulto de harina', hint: 'Con esto se calcula cuánta tortilla se vendió', def: 880 },
  { key: 'precio_kg_merma', label: 'Costo por kilo de merma', hint: 'Lo que cuesta cada kilo de masa que se pierde', def: 23 },
  { key: 'meta_mensual', label: 'Meta de ventas del mes', hint: 'Aparece en la barra de avance de Días', def: 0 },
];

function ConfigForm({ inicial, flash }) {
  // Valores numéricos desde el texto guardado; si no existen usan el valor por defecto
  const desde = c => Object.fromEntries(AJUSTES.map(a => [a.key, Number(c[a.key] ?? a.def) || 0]));
  const [base, setBase] = useState(() => desde(inicial));
  const [valores, setValores] = useState(() => desde(inicial));
  const [pin, setPin] = useState('');
  const [errorPin, setErrorPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const cambios = AJUSTES.filter(a => valores[a.key] !== base[a.key]);
  const hayCambios = cambios.length > 0 || pin !== '';

  const guardar = async () => {
    if (pin && !/^\d{4,8}$/.test(pin)) {
      setErrorPin('El PIN debe tener de 4 a 8 números.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      // Solo se envía lo que cambió (cada ajuste es una pareja clave/valor)
      await Promise.all(cambios.map(a => api('/api/admin/config', { method: 'PUT', body: { key: a.key, value: valores[a.key] } })));
      if (pin) await api('/api/admin/config', { method: 'PUT', body: { key: 'admin_pin', value: pin } });
      setBase(valores);
      setPin('');
      flash(pin ? 'Ajustes y PIN guardados' : 'Ajustes guardados');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stagger className="grid gap-4">
      <StaggerItem>
        <Glass as="section" className="glass-liquid flex items-center gap-4 p-5">
          <PiGearSixDuotone className="size-12 shrink-0 text-cafe drop-shadow-md" aria-hidden />
          <div>
            <h2 className="text-xl font-extrabold">Ajustes del negocio</h2>
            <p className="text-ink-soft">Estos valores cambian los cálculos del corte diario.</p>
          </div>
        </Glass>
      </StaggerItem>

      {AJUSTES.map(a => (
        <StaggerItem key={a.key}>
        <MoneyField
          label={a.label}
          hint={a.hint}
          value={valores[a.key]}
          onChange={v => setValores(s => ({ ...s, [a.key]: v }))}
          decimals
        />
        </StaggerItem>
      ))}

      <StaggerItem>
      <Glass as="section" className="p-4">
        <Field label="Cambiar PIN de administrador" hint="Déjalo vacío si no quieres cambiarlo." error={errorPin}>
          <input
            className={`input h-14 w-full bg-field border-ink/10 text-lg ${errorPin ? 'input-error' : ''}`}
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            maxLength={8}
            placeholder="Nuevo PIN (4 a 8 números)"
            value={pin}
            onChange={e => {
              setPin(e.target.value.replace(/\D/g, ''));
              setErrorPin('');
            }}
          />
        </Field>
      </Glass>
      </StaggerItem>

      {error && (
        <p role="alert" className="flex items-start gap-2 font-semibold text-chile">
          <PiWarningFill className="mt-0.5 size-6 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <button type="button" onClick={guardar} disabled={!hayCambios || busy} className="btn btn-big btn-liquid w-full disabled:opacity-50">
        {busy && <span className="loading loading-spinner" aria-hidden />}
        {busy ? 'Guardando…' : hayCambios ? 'Guardar ajustes' : 'Sin cambios'}
      </button>
    </Stagger>
  );
}

/** Ajustes del negocio: GET /api/admin/config devuelve { clave: valor }; PUT guarda de una en una. */
export default function ConfigTab({ flash }) {
  const q = useApi('/api/admin/config');
  return <Async query={q}>{c => <ConfigForm inicial={c ?? {}} flash={flash} />}</Async>;
}
