'use client';

import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Glass from '@/components/ui/Glass';
import { money } from '@/lib/format';

const entero = v => String(Math.round(v));

/**
 * Cifra grande con su etiqueta. Si `value` es número, rueda desde 0 (format: money por defecto).
 * Si es texto (ej. "—") se muestra tal cual. Un solo nivel de cristal.
 */
export default function Kpi({ icon: Icon, label, value, format = money, sub, tone }) {
  const tono = tone === 'bad' ? 'tone-bad text-(--tone)' : tone === 'ok' ? 'tone-ok text-(--tone)' : '';
  return (
    <Glass className="flex flex-col gap-1 p-4">
      <span className="flex items-center gap-2 font-semibold text-ink-soft">
        {Icon && <Icon className="size-6 shrink-0 text-cafe" aria-hidden />}
        {label}
      </span>
      <span className={`num truncate text-3xl font-extrabold ${tono}`}>
        {typeof value === 'number' ? <AnimatedNumber value={value} from={0} format={format} /> : value}
      </span>
      {sub && <span className="text-ink-soft">{sub}</span>}
    </Glass>
  );
}

export { entero };
