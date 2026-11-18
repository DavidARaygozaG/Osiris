import { metaProducto } from '@/lib/productos';

/**
 * Emoji del producto, suelto (sin caja) y con sombra suave. Se lee al instante qué producto es.
 * size: 'sm' | 'md' | 'lg'. Úsalo en listas, resumen y detalle.
 */
const SIZES = { sm: 'size-8 text-2xl', md: 'size-11 text-[2rem]', lg: 'size-16 text-5xl' };

export default function ProductoIcon({ nombre, size = 'md', className = '' }) {
  const { emoji } = metaProducto(nombre);
  return (
    <span className={`perla ${SIZES[size]} ${className}`} role="img" aria-label={nombre}>
      <span aria-hidden>{emoji}</span>
    </span>
  );
}
