import Link from 'next/link';
import { MdArrowForwardIos } from 'react-icons/md';
import styles from './ActionCard.module.css';

export default function ActionCard({ href, icon: Icon, iconBg, title, description }) {
  return (
    <Link href={href} style={{ backdropFilter: 'blur(8px)', background: '#fff1' }} className={styles.card}>
      <div className={styles.iconWrapper} style={{ color: iconBg }}>
        <Icon />
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      <MdArrowForwardIos className={styles.arrow} />
    </Link>
  );
}
