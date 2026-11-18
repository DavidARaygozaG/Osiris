'use client';

import { motion } from 'motion/react';
import Glass from './Glass';

/** Estado vacío / error: una frase clara + qué hacer. `floating` hace flotar el icono suavemente. */
export default function EmptyState({ icon: Icon, title, text, action, floating = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 240, damping: 24 }}>
      <Glass className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        {Icon && (
          <Icon className={`size-16 text-cafe drop-shadow-md ${floating ? 'float' : ''}`} aria-hidden />
        )}
        <h2 className="text-xl font-extrabold">{title}</h2>
        {text && <p className="max-w-xs text-ink-soft">{text}</p>}
        {action}
      </Glass>
    </motion.div>
  );
}
