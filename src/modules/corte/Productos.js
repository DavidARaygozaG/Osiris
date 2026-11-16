'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCorteStore } from '@/stores/useCorteStore';
import styles from './styles/Productos.module.css';
import Image from 'next/image';
import { Loader } from '@mantine/core';

const PRODUCTO_META = {
  Salsas: { emoji: '🌶️', color: '#c00' },
  Frijoles: { emoji: '🫘', color: '#92400e' },
  Arroz: { emoji: '🍚', color: '#fff' },
  Totopos: { emoji: '🔺', color: '#f59e0b', svg: 'totopo' },
  Jarochas: { emoji: '🥜', color: '#d97706' },
  Molcajete: { emoji: '🪨', color: '#6b7280' },
  Guacamoles: { emoji: '🥑', color: '#65a30d' },
  Sopes: { emoji: '🫓', color: '#b47309' },
  Tostadas: { emoji: '🌽', color: '#65d30d' },
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [isloading, setIsloading] = useState(true);
  const { productos: cantidades, setProductoCantidad, setProductosInfo } = useCorteStore();

  useEffect(() => {
    fetch('/api/productos')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (!Array.isArray(data)) return;
        setProductos(data);
        const info = {};
        data.forEach(p => {
          info[p.id] = { nombre: p.nombre, precio: p.precio };
        });
        setProductosInfo(info);
      })
      .catch(err => console.error('[Productos] Error al cargar:', err))
      .finally(() => setIsloading(false));
  }, []);

  const cambiar = (id, delta) => {
    const actual = cantidades[id] ?? 0;
    setProductoCantidad(id, Math.max(0, actual + delta));
  };

  return (
    <div className={`${styles.grid}`}>
      {isloading && <Loader size={50} color="green" className="absolute top-1/2 left-1/2" />}
      {productos.map((p, i) => {
        const meta = PRODUCTO_META[p.nombre] ?? { emoji: '🛒', color: '#6ee7b7' };
        const cantidad = cantidades[p.id] ?? 0;

        return (
          <motion.div
            key={p.id}
            className={`${styles.item} ${cantidad > 0 ? styles.itemActive : ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            style={{ '--accent': meta.color }}>
            {/* Emoji animado */}
            <motion.span
              className={styles.emoji}
              animate={
                cantidad > 0
                  ? {
                      rotate: [0, -10, 10, -6, 6, 0],
                      scale: [1, 1.2, 1.1, 1.15, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
              key={cantidad}>
              {meta.svg ? <Image src={`/svg/${meta.svg}.svg`} width={30} height={30} alt={`${meta.svg}`} /> : meta.emoji}
            </motion.span>

            <span className={styles.nombre}>{p.nombre}</span>
            <span className={styles.precio}>${p.precio} c/u</span>

            <div className={styles.counter}>
              <motion.button className={styles.btnMinus} whileTap={{ scale: 0.8 }} onClick={() => cambiar(p.id, -1)} disabled={cantidad === 0}>
                −
              </motion.button>

              <AnimatePresence mode="popLayout">
                <motion.span
                  key={cantidad}
                  className={styles.cantidad}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}>
                  {cantidad}
                </motion.span>
              </AnimatePresence>

              <motion.button className={styles.btnPlus} whileTap={{ scale: 0.8 }} onClick={() => cambiar(p.id, +1)}>
                +
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
