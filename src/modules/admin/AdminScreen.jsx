'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import Page from '@/components/ui/Page';
import { useAdminStore } from '@/stores/useAdminStore';
import { Esqueleto } from './Async';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';

const noop = () => () => {};
// false en el servidor, true en el navegador: evita el "parpadeo" de hidratación,
// porque isAdmin viene de localStorage y el servidor no lo conoce.
const useMontado = () => useSyncExternalStore(noop, () => true, () => false);

/** Puerta del admin: PIN si no hay sesión, panel si ya entró (con transición suave entre ambos). */
export default function AdminScreen() {
  const montado = useMontado();
  const isAdmin = useAdminStore(s => s.isAdmin);
  const logout = useAdminStore(s => s.logout);

  // La bandera del navegador no basta: se confirma con el servidor (cookie firmada).
  // Si la sesión no existe o venció, se pide el PIN otra vez.
  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/auth')
      .then(r => (r.ok ? r.json() : null))
      .then(d => d && !d.admin && logout())
      .catch(() => {});
  }, [isAdmin, logout]);

  if (!montado) {
    return (
      <Page title="Administración" back="/" dock={false}>
        <Esqueleto filas={3} />
      </Page>
    );
  }
  return (
    // reducedMotion="user": con "menos movimiento" se apagan las animaciones de transform
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isAdmin ? 'panel' : 'login'}
          initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(8px)' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
          {isAdmin ? <AdminPanel /> : <AdminLogin />}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
