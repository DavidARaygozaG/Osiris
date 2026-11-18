'use client';

import { useEffect, useState } from 'react';
import { PiTargetDuotone, PiPencilSimpleDuotone, PiWarningFill } from 'react-icons/pi';
import Glass from '@/components/ui/Glass';
import Sheet from '@/components/ui/Sheet';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import LiquidGauge from '@/components/ui/LiquidGauge';
import { NumPad } from '@/components/ui/MoneyField';
import { money } from '@/lib/format';
import { useAdminStore } from '@/stores/useAdminStore';

const META_INICIAL = 50000;
const pctTxt = v => `${Math.round(v)}%`; // estable: AnimatedNumber no reinicia

/**
 * Meta del mes: medidor líquido (hoja protagonista de la pantalla) + frase clara.
 * La meta vive en /api/admin/config (key: meta_mensual).
 */
export default function MetaMensual({ totalVentas, year, month }) {
  const [meta, setMeta] = useState(null);
  const esAdmin = useAdminStore(s => s.isAdmin);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let vivo = true;
    fetch('/api/admin/config')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(cfg => vivo && setMeta(Number(cfg.meta_mensual) || META_INICIAL))
      .catch(() => vivo && setMeta(META_INICIAL));
    return () => {
      vivo = false; // evita setState si la vista ya se cerró
    };
  }, []);

  async function guardar(valor) {
    if (!valor || valor <= 0) return setError('Escribe una meta mayor a cero.');
    try {
      const r = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'meta_mensual', value: valor }),
      });
      if (!r.ok) throw new Error();
      setMeta(valor);
      setError('');
      setEditando(false);
    } catch {
      setError('No se pudo guardar la meta. Revisa tu internet e intenta otra vez.');
    }
  }

  if (meta == null) return <div className="skeleton h-44 w-full rounded-2xl" aria-label="Cargando meta" />;

  const pct = Math.min(Math.round((totalVentas / meta) * 100), 100);
  const faltan = Math.max(meta - totalVentas, 0);
  const hoy = new Date();
  const enMes = hoy.getFullYear() === year && hoy.getMonth() === month;
  const totalDias = new Date(year, month + 1, 0).getDate();
  const diasQuedan = Math.max(totalDias - (enMes ? hoy.getDate() : totalDias), 1);

  const frase =
    faltan === 0
      ? 'Ya llegaste a la meta de este mes.'
      : enMes
        ? `Para llegar, vende ${money(faltan / diasQuedan)} cada día que queda.`
        : `Ese mes cerraste en ${pct}% de la meta.`;

  return (
    <Glass as="section" aria-label="Meta del mes" className="glass-liquid p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <PiTargetDuotone className="size-8 text-cafe drop-shadow-sm" aria-hidden /> Meta del mes
        </h2>
        {/* Solo el admin puede cambiar la meta (el servidor también lo exige) */}
        {esAdmin && (
          <button type="button" onClick={() => setEditando(true)} className="btn btn-ghost min-h-14 gap-2 px-3 text-base font-bold">
            <PiPencilSimpleDuotone className="size-6 text-cafe" aria-hidden /> Cambiar
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <LiquidGauge value={pct} size={104} label={`Meta del mes al ${pct} por ciento`} />
        <div className="min-w-0 flex-1">
          <p className="text-ink-soft">Llevas</p>
          <p className="num text-4xl font-extrabold leading-tight">
            <AnimatedNumber value={totalVentas} from={0} />
          </p>
          <p className="text-ink-soft">
            <span className="num font-bold text-ink">
              <AnimatedNumber value={pct} from={0} format={pctTxt} />
            </span>{' '}
            de {money(meta)}
            {faltan > 0 && <span className="block text-sm">Te faltan {money(faltan)}</span>}
          </p>
        </div>
      </div>
      <p className="mt-3 border-t border-ink/10 pt-3 text-ink-soft">{frase}</p>

      <Sheet open={editando} onClose={() => setEditando(false)} title="Meta de ventas del mes">
        {error && (
          <p role="alert" className="tone-bad mb-3 flex items-center gap-2 font-semibold text-(--tone)">
            <PiWarningFill className="size-5 shrink-0" aria-hidden /> {error}
          </p>
        )}
        <NumPad initial={meta} confirmLabel="Guardar meta" onConfirm={guardar} />
      </Sheet>
    </Glass>
  );
}
