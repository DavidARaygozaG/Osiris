'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

/**
 * Lee una ruta GET y devuelve { status, data, error, reload }.
 * status: 'loading' | 'ok' | 'error'
 * Patrón: el setState ocurre dentro de la promesa (no en el cuerpo del efecto),
 * y `reload` conserva los datos viejos en pantalla mientras llegan los nuevos.
 */
export function useApi(url) {
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let vivo = true; // evita actualizar un componente ya desmontado
    api(url)
      .then(data => vivo && setState({ status: 'ok', data, error: '' }))
      .catch(e => vivo && setState({ status: 'error', data: null, error: e.message }));
    return () => {
      vivo = false;
    };
  }, [url, tick]);

  const reload = useCallback(() => {
    setState(s => (s.status === 'error' ? { ...s, status: 'loading' } : s));
    setTick(t => t + 1);
  }, []);

  return { ...state, reload };
}
