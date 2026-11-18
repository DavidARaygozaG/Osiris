'use client';

import { motion } from 'motion/react';

/**
 * Entrada escalonada con blur: el padre (<Stagger>) escalona a sus hijos (<StaggerItem>).
 * Solo anima opacity/transform/filter. Con "menos movimiento" el MotionConfig del padre lo reduce.
 *
 * <Stagger className="grid gap-4">
 *   <StaggerItem>…</StaggerItem>
 *   <StaggerItem as="li">…</StaggerItem>
 * </Stagger>
 */
const contenedor = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

const TAGS = { div: motion.div, ul: motion.ul, li: motion.li, section: motion.section };

export function Stagger({ as = 'div', className, children, ...props }) {
  const Tag = TAGS[as] ?? motion.div;
  return (
    <Tag variants={contenedor} initial="hidden" animate="show" className={className} {...props}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ as = 'div', className, children, ...props }) {
  const Tag = TAGS[as] ?? motion.div;
  return (
    <Tag variants={item} className={className} {...props}>
      {children}
    </Tag>
  );
}
