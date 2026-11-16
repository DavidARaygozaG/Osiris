import styles from './GlassCard.module.css';

export default function GlassCard({ children, className, onClick }) {
  return (
    <div className={`${styles.glassCard} ${className ?? ''}`} onClick={onClick}>
      {children}
    </div>
  );
}
