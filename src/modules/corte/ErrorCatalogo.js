import { PiWifiSlashDuotone, PiArrowClockwiseBold } from 'react-icons/pi';
import EmptyState from '@/components/ui/EmptyState';

/** Error de carga: dice qué pasó, qué hacer y que lo capturado no se pierde. */
export default function ErrorCatalogo({ que, onReintentar }) {
  return (
    <EmptyState
      icon={PiWifiSlashDuotone}
      title={`No se pudieron cargar ${que}`}
      text="Revisa que tengas internet y vuelve a intentar. Lo que ya capturaste no se pierde."
      action={
        <button type="button" onClick={onReintentar} className="btn btn-big btn-liquid mt-2">
          <PiArrowClockwiseBold className="size-5" aria-hidden /> Intentar otra vez
        </button>
      }
    />
  );
}
