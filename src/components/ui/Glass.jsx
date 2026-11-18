import { cn } from '@/lib/utils';

/**
 * Superficie de cristal. Úsala como contenedor principal de cualquier bloque.
 * variant: 'default' | 'strong' (más opaca, para mucho texto) | 'liquid' (refracta; 1 por pantalla)
 * as: etiqueta HTML ('section', 'article', 'div'…)
 */
export default function Glass({ as: Tag = 'div', variant = 'default', className, children, ...props }) {
  return (
    <Tag className={cn('glass', variant === 'strong' && 'glass-strong', variant === 'liquid' && 'glass-liquid', className)} {...props}>
      {children}
    </Tag>
  );
}
