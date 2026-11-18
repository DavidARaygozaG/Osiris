'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Mensaje breve de confirmación ("Guardado") que se apaga solo. */
export function useFlash(ms = 2600) {
  const [msg, setMsg] = useState('');
  const timer = useRef(null);

  const show = useCallback(
    texto => {
      setMsg(texto);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMsg(''), ms);
    },
    [ms]
  );

  useEffect(() => () => clearTimeout(timer.current), []);
  return [msg, show];
}
