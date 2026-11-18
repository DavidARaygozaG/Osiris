/** Etiqueta de estado pequeña: siempre icono + texto. tone: 'ok' | 'bad' | 'warn' | 'neutral' */
export default function Pill({ tone = 'neutral', icon: Icon, children }) {
  // Las clases tone-* definen --tone y --tone-bg (ver globals.css)
  const cls = tone === 'neutral' ? 'bg-ink/10 text-ink-soft' : `tone-${tone} bg-(--tone-bg) text-(--tone)`;
  return (
    <span className={`${cls} inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[0.9375rem] font-bold`}>
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
    </span>
  );
}
