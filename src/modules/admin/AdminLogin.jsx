'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { PiBackspaceDuotone, PiLockKeyDuotone, PiSignOutBold, PiWarningCircleFill, PiCheckCircleFill } from 'react-icons/pi';
import Page from '@/components/ui/Page';
import Glass from '@/components/ui/Glass';
import { Stagger, StaggerItem } from '@/components/ui/Stagger';
import { useAdminStore } from '@/stores/useAdminStore';
import { api } from './api';

const MIN = 4; // mínimo de dígitos
const MAX = 8; // máximo permitido
const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];
const SPRING = { type: 'spring', stiffness: 500, damping: 24 };

/** Pantalla de acceso del dueño: PIN con teclado propio grande y puntos que se llenan con "pop". */
export default function AdminLogin() {
  const setAdmin = useAdminStore(s => s.setAdmin);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [intento, setIntento] = useState(0); // cambia al fallar → dispara la sacudida
  const [correcto, setCorrecto] = useState(false); // PIN bueno: puntos verdes un instante antes de entrar

  const teclear = k => {
    if (busy || correcto) return;
    setError('');
    setPin(p => (k === 'back' ? p.slice(0, -1) : p.length >= MAX ? p : p + k));
  };

  const entrar = async () => {
    if (pin.length < MIN || busy || correcto) return;
    setBusy(true);
    setError('');
    try {
      const { ok } = await api('/api/admin/auth', { method: 'POST', body: { pin } });
      if (ok) {
        setCorrecto(true);
        await new Promise(r => setTimeout(r, 480)); // deja ver el éxito antes de cambiar de pantalla
        setAdmin(true);
      } else {
        setError('Ese PIN no es correcto. Inténtalo de nuevo.');
        setPin('');
        setIntento(n => n + 1);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  // Teclado físico (útil en computadora): dígitos, Borrar y Enter
  useEffect(() => {
    const onKey = e => {
      if (/^\d$/.test(e.key)) teclear(e.key);
      else if (e.key === 'Backspace') teclear('back');
      else if (e.key === 'Enter') entrar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const puntos = Math.max(MIN, pin.length);
  const fallo = Boolean(error) && intento > 0 && pin.length === 0;
  const tono = correcto ? 'border-nopal bg-nopal' : fallo ? 'border-chile' : 'border-ink';

  return (
    <Page
      title="Acceso del dueño"
      subtitle="Escribe tu PIN para entrar."
      dock={false}
      action={
        <Link href="/" className="btn btn-glass mt-0.5 h-12 min-h-12 px-4">
          <PiSignOutBold className="size-5" aria-hidden />
          Salir
        </Link>
      }>
      <Stagger>
        <StaggerItem>
          <Glass variant="strong" as="section" className="glass-liquid p-5">
            <div className="mb-4 flex flex-col items-center gap-4">
              {/* Candado → error (chile) o éxito (verde): el icono cambia con un pop */}
              <span className="grid h-16 place-items-center">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={correcto ? 'ok' : fallo ? 'error' : 'lock'}
                    initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={SPRING}>
                    {correcto ? (
                      <PiCheckCircleFill className="size-14 text-nopal drop-shadow-md" aria-hidden />
                    ) : fallo ? (
                      <PiWarningCircleFill className="size-14 text-chile drop-shadow-md" aria-hidden />
                    ) : (
                      <PiLockKeyDuotone className="size-14 text-cafe drop-shadow-md" aria-hidden />
                    )}
                  </motion.span>
                </AnimatePresence>
              </span>

              {/* Puntos: uno por dígito; cada uno hace "pop" al llenarse. Al fallar, toda la fila vibra. */}
              <motion.div
                key={intento}
                initial={false}
                animate={intento ? { x: [0, -14, 14, -10, 10, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="flex h-6 items-center gap-3"
                role="img"
                aria-label={`${pin.length} dígitos escritos`}>
                {Array.from({ length: puntos }, (_, i) => {
                  const lleno = i < pin.length || correcto;
                  return (
                    <motion.span
                      key={i}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={lleno ? { scale: [0.5, 1.3, 1], opacity: 1 } : { scale: 0.85, opacity: 1 }}
                      transition={{ duration: lleno ? 0.32 : 0.2, delay: correcto ? i * 0.05 : 0 }}
                      className={`size-5 rounded-full border-2 ${tono} ${lleno && !correcto ? 'bg-ink' : correcto ? '' : 'bg-transparent'}`}
                    />
                  );
                })}
              </motion.div>

              <p
                role="alert"
                className={`flex min-h-12 items-center gap-2 text-center font-semibold text-chile ${error ? '' : 'invisible'}`}>
                {error}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {TECLAS.map((k, i) =>
                k === '' ? (
                  <span key={`vacio-${i}`} />
                ) : (
                  <motion.button
                    key={k}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => teclear(k)}
                    aria-label={k === 'back' ? 'Borrar' : k}
                    className="btn btn-glass num h-16 min-h-16 text-3xl font-bold">
                    {k === 'back' ? <PiBackspaceDuotone className="size-8" /> : k}
                  </motion.button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={entrar}
              disabled={pin.length < MIN || busy || correcto}
              className="btn btn-big btn-liquid mt-4 w-full disabled:opacity-50">
              {busy && <span className="loading loading-spinner" aria-hidden />}
              {correcto ? 'Entrando…' : busy ? 'Revisando…' : 'Entrar'}
            </button>
            {pin.length > 0 && pin.length < MIN && (
              <p className="mt-3 text-center text-ink-soft">Faltan {MIN - pin.length} dígitos como mínimo.</p>
            )}
          </Glass>
        </StaggerItem>
      </Stagger>
    </Page>
  );
}
