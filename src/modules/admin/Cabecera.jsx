'use client';

import AnimatedNumber from '@/components/ui/AnimatedNumber';
import Glass from '@/components/ui/Glass';

/** Hoja protagonista de cada pestaña (cristal líquido): icono, cifra grande que rueda y una frase. */
export default function Cabecera({ icon: Icon, label, value, format, sub, children }) {
  return (
    <Glass as="section" className="glass-liquid flex items-center gap-4 p-5">
      <Icon className="size-12 shrink-0 text-cafe drop-shadow-md" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-ink-soft">{label}</p>
        <p className="num truncate text-4xl font-extrabold leading-tight">
          <AnimatedNumber value={value} from={0} format={format} />
        </p>
        {sub && <p className="text-ink-soft">{sub}</p>}
      </div>
      {children}
    </Glass>
  );
}
