'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import BottomNav from '@/components/navigation/BottomNav';
import styles from './Inventario.module.css';
import { Loader } from '@mantine/core';

const EMOJI_MAP = {
  Salsas: '🌶️',
  Frijoles: '🫘',
  Molcajete: '🪨',
  Arroz: '🍚',
  Sopes: '🫓',
  Guacamoles: '🥑',
  Totopos: '🔺',
  Jarochas: '🥜',
  default: '📦',
};

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [harinaStock, setHarinaStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/productos').then(r => (r.ok ? r.json() : [])), fetch('/api/harina/stock').then(r => (r.ok ? r.json() : { stock: 0 }))])
      .then(([prods, harina]) => {
        setProductos(Array.isArray(prods) ? prods : []);
        setHarinaStock(harina?.stock ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>📦 Inventario</h1>
          <p className={styles.sub}>Stock actual · Solo lectura</p>
        </header>

        {/* Harina */}
        {harinaStock !== null && (
          <motion.div className={styles.harinaCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <span className={styles.harinaIcon}>🌾</span>
            <div className={styles.harinaInfo}>
              <span className={styles.harinaLabel}>Harina disponible</span>
              <span className={styles.harinaStock}>{harinaStock} bultos</span>
            </div>
            <span className={`${styles.stockBadge} ${harinaStock > 5 ? styles.ok : harinaStock > 2 ? styles.warn : styles.low}`}>
              {harinaStock > 5 ? '✅ OK' : harinaStock > 2 ? '⚠️ Poco' : '🔴 Bajo'}
            </span>
          </motion.div>
        )}

        {loading ? (
          <Loader size={50} color="green" className="absolute top-1/2 left-1/2" />
        ) : (
          <div className={styles.grid}>
            {productos.map((p, i) => {
              const emoji = EMOJI_MAP[p.nombre] ?? EMOJI_MAP.default;
              const level = p.stock > 10 ? 'ok' : p.stock > 3 ? 'warn' : 'low';
              return (
                <motion.div key={p.id} className={styles.card} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <span className={styles.cardEmoji}>{emoji}</span>
                  <span className={styles.cardNombre}>{p.nombre}</span>
                  <span className={styles.cardPrecio}>${Number(p.precio).toLocaleString('es-MX')}</span>
                  <div className={styles.stockRow}>
                    <span className={styles.stockNum}>{p.stock}</span>
                    <span className={`${styles.stockDot} ${styles[level]}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
