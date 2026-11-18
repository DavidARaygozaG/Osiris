'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PiCheckCircleFill, PiWarningFill } from 'react-icons/pi';
import Sheet from '@/components/ui/Sheet';
import QtyStepper from '@/components/ui/QtyStepper';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import ProductoIcon from '@/components/ui/ProductoIcon';
import Burst from '@/components/ui/Burst';
import { fraccion } from '@/lib/format';

// Texto singular/plural: "1 bulto", "2 bultos", "½ bulto"
const bultosTxt = n => `${fraccion(n)} ${n <= 1 ? 'bulto' : 'bultos'}`;

// Formato estable (fuera del componente) para que AnimatedNumber no reinicie su animación
const fmtBultos = v => bultosTxt(Math.round(v * 4) / 4);

/** Check verde que se dibuja solo (.check-draw) dentro de un círculo que "pop", con gotas alrededor. */
function CheckListo() {
  return (
    <div className="relative my-8 grid size-24 place-items-center">
      <motion.svg
        viewBox="0 0 64 64"
        className="relative size-24 drop-shadow-md"
        fill="none"
        aria-hidden
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 16 }}>
        <path
          d="M18 34 L28 44 L46 22"
          className="check-draw"
          style={{ stroke: 'var(--c-nopal)' }}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
      <Burst cantidad={14} radio={78} />
    </div>
  );
}

/**
 * Hoja "Llegó harina". Patrón: la hoja consulta su estado cada vez que se abre
 * (GET /api/harina/ingreso) y tiene 5 vistas: cargando, captura, ya ingresado, listo y error.
 */
export default function HarinaSheet({ open, onClose, onSaved }) {
  // El contenido vive DENTRO de la hoja: se monta al abrir y se desmonta al cerrar,
  // así su estado se reinicia solo (sin resetear a mano dentro de un effect).
  return (
    <Sheet open={open} onClose={onClose} title="Llegó harina">
      <Contenido onClose={onClose} onSaved={onSaved} />
    </Sheet>
  );
}

function Contenido({ onClose, onSaved }) {
  const [estado, setEstado] = useState('cargando'); // cargando | captura | ya | listo | error
  const [stock, setStock] = useState(0);
  const [stockAntes, setStockAntes] = useState(0);
  const [ingresoHoy, setIngresoHoy] = useState(null);
  const [bultos, setBultos] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let vivo = true;
    fetch('/api/harina/ingreso')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        if (!vivo) return;
        setStock(d.stock ?? 0);
        setIngresoHoy(d.ingresoHoy);
        setEstado(d.ingresoHoy ? 'ya' : 'captura');
      })
      .catch(() => vivo && setEstado('error'));
    return () => {
      vivo = false;
    };
  }, []);

  async function guardar() {
    setGuardando(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/harina/ingreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bultos }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStockAntes(stock);
        setStock(data.stockActual ?? stock + bultos);
        setEstado('listo');
        onSaved?.();
      } else if (res.status === 409) {
        // Regla de negocio: un solo ingreso por día
        setIngresoHoy({ bultos: data.bultos });
        setEstado('ya');
      } else {
        setErrorMsg('No se pudo guardar. Intenta otra vez.');
      }
    } catch {
      setErrorMsg('Sin conexión. Intenta otra vez cuando haya señal.');
    }
    setGuardando(false);
  }

  const boton =
    estado === 'captura' ? (
      <div className="flex flex-col gap-2">
        {errorMsg && (
          <p role="alert" className="tone-bad flex items-center gap-2 font-semibold text-[color:var(--tone)]">
            <PiWarningFill className="size-5 shrink-0" aria-hidden />
            {errorMsg}
          </p>
        )}
        <button type="button" onClick={guardar} disabled={guardando} className="btn btn-big btn-liquid w-full">
          {guardando && <span className="loading loading-spinner" aria-hidden />}
          {guardando ? 'Guardando' : `Guardar ${bultosTxt(bultos)}`}
        </button>
      </div>
    ) : (
      <button type="button" onClick={onClose} className="btn btn-big btn-liquid w-full">
        Listo
      </button>
    );

  return (
    <>
      {estado === 'cargando' && (
        <div className="flex flex-col items-center gap-4 py-4" aria-busy="true">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-14 w-56" />
        </div>
      )}

      {estado === 'error' && (
        <p role="alert" className="tone-bad flex items-center gap-2 py-4 text-lg font-semibold text-[color:var(--tone)]">
          <PiWarningFill className="size-6 shrink-0" aria-hidden />
          No pudimos revisar la harina. Cierra y vuelve a intentar.
        </p>
      )}

      {estado === 'captura' && (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <p className="flex items-center gap-2 text-ink-soft">
            <ProductoIcon nombre="harina" size="sm" />
            Ahora hay <b className="num text-ink">{bultosTxt(stock)}</b>
          </p>
          <p className="text-xl font-bold">¿Cuántos bultos llegaron?</p>
          {/* Paso de ½ bulto: el endpoint guarda decimales (Float) */}
          <QtyStepper value={bultos} onChange={setBultos} step={0.5} min={0.5} max={200} format={fraccion} label="bultos" />
        </div>
      )}

      {estado === 'ya' && (
        <div className="tone-warn flex flex-col items-center gap-2 py-4 text-center">
          <PiCheckCircleFill className="size-12 text-[color:var(--tone)]" aria-hidden />
          <p className="text-xl font-bold">Hoy ya anotaste la harina</p>
          <p className="text-ink-soft">Llegaron {bultosTxt(ingresoHoy?.bultos ?? 0)}. Solo se anota una vez al día.</p>
        </div>
      )}

      {estado === 'listo' && (
        <div className="flex flex-col items-center gap-1 text-center" role="status">
          <CheckListo />
          <p className="text-xl font-bold">Harina anotada</p>
          <p className="text-ink-soft">
            Ahora hay{' '}
            <b className="num text-ink">
              <AnimatedNumber value={stock} from={stockAntes} format={fmtBultos} />
            </b>
          </p>
        </div>
      )}
      <div className="mt-4">{boton}</div>
    </>
  );
}
