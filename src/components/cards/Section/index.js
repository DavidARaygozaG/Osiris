'use client';

import { motion } from 'motion/react';
import { useScrollReveal, fadeUp } from '@/hooks/useScrollReveal';
import styles from './Section.module.css';

/**
 * Wrapper animado reutilizable. Renderiza un <motion.section> con fade-up al
 * entrar en viewport. Acepta `as`, `className`, `delay` y `title` opcional.
 */
export default function Section({ children, className = '', delay = 0, title, icon, action, ...rest }) {
  const { ref, inView } = useScrollReveal();
  return (
    <motion.section
      ref={ref}
      className={`${styles.section} ${className}`}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={fadeUp}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      {...rest}
    >
      {title && (
        <header className={styles.header}>
          <span className={styles.title}>
            {icon && <span className={styles.icon}>{icon}</span>}
            {title}
          </span>
          {action && <div className={styles.action}>{action}</div>}
        </header>
      )}
      {children}
    </motion.section>
  );
}
