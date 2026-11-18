'use client';

import { useState } from 'react';
import { PiWarningFill, PiGrainsDuotone } from 'react-icons/pi';
import Glass from '@/components/ui/Glass';
import MoneyField from '@/components/ui/MoneyField';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { fraccion } from '@/lib/format';
import { api } from './api';
import Async from './Async';
import Cabecera from './Cabecera';
import { useApi } from './useApi';

// Función estable (fuera del componente) para que la cifra animada no reinicie
const bultos = v => `${fraccion(Math.round(v * 4) / 4)} bultos`;

/** Formulario con estado propio: nace con el valor ya cargado (`inicial`), sin efectos. */
function HarinaForm({ inicial, flash }) {
  const [base, setBase] = useState(inicial); // lo último guardado
  const [stock, setStock] = useState(inicial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cambio = stock !== base;

  const guardar = async () => {
    setBusy(true);
    setError('');
    try {
      await api('/api/harina/stock', { method: 'PUT', body: { stock } });
      setBase(stock);
      flash('Harina guardada');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stagger className="grid gap-4">
      <StaggerItem>
        <Cabecera icon={PiGrainsDuotone} label="Harina en el almacén" value={base} format={bultos} sub="Lo último que guardaste" />
      </StaggerItem>
      <StaggerItem>
        <Glass as="section" className="grid gap-4 p-4">
          <p className="text-ink-soft">
            Ajusta aquí cuántos bultos hay en el almacén si el conteo no coincide. Se aceptan cuartos (0.25, 0.5, 0.75).
          </p>
          <MoneyField
            label="Harina en el almacén"
            value={stock}
            onChange={setStock}
            decimals
            prefix=""
            suffix=" bultos"
            display={v => `${fraccion(v)} bultos`}
          />
          {error && (
            <p role="alert" className="flex items-start gap-2 font-semibold text-chile">
              <PiWarningFill className="mt-0.5 size-6 shrink-0" aria-hidden />
              {error}
            </p>
          )}
          <button type="button" onClick={guardar} disabled={!cambio || busy} className="btn btn-big btn-liquid w-full disabled:opacity-50">
            {busy && <span className="loading loading-spinner" aria-hidden />}
            {busy ? 'Guardando…' : cambio ? 'Guardar harina' : 'Sin cambios'}
          </button>
        </Glass>
      </StaggerItem>
    </Stagger>
  );
}

/** Stock de harina (bultos). GET/PUT /api/harina/stock. */
export default function HarinaTab({ flash }) {
  const q = useApi('/api/harina/stock');
  return <Async query={q}>{d => <HarinaForm inicial={Number(d?.stock) || 0} flash={flash} />}</Async>;
}
