import CorteModule from '@/modules/corte';

export const metadata = { title: 'Cuenta del día · Osiris' };

// Server Component mínimo: toda la interactividad vive en el módulo (Client Component).
export default function CortePage() {
  return <CorteModule />;
}
