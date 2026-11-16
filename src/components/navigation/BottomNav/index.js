'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdHome, MdReceiptLong, MdInventory2, MdAdminPanelSettings } from 'react-icons/md';
import styles from './BottomNav.module.css';

const links = [
  { href: '/',           label: 'Inicio',     icon: MdHome },
  { href: '/historial',  label: 'Historial',  icon: MdReceiptLong },
  { href: '/inventario', label: 'Inventario', icon: MdInventory2 },
  { href: '/admin',      label: 'Admin',      icon: MdAdminPanelSettings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {links.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}>
            <span className={styles.navIcon}><Icon /></span>
            {label}
            {active && <span className={styles.activeDot} />}
          </Link>
        );
      })}
    </nav>
  );
}
