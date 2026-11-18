'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PiPlusBold, PiPencilSimpleDuotone, PiEyeSlashDuotone, PiCheckCircleFill, PiWarningFill, PiPackageDuotone, PiTrashDuotone } from 'react-icons/pi';
import Sheet from '@/components/ui/Sheet';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmSheet from '@/components/ui/ConfirmSheet';
import MoneyField from '@/components/ui/MoneyField';
import { money } from '@/lib/format';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { api } from './api';
import Cabecera from './Cabecera';
import { entero } from './Kpi';
import Async from './Async';
import Field from './Field';
import ProductoIcon from '@/components/ui/ProductoIcon';
import Pill from './Pill';
import { useApi } from './useApi';

/**
 * Formulario de alta/edición dentro de una hoja de cristal.
 * Patrón: el padre le pone `key` distinta cada vez que se abre → el estado se reinicia solo.
 */
function ProductoForm({ open, producto, onClose, onSaved, onDelete }) {
  const nuevo = !producto;
  const [nombre, setNombre] = useState(producto?.nombre ?? '');
  const [precio, setPrecio] = useState(producto?.precio ?? 0);
  const [stock, setStock] = useState(producto?.stock ?? 0);
  const [activo, setActivo] = useState(producto?.activo ?? true);
  const [errores, setErrores] = useState({});
  const [busy, setBusy] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'Escribe el nombre del producto.';
    if (!(precio > 0)) e.precio = 'El precio debe ser mayor a $0.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setBusy(true);
    setErrorServidor('');
    try {
      if (nuevo) {
        // El alta solo recibe nombre y precio; el stock inicial se pone justo después
        const creado = await api('/api/productos', { method: 'POST', body: { nombre: nombre.trim(), precio } });
        if (stock > 0) await api(`/api/productos/${creado.id}`, { method: 'PUT', body: { stock } });
      } else {
        await api(`/api/productos/${producto.id}`, { method: 'PUT', body: { nombre: nombre.trim(), precio, stock, activo } });
      }
      onSaved(nuevo ? 'Producto agregado' : 'Cambios guardados');
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
      title={nuevo ? 'Producto nuevo' : 'Editar producto'}
      footer={
        <div className="grid gap-2.5">
          <button type="button" onClick={guardar} disabled={busy} className="btn btn-big btn-liquid w-full">
            {busy && <span className="loading loading-spinner" aria-hidden />}
            {busy ? 'Guardando…' : nuevo ? 'Agregar producto' : 'Guardar cambios'}
          </button>
          {!nuevo && (
            <button type="button" onClick={() => onDelete(producto)} disabled={busy} className="btn btn-big btn-glass w-full text-chile">
              <PiTrashDuotone className="size-6" aria-hidden />
              Borrar producto
            </button>
          )}
        </div>
      }>
      <div className="grid gap-4">
        <div className="flex justify-center">
          <ProductoIcon nombre={nombre || 'producto'} size="lg" />
        </div>
        <Field label="Nombre" error={errores.nombre}>
          <input
            className={`input h-14 w-full bg-field border-ink/10 text-lg ${errores.nombre ? 'input-error' : ''}`}
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej. Tostadas"
            autoComplete="off"
            maxLength={60}
          />
        </Field>

        <div>
          <MoneyField label="Precio" hint="Lo que paga el cliente por pieza" value={precio} onChange={setPrecio} decimals />
          {errores.precio && <p role="alert" className="mt-1.5 flex items-center gap-1.5 font-semibold text-chile"><PiWarningFill className="size-5" aria-hidden />{errores.precio}</p>}
        </div>

        <MoneyField label="En inventario" hint="Piezas que hay ahora" value={stock} onChange={setStock} prefix="" suffix=" pzas" />

        {!nuevo && (
          <label className="glass flex min-h-16 cursor-pointer items-center justify-between gap-3 px-5 py-3">
            <span>
              <span className="block font-semibold">Mostrar en el corte</span>
              <span className="block text-ink-soft">{activo ? 'Los empleados lo ven' : 'Oculto para los empleados'}</span>
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

function Lista({ productos, onNuevo, onEditar }) {
  const sinStock = productos.filter(p => p.stock <= 0).length;
  return (
    <Stagger className="grid gap-4">
      <StaggerItem>
        <Cabecera
          icon={PiPackageDuotone}
          label="Productos"
          value={productos.length}
          format={entero}
          sub={sinStock ? `${sinStock} sin inventario` : 'Todos con inventario'}
        />
      </StaggerItem>

      <StaggerItem>
        <button type="button" onClick={onNuevo} className="btn btn-big btn-liquid w-full">
          <PiPlusBold className="size-5" aria-hidden />
          Agregar producto
        </button>
      </StaggerItem>

      {productos.length === 0 ? (
        <StaggerItem>
          <EmptyState icon={PiPackageDuotone} title="Aún no hay productos" text="Agrega el primero para poder venderlo en el corte." />
        </StaggerItem>
      ) : (
        <StaggerItem>
          <ul className="relative grid gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {productos.map(p => (
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
                    <ProductoIcon nombre={p.nombre} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold">{p.nombre}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="num font-extrabold">{money(p.precio)}</span>
                        {p.stock > 0 ? (
                          <Pill tone="ok" icon={PiCheckCircleFill}>{p.stock} en inventario</Pill>
                        ) : (
                          <Pill tone="warn" icon={PiWarningFill}>Sin inventario</Pill>
                        )}
                        {!p.activo && <Pill icon={PiEyeSlashDuotone}>Oculto</Pill>}
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

/** Productos: alta, edición, stock, ocultar y borrar. GET ?all=true incluye los ocultos. */
export default function ProductosTab({ flash }) {
  const q = useApi('/api/productos?all=true');
  const [sheet, setSheet] = useState({ open: false, producto: null, n: 0 });
  const [borrar, setBorrar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const abrir = producto => setSheet(s => ({ open: true, producto, n: s.n + 1 }));
  const cerrar = () => setSheet(s => ({ ...s, open: false }));

  const guardado = msg => {
    cerrar();
    flash(msg);
    q.reload();
  };

  const pedirBorrar = p => {
    setError('');
    setBorrar(p);
  };

  const confirmar = async () => {
    setBusy(true);
    setError('');
    try {
      await api(`/api/productos/${borrar.id}`, {
        method: 'DELETE',
        errorMsg: 'No se pudo borrar. Si ya se usó en algún corte, mejor ocúltalo en lugar de borrarlo.',
      });
      setBorrar(null);
      cerrar();
      flash('Producto borrado');
      q.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Async query={q}>{productos => <Lista productos={productos} onNuevo={() => abrir(null)} onEditar={abrir} />}</Async>

      <ProductoForm key={sheet.n} open={sheet.open} producto={sheet.producto} onClose={cerrar} onSaved={guardado} onDelete={pedirBorrar} />

      <ConfirmSheet
        open={!!borrar}
        onClose={() => setBorrar(null)}
        name={borrar?.nombre ?? ''}
        detail="Se borra de la lista de productos. No se puede deshacer."
        confirmLabel="Sí, borrar producto"
        onConfirm={confirmar}
        busy={busy}
        error={error}
      />
    </>
  );
}
