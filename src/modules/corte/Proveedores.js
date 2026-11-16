'use client';

import { useEffect, useState } from 'react';
import { useCorteStore } from '@/stores/useCorteStore';
import styles from './styles/Proveedores.module.css';
import { NumberInput } from '@mantine/core';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const { proveedores: data, setProveedor } = useCorteStore();

  useEffect(() => {
    fetch('/api/proveedores')
      .then(r => r.json())
      .then(setProveedores);
  }, []);

  const prov = id => ({ paso: false, dejo: 0, cobro: 0, ...data[id] });

  const handlePaso = (p, checked) => {
    setProveedor(p.id, { paso: checked });
    // Si tiene hijos, sincronizar su paso también
    p.hijos?.forEach(h => setProveedor(h.id, { paso: checked }));
  };

  return (
    <div className={styles.list}>
      {proveedores.map(p => (
        <div key={p.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.provName}>
              {p.nombre}
              {p.hijos?.length > 0 && <span className={styles.provSub}> · {p.hijos.map(h => h.nombre).join(' · ')}</span>}
            </span>
            <label className={styles.toggle}>
              Pasó
              <input type="checkbox" checked={prov(p.id).paso} onChange={e => handlePaso(p, e.target.checked)} />
            </label>
          </div>

          {prov(p.id).paso && (
            <div className={styles.fields}>
              {/* Dejó del padre */}
              <div className={styles.field}>
                <NumberInput label={`Dejó ${p.nombre}`} size="sm" value={prov(p.id).dejo | 0} onChange={value => setProveedor(p.id, { dejo: value })} />
              </div>

              {/* Dejó de cada hijo (ej. Arroz dentro de Salsas) */}
              {p.hijos?.map(h => (
                <div key={h.id} className={styles.field}>
                  <label className={styles.fieldLabel}>Dejó {h.nombre}</label>
                  <input type="number" className={styles.fieldInput} value={prov(h.id).dejo} onChange={e => setProveedor(h.id, { dejo: Number(e.target.value) })} />
                </div>
              ))}

              {/* Cobró — solo en el padre, es un solo pago */}
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <NumberInput
                  value={prov(p.id).cobro ?? 0}
                  label="Cobró"
                  prefix="$"
                  decimalScale={2}
                  step={0.1}
                  fixedDecimalScale
                  onChange={value => setProveedor(p.id, { cobro: value })}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
