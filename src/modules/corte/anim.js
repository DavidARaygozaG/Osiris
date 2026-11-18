// Animación compartida: UNA entrada orquestada por pantalla (mismo patrón que HomeActions).
// El contenedor escalona a sus hijos; cada hijo sube con blur (solo opacity + transform + filter).
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export const lista = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const fila = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

// Filas que se agregan / quitan (úsalo con AnimatePresence + layout):
//   <motion.li layout="position" {...entraSale}>
export const entraSale = {
  initial: { opacity: 0, y: 16, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 260, damping: 24 } },
  exit: { opacity: 0, scale: 0.96, filter: 'blur(4px)', transition: { duration: 0.2 } },
};

// Pulsación de botones y filas
export const toque = { scale: 0.96 };
