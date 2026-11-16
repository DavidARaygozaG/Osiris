import { MdArrowBack, MdArrowForward, MdSave } from 'react-icons/md';
import styles from './NavButton.module.css';

export default function NavButtons({ paso, onBack, onNext, onSave, saving, hideSave = false }) {
  const isLast = paso === 6;
  return (
    <div className={styles.wrapper}>
      {paso > 1 && (
        <button className={`${styles.btn} ${styles.btnBack}`} onClick={onBack}>
          <MdArrowBack /> Anterior
        </button>
      )}
      {!isLast ? (
        <button className={`${styles.btn} ${styles.btnNext}`} onClick={onNext}>
          Siguiente <MdArrowForward />
        </button>
      ) : !hideSave ? (
        <button className={`${styles.btn} ${styles.btnSave}`} onClick={onSave} disabled={saving}>
          <MdSave /> {saving ? 'Guardando...' : 'Guardar corte'}
        </button>
      ) : null}
    </div>
  );
}
