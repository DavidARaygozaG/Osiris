'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCorteStore } from '@/stores/useCorteStore';

/**
 * Carga productos y proveedores UNA vez para todo el wizard.
 * estado: 'cargando' | 'listo' | 'error'
 */
export function useCatalogo() {
  const setProductosInfo = useCorteStore(s => s.setProductosInfo);
  const setPrecios = useCorteStore(s => s.setPrecios);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    const get = url =>
      fetch(url).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });

    // Los precios de Ajustes son opcionales: si no cargan, valen los de por defecto
    const precios = get('/api/admin/config').catch(() => ({}));

    Promise.all([get('/api/productos'), get('/api/proveedores'), precios])
      .then(([prods, provs, cfg]) => {
        if (!vivo) return;
        if (!Array.isArray(prods) || !Array.isArray(provs)) throw new Error('formato');
        setProductos(prods);
        setProveedores(provs);
        setPrecios({
          bulto: Number(cfg?.precio_bulto_harina) || undefined,
          merma: Number(cfg?.precio_kg_merma) || undefined,
        });
        // Precios al store: calcularTotales() los necesita
        setProductosInfo(Object.fromEntries(prods.map(p => [p.id, { nombre: p.nombre, precio: p.precio }])));
        setEstado('listo');
      })
      .catch(() => vivo && setEstado('error'));

    return () => {
      vivo = false;
    };
  }, [intento, setProductosInfo, setPrecios]);

  const reintentar = useCallback(() => {
    setEstado('cargando');
    setIntento(i => i + 1);
  }, []);

  return { productos, proveedores, estado, reintentar };
}
