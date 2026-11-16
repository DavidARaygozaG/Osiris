'use client';

import { useRef } from 'react';
import { useInView } from 'motion/react';

/**
 * Wrapper sobre useInView con defaults consistentes para reveals al scroll.
 * Devuelve { ref, inView } — pásalo a motion components con `animate` controlado.
 *
 * @example
 * const { ref, inView } = useScrollReveal();
 * <motion.div ref={ref} animate={inView ? 'show' : 'hidden'} variants={...} />
 */
export function useScrollReveal({ amount = 0.2, once = true, margin = '0px' } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount, once, margin });
  return { ref, inView };
}

// Variants reusables para fade-up
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export const stagger = (delay = 0.06) => ({
  hidden: {},
  show:   { transition: { staggerChildren: delay } },
});
