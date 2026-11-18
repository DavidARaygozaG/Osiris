import { PiWarningCircleFill } from 'react-icons/pi';

/**
 * Campo de formulario: etiqueta visible + control + error en línea.
 * El <label> envuelve al control, así queda asociado sin necesitar ids.
 * Úsalo con: <input className="input w-full h-14 text-lg" /> o <select className="select w-full h-14 text-lg">.
 */
export default function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block font-semibold">{label}</span>
        {children}
      </label>
      {error ? (
        <p role="alert" className="mt-1.5 flex items-center gap-1.5 font-semibold text-chile">
          <PiWarningCircleFill className="size-5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-ink-soft">{hint}</p>
      )}
    </div>
  );
}
