'use client';

import { useId, useState } from 'react';
import { motion } from 'motion/react';
import { PiCheckCircleFill, PiWarningFill, PiArrowCircleUpFill } from 'react-icons/pi';
import { money, fechaCorta, fechaLarga } from '@/lib/format';
import StatusBadge from '@/components/ui/StatusBadge';

// Gráficas hechas a mano con CSS/SVG simple (sin librerías): se entienden más rápido y pesan nada.
// Reglas: serie principal en verde, "Sobró" en maíz (destello), "faltó" con RAYAS + icono (no solo color).
// Todo con tokens (var(--c-*)) para que funcione igual en claro y oscuro.

/** El API guarda 'cuadro' | 'falto' | 'sobro' (antes 'coincidio'); aquí se normaliza */
export const tonoDe = estado => (estado === 'falto' ? 'bad' : estado === 'sobro' ? 'warn' : 'ok');

const RAYAS = {
  backgroundImage: 'repeating-linear-gradient(135deg, var(--c-chile) 0 4px, color-mix(in oklab, var(--c-chile) 45%, transparent) 4px 8px)',
};
const VERDE = { backgroundImage: 'linear-gradient(180deg, var(--c-nopal-light), var(--c-nopal))' };
const MAIZ = { background: 'var(--c-maiz)' };
// "Sobró": barra verde con una tapa amarilla arriba (destello pequeño, no una barra amarilla entera)
const SOBRO_BARRA = {
  backgroundImage: 'linear-gradient(var(--c-maiz), var(--c-maiz)), linear-gradient(180deg, var(--c-nopal-light), var(--c-nopal))',
  backgroundSize: '100% 6px, 100% 100%',
  backgroundRepeat: 'no-repeat',
};
const estiloBarra = estado => (estado === 'falto' ? RAYAS : estado === 'sobro' ? SOBRO_BARRA : VERDE);

/**
 * Barras de ventas por día. Crecen desde 0 con resorte escalonado; al tocar una,
 * un "barrido" de selección (layoutId) se desliza hasta ella y muestra su día exacto.
 * data: [{ fecha, ventas, estado }] de más viejo a más nuevo.
 */
export function VentasBars({ data, alto = 'h-44' }) {
  const uid = useId();
  const [sel, setSel] = useState(null);
  const max = Math.max(...data.map(d => d.ventas), 1);
  const promedio = data.reduce((a, d) => a + d.ventas, 0) / (data.length || 1);
  const idx = Math.min(sel ?? data.length - 1, data.length - 1); // por si el periodo cambió
  const actual = data[idx];

  if (!data.length) return null;

  return (
    <figure>
      <figcaption className="mb-3 flex min-h-11 flex-wrap items-center justify-between gap-2">
        <span className="inline-block font-semibold first-letter:uppercase">{fechaLarga(actual.fecha)}</span>
        <span className="flex items-center gap-2">
          <span className="num text-2xl font-extrabold">{money(actual.ventas)}</span>
          <StatusBadge key={`${idx}-${actual.estado}`} estado={actual.estado} />
        </span>
      </figcaption>

      <div className={`relative ${alto}`}>
        {/* Línea del promedio con etiqueta directa; se traza de izquierda a derecha */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-10 origin-left border-t-2 border-dashed border-ink/40"
          style={{ bottom: `${(promedio / max) * 100}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          <span className="num absolute right-0 -top-7 rounded-lg bg-field px-2 py-0.5 text-sm font-bold">Promedio {money(promedio)}</span>
        </motion.div>
        <div className="flex h-full items-end gap-0.5">
          {data.map((d, i) => {
            const activo = idx === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSel(i)}
                aria-label={`${fechaCorta(d.fecha)}: ${money(d.ventas)}${d.estado === 'falto' ? ', faltó dinero' : ''}`}
                aria-pressed={activo}
                className="relative flex h-full min-w-0 flex-1 items-end rounded-sm">
                {/* Barrido de selección: una franja que viaja de barra en barra */}
                {activo && (
                  <motion.span
                    layoutId={`${uid}-sel`}
                    className="absolute inset-x-0 -inset-y-1 rounded-md bg-ink/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                {/* Solo se anima transform (scaleY): barato para el teléfono */}
                <motion.span
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: Math.min(i * 0.015, 0.6), type: 'spring', stiffness: 200, damping: 18 }}
                  className={`relative block w-full origin-bottom rounded-t-md ${activo ? 'outline-2 outline-ink' : ''}`}
                  style={{ ...estiloBarra(d.estado), height: `${Math.max((d.ventas / max) * 100, 3)}%` }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex justify-between text-sm text-ink-soft">
        <span>{fechaCorta(data[0].fecha)}</span>
        <span>{fechaCorta(data[data.length - 1].fecha)}</span>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded" style={VERDE} aria-hidden /> Venta del día
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded" style={MAIZ} aria-hidden /> Sobró
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-4 rounded" style={RAYAS} aria-hidden />
          <PiWarningFill className="size-4 text-chile" aria-hidden /> Faltó dinero
        </span>
      </p>
    </figure>
  );
}

/** Barra apilada: cuántos días cuadró / faltó / sobró, con conteo y porcentaje en texto. */
export function CuadreBar({ cuadro = 0, falto = 0, sobro = 0 }) {
  const total = cuadro + falto + sobro;
  if (!total) return null;
  const partes = [
    { n: cuadro, label: 'Cuadró', Icon: PiCheckCircleFill, estilo: VERDE, tono: 'tone-ok' },
    { n: falto, label: 'Faltó', Icon: PiWarningFill, estilo: RAYAS, tono: 'tone-bad' },
    { n: sobro, label: 'Sobró', Icon: PiArrowCircleUpFill, estilo: MAIZ, tono: 'tone-warn' },
  ];
  return (
    <div>
      <div className="flex h-8 w-full gap-0.5 overflow-hidden rounded-xl" role="img" aria-label={`${cuadro} cuadraron, ${falto} faltaron, ${sobro} sobraron`}>
        {partes.map(
          (p, i) =>
            p.n > 0 && (
              <motion.span
                key={p.label}
                className="block origin-left"
                style={{ ...p.estilo, width: `${(p.n / total) * 100}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 150, damping: 20, delay: i * 0.12 }}
              />
            )
        )}
      </div>
      <ul className="mt-3 grid gap-2">
        {partes.map(p => (
          <li key={p.label} className="flex items-center justify-between gap-3">
            <span className={`${p.tono} flex items-center gap-2 font-bold text-(--tone)`}>
              <p.Icon className="size-6" aria-hidden />
              {p.label}
            </span>
            <span className="num text-xl font-extrabold">
              {p.n} <span className="text-base font-semibold text-ink-soft">({Math.round((p.n / total) * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barras horizontales de reparto (ej. tortilla vs productos). items: [{ label, value, className }] */
export function ReparteBars({ items }) {
  const total = items.reduce((a, i) => a + i.value, 0);
  return (
    <ul className="grid gap-4">
      {items.map((it, i) => {
        const pct = total ? (it.value / total) * 100 : 0;
        return (
          <li key={it.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="font-semibold">{it.label}</span>
              <span className="num text-xl font-extrabold">
                {money(it.value)} <span className="text-base font-semibold text-ink-soft">{Math.round(pct)}%</span>
              </span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-ink/10">
              <motion.div
                className={`h-full origin-left rounded-full ${it.className}`}
                style={{ width: `${pct}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 130, damping: 20, delay: 0.1 + i * 0.12 }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
