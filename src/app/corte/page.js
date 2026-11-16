import Link from 'next/link';
import { MdArrowBack } from 'react-icons/md';
import CorteModule from '@/modules/corte/index.js';
import styles from './corte.module.css';

export default function CortePage() {
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backBtn}>
          <MdArrowBack />
        </Link>
        <div className={styles.headerText}>
          <h1>Corte del día</h1>
          <p>{today}</p>
        </div>
      </header>
      <CorteModule />
    </main>
  );
}
