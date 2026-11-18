import Link from 'next/link';
import { PiCaretLeftBold } from 'react-icons/pi';
import Dock from './Dock';

/**
 * Estructura estándar de cada vista.
 *  - title / subtitle: encabezado
 *  - back: ruta a la que regresa el botón "atrás" (opcional)
 *  - action: nodo a la derecha del encabezado (opcional)
 *  - dock: muestra la barra inferior (por defecto sí)
 */
export default function Page({ title, subtitle, back, action, dock = true, children, className = '' }) {
  return (
    <>
      <main id="contenido" className={`mx-auto w-full max-w-xl flex-1 px-4 pt-safe ${dock ? 'pb-32' : 'pb-8'} ${className}`}>
        <header className="mb-5 flex items-start gap-3 pt-2">
          {back && (
            <Link
              href={back}
              aria-label="Regresar"
              className="btn btn-ghost mt-0.5 size-12 min-h-12 px-0 text-ink">
              <PiCaretLeftBold className="size-5" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-[2rem] font-extrabold leading-[1.05]">{title}</h1>
            {subtitle && <p className="mt-1 text-ink-soft">{subtitle}</p>}
          </div>
          {action}
        </header>
        {children}
      </main>
      {dock && <Dock />}
    </>
  );
}
