'use client';

import { useCorteStore } from '@/stores/useCorteStore';
import styles from './styles/Summary.module.css';

const fmt = n => `$${Number(n).toLocaleString('es-MX')}`;

export default function Summary() {
  const { calcularTotales, dineroEnCaja } = useCorteStore();
  const { totalBultos, ventaTortilla, ventaProductos, totalMerma, totalGastos, totalProveedores, totalVentas, deberiaHaber, diferencia } = calcularTotales();

  const estado = diferencia < 0 ? 'falto' : 'coincidio';
  const estadoEmoji = { coincidio: '✅', falto: '❌' };
  const estadoMsg = {
    coincidio: diferencia > 0 ? ` Sobró` : 'Coincidió perfecto',
    falto: `Faltaron ${fmt(Math.abs(diferencia))}`,
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.estadoBadge} ${styles[estado]}`}>
        <span>
          {estadoEmoji[estado]} {estadoMsg[estado]}
        </span>
        <p className="text-5xl my-6">{fmt(diferencia)}</p>
        <span className={`${styles.estadoSub} text-3xl`}>Diferencia: {fmt(diferencia)}</span>
      </div>

      <div className={styles.divider} />

      {[
        ['Bultos producidos', `${totalBultos.toFixed(2)} bultos`],
        ['Venta tortilla', fmt(ventaTortilla)],
        ['Venta productos', fmt(ventaProductos)],
        ['Total ventas', fmt(totalVentas)],
        ['SEP', ''],
        ['Merma tortilla', fmt(totalMerma)],
        ['Cobro proveedores', fmt(totalProveedores)],
        ['Gastos adicionales', fmt(totalGastos - totalMerma - totalProveedores)],
        ['Total gastos', fmt(totalGastos)],
        ['SEP2', ''],
        ['Debería haber', fmt(deberiaHaber)],
        ['Dinero en caja', fmt(dineroEnCaja)],
      ].map(([label, value], i) =>
        label.startsWith('SEP') ? (
          <div key={`sep-${i}`} className={styles.divider} />
        ) : (
          <div key={label} className={`${styles.row} ${['Total ventas', 'Total gastos', 'Debería haber'].includes(label) ? styles.rowBold : ''}`}>
            <span className={styles.rowLabel}>{label}</span>
            <span className={styles.rowValue}>{value}</span>
          </div>
        ),
      )}
    </div>
  );
}
