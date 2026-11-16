import { MdCheck } from 'react-icons/md';
import styles from './Stepper.module.css';

const pasos = ['Productos', 'Proveed.', 'Tandas', 'Gastos', 'Caja', 'Resumen'];

export default function StepIndicator({ pasoActual }) {
  return (
    <div className={styles.wrapper}>
      {pasos.map((label, i) => {
        const num = i + 1;
        const isActive = num === pasoActual;
        const isCompleted = num < pasoActual;
        return (
          <div key={num} className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}>
            <div className={styles.circle}>{isCompleted ? <MdCheck /> : num}</div>
            <span className={styles.label}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
