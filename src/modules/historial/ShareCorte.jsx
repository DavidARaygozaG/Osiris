'use client';

import { useRef, useState } from 'react';
import { PiShareNetworkBold, PiDownloadSimpleBold, PiWarningFill, PiCheckCircleFill } from 'react-icons/pi';
import * as htmlToImage from 'html-to-image';
import { money } from '@/lib/format';
import { toneDe } from '@/hooks/useHistorialStats';

// Tarjeta exportada: paleta CLARA propia con colores fijos (html-to-image no soporta
// variables ni backdrop-filter, y debe verse igual aunque la app esté en modo oscuro).
const C = { verde: '#17613a', verde2: '#1f7a47', cafe: '#3a2616', suave: '#6b5440', crema: '#fff8e8', maiz: '#f2b518' };
const RESULTADO = {
  ok: { texto: 'Cuadró', color: '#16703c', fondo: '#dff3e6' },
  bad: { texto: 'Faltó dinero', color: '#a82a14', fondo: '#fbe0da' },
  warn: { texto: 'Sobró dinero', color: '#7d5200', fondo: '#fbe7a6' },
};

/** Tarjeta que se exporta como imagen: banda verde con la marca, cuerpo crema, café para cifras. */
function TarjetaCorte({ corte, fecha }) {
  const tone = toneDe(corte);
  const r = RESULTADO[tone];
  const dif = Math.abs(Math.round(corte.diferencia || 0));
  const filas = [
    ['Gastos', money(corte.totalGastos)],
    ['Debería haber', money(corte.deberiaHaber)],
    ['Había en caja', money(corte.dineroEnCaja)],
  ];

  return (
    <div className="w-90 font-sans" style={{ background: C.crema, color: C.cafe }}>
      <div className="px-7 pb-5 pt-6" style={{ background: `linear-gradient(135deg, ${C.verde} 0%, ${C.verde2} 100%)`, color: '#ffffff' }}>
        <p className="font-display text-lg font-extrabold">Tortillería Única | Eduardo&apos;s</p>
        <p className="mt-0.5 capitalize" style={{ color: '#e9f6ee' }}>
          {fecha}
        </p>
      </div>
      <div className="h-1.5" style={{ background: C.maiz }} />

      <div className="px-7 pb-7 pt-6">
        <p style={{ color: C.suave }}>Vendimos</p>
        <p className="num text-6xl font-extrabold leading-none" style={{ color: C.cafe }}>
          {money(corte.totalVentas)}
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: r.fondo, color: r.color }}>
          {tone === 'ok' ? <PiCheckCircleFill className="size-7" /> : <PiWarningFill className="size-7" />}
          <span className="font-display text-xl font-extrabold">
            {r.texto}
            {dif > 0 ? `: ${money(dif)}` : ''}
          </span>
        </div>

        <dl className="mt-5 flex flex-col gap-2">
          {filas.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between pb-1" style={{ borderBottom: `1px solid rgba(122,78,45,0.18)` }}>
              <dt style={{ color: C.suave }}>{k}</dt>
              <dd className="num text-2xl font-extrabold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/**
 * Compartir el corte como imagen PNG.
 * La tarjeta vive fuera de pantalla; html-to-image la "fotografía" y se comparte o se descarga.
 */
export default function ShareCorte({ corte, fecha }) {
  const ref = useRef(null);
  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState('');

  const generar = () => htmlToImage.toPng(ref.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#fff8e8' });

  async function descargar() {
    setTrabajando(true);
    setAviso('');
    try {
      const a = document.createElement('a');
      a.href = await generar();
      a.download = `corte-${corte.fechaDia ?? corte.id}.png`;
      a.click();
    } catch {
      setAviso('No se pudo crear la imagen. Intenta otra vez.');
    }
    setTrabajando(false);
  }

  async function compartir() {
    setTrabajando(true);
    setAviso('');
    try {
      const blob = await (await fetch(await generar())).blob();
      const file = new File([blob], 'corte.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Corte - Tortillería Única | Eduardo's", text: fecha });
      } else {
        // Sin menú de compartir (computadora): se guarda la imagen
        await descargar();
      }
    } catch (e) {
      if (e?.name !== 'AbortError') setAviso('No se pudo compartir. Prueba con "Guardar imagen".');
    }
    setTrabajando(false);
  }

  return (
    <div>
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div ref={ref}>
          <TarjetaCorte corte={corte} fecha={fecha} />
        </div>
      </div>

      {aviso && (
        <p role="alert" className="tone-bad mb-2 flex items-center gap-2 font-semibold text-(--tone)">
          <PiWarningFill className="size-5 shrink-0" aria-hidden /> {aviso}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={compartir} disabled={trabajando} className="btn btn-big btn-liquid gap-2">
          {trabajando ? <span className="loading loading-spinner" /> : <PiShareNetworkBold className="size-6" aria-hidden />}
          Compartir
        </button>
        <button type="button" onClick={descargar} disabled={trabajando} className="btn btn-big btn-glass gap-2">
          <PiDownloadSimpleBold className="size-6" aria-hidden /> Guardar imagen
        </button>
      </div>
    </div>
  );
}
