'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useCorteStore } from '@/stores/useCorteStore';
import StepIndicator from '@/components/navigation/Stepper';
import NavButtons from '@/components/navigation/NavButton';
import Productos from './Productos';
import Proveedores from './Proveedores';
import Harina from './Harina';
import Gastos from './Gastos';
import Caja from './Caja';
import Summary from './Summary';
import styles from './styles/corteModule.module.css';

const pasoComponents = {
  1: Productos,
  2: Proveedores,
  3: Harina,
  4: Gastos,
  5: Caja,
  6: Summary,
};

const pasoTitles = {
  1: { title: 'Inventario del día', sub: '¿Cuánto se vendió de cada uno?' },
  2: { title: 'Proveedores', sub: '¿Quién pasó hoy y qué dejó?' },
  3: { title: 'Tandas de tortilla', sub: '¿Como las hecharon?' },
  4: { title: 'Gastos extra', sub: 'Gastos y Tortilla Sobrante' },
  5: { title: 'Dinero en caja', sub: '¿Cuánto dinero hay?' },
  6: { title: 'Resumen del corte', sub: 'Verifica todo antes de guardar' },
};

export default function CorteModule() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null); // 'ya_existe' | null
  const { paso, modo, nextPaso, prevPaso, setModo, calcularTotales, reset, ...state } = useCorteStore();

  const PasoActual = pasoComponents[paso];
  const { title, sub } = pasoTitles[paso];
  const esModoCalculo = modo === 'calcular';

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const totales = calcularTotales();
    const body = {
      productos: state.productos,
      proveedores: state.proveedores,
      tandas: state.tandas,
      gastosExtra: state.gastosExtra,
      dineroEnCaja: state.dineroEnCaja,
      notas: state.notas,
      ...totales,
    };

    try {
      const res = await fetch('/api/corte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 409) {
        setError('ya_existe');
        return;
      }
      if (res.ok) {
        reset();
        router.push('/historial');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Banner modo cálculo */}
      <AnimatePresence>
        {esModoCalculo && (
          <motion.div className={styles.calculoBanner} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            📊 Modo cálculo — los datos <strong>no se guardarán</strong>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner error ya existe */}
      <AnimatePresence>
        {error === 'ya_existe' && (
          <motion.div className={styles.errorBanner} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            ⚠️ Ya se registró el corte de hoy. Solo el admin puede modificarlo.
          </motion.div>
        )}
      </AnimatePresence>

      <StepIndicator pasoActual={paso} />

      <div className={styles.card}>
        <h2 className={styles.pasoTitle}>{title}</h2>
        <p className={styles.pasoSubtitle}>{sub}</p>
        <PasoActual />
      </div>

      {/* En paso 6 + modo cálculo → botón convertir */}
      <AnimatePresence>
        {esModoCalculo && paso === 6 && (
          <motion.button
            className={styles.convertirBtn}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModo('corte')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}>
            🧾 Convertir en corte real
          </motion.button>
        )}
      </AnimatePresence>

      <NavButtons paso={paso} onBack={prevPaso} onNext={nextPaso} onSave={handleSave} saving={saving} hideSave={esModoCalculo} />
    </div>
  );
}
