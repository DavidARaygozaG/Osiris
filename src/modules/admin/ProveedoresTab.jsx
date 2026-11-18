'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PiPlusBold, PiPencilSimpleDuotone, PiTruckDuotone, PiTrashDuotone, PiWarningFill } from 'react-icons/pi';
import Sheet from '@/components/ui/Sheet';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmSheet from '@/components/ui/ConfirmSheet';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { api } from './api';
import Cabecera from './Cabecera';
import { entero } from './Kpi';
import Async from './Async';
import ProductoIcon from '@/components/ui/ProductoIcon';
import Field from './Field';
import { useApi } from './useApi';

/** Alta/edición de proveedor en hoja de cristal (misma receta que ProductoForm). */
function ProveedorForm({ open, proveedor, productos, onClose, onSaved, onDelete }) {
  const nuevo = !proveedor;
  const [nombre, setNombre] = useState(proveedor?.nombre ?? '');
  const [surte, setSurte] = useState(proveedor?.productoId ? String(proveedor.productoId) : ''); // '' = harina
  const [activo, setActivo] = useState(proveedor?.activo ?? true);
  const [errorNombre, setErrorNombre] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const guardar = async () => {
    if (!nombre.trim()) {
      setErrorNombre('Escribe el nombre del proveedor.');
      return;
    }
    setBusy(true);
    setErrorServidor('');
    const productoId = surte ? Number(surte) : null;
    try {
      if (nuevo) await api('/api/proveedores', { method: 'POST', body: { nombre: nombre.trim(), productoId } });
      else await api(`/api/proveedores/${proveedor.id}`, { method: 'PUT', body: { nombre: nombre.trim(), productoId, activo } });
      onSaved(nuevo ? 'Proveedor agregado' : 'Cambios guardados');
    } catch (e) {
      setErrorServidor(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={nuevo ? 'Proveedor nuevo' : 'Editar proveedor'}
      footer={
        <div className="grid gap-2.5">
          <button type="button" onClick={guardar} disabled={busy} className="btn btn-big btn-liquid w-full">
            {busy && <span className="loading loading-spinner" aria-hidden />}
            {busy ? 'Guardando…' : nuevo ? 'Agregar proveedor' : 'Guardar cambios'}
          </button>
          {!nuevo && (
            <button type="button" onClick={() => onDelete(proveedor)} disabled={busy} className="btn btn-big btn-glass w-full text-chile">
              <PiTrashDuotone className="size-6" aria-hidden />
              Borrar proveedor
            </button>
          )}
        </div>
      }>
      <div className="grid gap-4">
        <Field label="Nombre" error={errorNombre}>
          <input
            className={`input h-14 w-full bg-field border-ink/10 text-lg ${errorNombre ? 'input-error' : ''}`}
            value={nombre}
            onChange={e => {
              setNombre(e.target.value);
              setErrorNombre('');
            }}
            placeholder="Ej. Don Pedro"
            autoComplete="off"
            maxLength={60}
          />
        </Field>

        <Field label="¿Qué surte?" hint="Lo que deja cuando pasa a la tortillería">
          <select className="select h-14 w-full bg-field border-ink/10 text-lg" value={surte} onChange={e => setSurte(e.target.value)}>
            <option value="">Harina</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Field>

        {!nuevo && (
          <label className="glass flex min-h-16 cursor-pointer items-center justify-between gap-3 px-5 py-3">
            <span>
              <span className="block font-semibold">Está activo</span>
              <span className="block text-ink-soft">{activo ? 'Aparece en el corte' : 'Al guardar, deja de aparecer en esta lista'}</span>
            </span>
            <input type="checkbox" className="toggle toggle-lg toggle-success" checked={activo} onChange={e => setActivo(e.target.checked)} />
          </label>
        )}

        {errorServidor && (
          <p role="alert" className="flex items-start gap-2 font-semibold text-chile">
            <PiWarningFill className="mt-0.5 size-6 shrink-0" aria-hidden />
            {errorServidor}
          </p>
        )}
      </div>
    </Sheet>
  );
}

function Lista({ proveedores, productos, onNuevo, onEditar }) {
  const surteDe = p => productos.find(x => x.id === p.productoId)?.nombre ?? 'Harina';
  return (
    <Stagger className="grid gap-4">
      <StaggerItem>
        <Cabecera icon={PiTruckDuotone} label="Proveedores" value={proveedores.length} format={entero} sub="Los que pasan a la tortillería" />
      </StaggerItem>

      <StaggerItem>
        <button type="button" onClick={onNuevo} className="btn btn-big btn-liquid w-full">
          <PiPlusBold className="size-5" aria-hidden />
          Agregar proveedor
        </button>
      </StaggerItem>

      {proveedores.length === 0 ? (
        <StaggerItem>
          <EmptyState icon={PiTruckDuotone} title="Aún no hay proveedores" text="Agrega al primero para registrar lo que deja y cobra en el corte." />
        </StaggerItem>
      ) : (
        <StaggerItem>
          <ul className="relative grid gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {proveedores.map(p => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -40 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="glass-row">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onEditar(p)}
                    className="flex min-h-20 w-full items-center gap-3 px-4 py-3 text-left">
                    <ProductoIcon nombre={surteDe(p)} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold">{p.nombre}</span>
                      <span className="block text-ink-soft">
                        Surte: {surteDe(p)}
                        {p.padre && ` · de ${p.padre}`}
                      </span>
                    </span>
                    <PiPencilSimpleDuotone className="size-6 shrink-0 text-ink-soft" aria-hidden />
                  </motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </StaggerItem>
      )}
    </Stagger>
  );
}

/** Proveedores: alta, edición y borrado. El API devuelve padres con `hijos`; aquí se aplanan. */
export default function ProveedoresTab({ flash }) {
  const qProv = useApi('/api/proveedores');
  const qProd = useApi('/api/productos?all=true');
  const [sheet, setSheet] = useState({ open: false, proveedor: null, n: 0 });
  const [borrar, setBorrar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Combina dos consultas en una sola para usar <Async>
  const q = {
    status: qProv.status === 'error' || qProd.status === 'error' ? 'error' : qProv.status === 'ok' && qProd.status === 'ok' ? 'ok' : 'loading',
    error: qProv.error || qProd.error,
    data: null,
    reload: () => {
      qProv.reload();
      qProd.reload();
    },
  };

  const abrir = proveedor => setSheet(s => ({ open: true, proveedor, n: s.n + 1 }));
  const cerrar = () => setSheet(s => ({ ...s, open: false }));

  const guardado = msg => {
    cerrar();
    flash(msg);
    q.reload();
  };

  const confirmar = async () => {
    setBusy(true);
    setError('');
    try {
      await api(`/api/proveedores/${borrar.id}`, {
        method: 'DELETE',
        errorMsg: 'No se pudo borrar. Si ya aparece en algún corte, mejor desactívalo.',
      });
      setBorrar(null);
      cerrar();
      flash('Proveedor borrado');
      q.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const aplanar = provs => provs.flatMap(p => [p, ...(p.hijos ?? []).map(h => ({ ...h, padre: p.nombre }))]);

  return (
    <>
      <Async query={q}>
        {() => <Lista proveedores={aplanar(qProv.data)} productos={qProd.data} onNuevo={() => abrir(null)} onEditar={abrir} />}
      </Async>

      <ProveedorForm
        key={sheet.n}
        open={sheet.open}
        proveedor={sheet.proveedor}
        productos={qProd.data ?? []}
        onClose={cerrar}
        onSaved={guardado}
        onDelete={p => {
          setError('');
          setBorrar(p);
        }}
      />

      <ConfirmSheet
        open={!!borrar}
        onClose={() => setBorrar(null)}
        name={borrar?.nombre ?? ''}
        detail="Se borra de la lista de proveedores. No se puede deshacer."
        confirmLabel="Sí, borrar proveedor"
        onConfirm={confirmar}
        busy={busy}
        error={error}
      />
    </>
  );
}
