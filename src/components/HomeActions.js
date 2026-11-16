'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCorteStore } from '@/stores/useCorteStore';
import HarinaModal from './modals/HarinaModal';
import styles from './HomeActions.module.css';
import { GiFlour } from 'react-icons/gi';
import { AiTwotoneExperiment, AiTwotoneFileAdd } from 'react-icons/ai';

export default function HomeActions() {
  const router = useRouter();
  const setModo = useCorteStore(s => s.setModo);
  const [showHarina, setShowHarina] = useState(false);

  const irACorte = modo => {
    setModo(modo);
    router.push('/corte');
  };

  return (
    <>
      <div className={styles.mainButtons}>
        <motion.button className={styles.btnCorte} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => irACorte('corte')}>
          <motion.div whileHover={{ scale: 1.1, y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <AiTwotoneFileAdd className={styles.btnIcon} />
          </motion.div>
          <div className={styles.btnText}>
            <span className={styles.btnTitle}>Hacer Cuenta</span>
            <span className={styles.btnSub}>Cierra y guarda el día</span>
          </div>
        </motion.button>

        <motion.button className={styles.btnCalcular} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => irACorte('calcular')}>
          <motion.div whileHover={{ scale: 1.1, y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <AiTwotoneExperiment className={styles.btnIcon} />
          </motion.div>
          <div className={styles.btnText}>
            <span className={styles.btnTitle}>Calcular</span>
            <span className={styles.btnSub}>Simula sin guardar</span>
          </div>
        </motion.button>

        <motion.button className={styles.btnHarina} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setShowHarina(true)}>
          <motion.div whileHover={{ scale: 1.1, y: -3 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <GiFlour className={styles.iconHarina} />
          </motion.div>
          <span className={styles.titleHarina}>Harina</span>
        </motion.button>

        <AnimatePresence>{showHarina && <HarinaModal onClose={() => setShowHarina(false)} />}</AnimatePresence>
      </div>
    </>
  );
}
