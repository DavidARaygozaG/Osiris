'use client';

import { motion } from 'motion/react';
import { PiFlameDuotone, PiCalendarStarDuotone } from 'react-icons/pi';
import Glass from '@/components/ui/Glass';
import ProductoIcon from '@/components/ui/ProductoIcon';
import { money } from '@/lib/format';

const lista = { show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
const fila = {
  hidden: { opacity: 0, x: -16, filter: 'blur(4px)' },
  show: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

/** Hasta 3 frases legibles sobre el mes. Sin gráficas: solo lo que el dueño quiere saber. */
export default function InsightsCard({ stats }) {
  const { racha, mejorDia, productoEstrella, totalCortes } = stats;
  const frases = [];

  if (racha >= 3) frases.push({ key: 'racha', Icon: PiFlameDuotone, color: 'text-chile', texto: `Llevas ${racha} días seguidos en que la caja cuadra.` });
  if (mejorDia && totalCortes >= 3)
    frases.push({
      key: 'dia',
      Icon: PiCalendarStarDuotone,
      color: 'text-cafe',
      texto: `Los ${mejorDia.nombre} es cuando más vendes: ${money(mejorDia.prom)} en promedio.`,
    });
  if (productoEstrella && productoEstrella.subtotal > 0)
    frases.push({
      key: 'estrella',
      producto: productoEstrella.nombre,
      texto: `${productoEstrella.nombre} fue lo que más dinero dejó: ${money(productoEstrella.subtotal)} (${productoEstrella.cantidad} vendidos).`,
    });

  if (!frases.length) return null;

  return (
    <Glass as="section" aria-label="Lo que dejó el mes" className="flex flex-col gap-3 p-5">
      <h2 className="text-xl font-extrabold">Lo que dejó el mes</h2>
      <motion.ul variants={lista} initial="hidden" animate="show" className="flex flex-col gap-3">
        {frases.slice(0, 3).map(({ key, Icon, color, producto, texto }) => (
          <motion.li key={key} variants={fila} whileTap={{ scale: 0.98 }} className="glass-row flex items-center gap-3 p-3">
            {producto ? <ProductoIcon nombre={producto} size="md" /> : <Icon className={`size-10 shrink-0 drop-shadow-sm ${color}`} aria-hidden />}
            <p className="min-w-0 flex-1">{texto}</p>
          </motion.li>
        ))}
      </motion.ul>
    </Glass>
  );
}
