'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { PiHouseDuotone, PiCalendarCheckDuotone, PiPackageDuotone } from 'react-icons/pi';

const items = [
  { href: '/', label: 'Inicio', Icon: PiHouseDuotone },
  { href: '/historial', label: 'Días', Icon: PiCalendarCheckDuotone },
  { href: '/inventario', label: 'Productos', Icon: PiPackageDuotone },
];

/**
 * Barra de navegación flotante de cristal. Solo 3 destinos: nada de menús escondidos.
 * La "gota" verde (layoutId) viaja de un destino a otro estirándose como líquido;
 * el icono activo da un pequeño salto.
 */
export default function Dock() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4">
      <ul className="glass-dock pointer-events-auto flex w-full max-w-sm items-center justify-between p-1.5">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="relative flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-[1.2rem] text-sm font-bold">
                {active && (
                  <motion.span
                    layoutId="dock-gota"
                    className="btn-liquid absolute inset-0 rounded-[1.2rem]"
                    transition={{ type: 'spring', stiffness: 380, damping: 26, mass: 0.8 }}
                  />
                )}
                <motion.span
                  className="relative"
                  animate={active ? { y: [0, -5, 0], scale: [1, 1.15, 1] } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.86 }}>
                  <Icon className={`size-7 ${active ? 'text-[color:var(--on-nopal)]' : 'text-ink-soft'}`} />
                </motion.span>
                <span className={`relative ${active ? 'text-[color:var(--on-nopal)]' : 'text-ink-soft'}`}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
