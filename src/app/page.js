import { FaHistory, FaBox, FaUserShield } from 'react-icons/fa';
import ActionCard from '@/components/cards/ActionCard';
import BottomNav from '@/components/navigation/BottomNav';
import HomeActions from '@/components/HomeActions';
import styles from './index.module.css';

export default function Home() {
  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <>
      <main className={styles.page}>
        <div className={styles.pageTitle}>
          <header className={styles.header}>
            <span className={styles.greeting}>Bienvenido</span>
            <h1 className={styles.title}>
              Tortillleria Unica | Eduardo's <span className={styles.titleAccent}>·</span>
            </h1>
          </header>
          <span className={styles.dateChip}>📅 {today}</span>
        </div>
        <p className={styles.sectionLabel}>Navegación</p>
        <HomeActions />
        <div className={styles.grid}>
          <ActionCard href="/historial" icon={FaHistory} iconBg={'#eee'} title="Historial" />
          <ActionCard href="/inventario" iconBg={'#eee'} icon={FaBox} title="Inventario" />
          <ActionCard href="/admin" iconBg={'#eee'} icon={FaUserShield} title="Admin" />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
