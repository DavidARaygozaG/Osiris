'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MdDownload, MdClose, MdIosShare, MdMoreVert } from 'react-icons/md';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (standalone) return;
    if (localStorage.getItem('pwa-dismissed') === '1') return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);
    setVisible(true);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setVisible(false);
      return;
    }
    setShowSteps(true);
  };

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop sutil cuando muestra los pasos */}
          {showSteps && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSteps(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)' }}
            />
          )}

          <motion.div
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            exit={{ y: '110%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              fontFamily: 'inherit',
            }}
          >
            {/* ── Contenedor glassmorphism ── */}
            <div style={{
              margin: '0 0.75rem 0.75rem',
              background: 'rgba(10,10,14,0.97)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '1.5rem',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              overflow: 'hidden',
              boxShadow: '0 -4px 40px rgba(34,197,94,0.08), 0 20px 60px rgba(0,0,0,0.6)',
            }}>

              {/* Barra verde superior */}
              <div style={{
                height: 3,
                background: 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)',
                borderRadius: '99px 99px 0 0',
              }} />

              <AnimatePresence mode="wait">
                {!showSteps ? (
                  /* ── Banner principal ── */
                  <motion.div
                    key="banner"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    style={{ padding: '1.1rem 1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}
                  >
                    {/* Icono app */}
                    <div style={{
                      width: 54, height: 54, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                      border: '1.5px solid rgba(34,197,94,0.3)',
                      boxShadow: '0 0 16px rgba(34,197,94,0.2)',
                    }}>
                      <img src="/icons/icon-192x192.png" alt="Osiris" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Texto */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.01em' }}>
                        Instalar Osiris
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                        Úsala sin internet · pantalla de inicio
                      </p>
                    </div>

                    {/* Botón instalar */}
                    <motion.button
                      whileTap={{ scale: 0.91 }}
                      onClick={handleInstall}
                      style={{
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '999px', border: 'none',
                        background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                        color: '#fff', fontWeight: 700, fontSize: '0.84rem',
                        cursor: 'pointer', fontFamily: 'inherit',
                        boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
                      }}
                    >
                      <MdDownload size={16} />
                      Instalar
                    </motion.button>

                    {/* X */}
                    <motion.button
                      whileTap={{ scale: 0.85 }} onClick={dismiss}
                      style={{
                        flexShrink: 0, background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
                        padding: '0.25rem', display: 'flex',
                      }}
                    >
                      <MdClose size={20} />
                    </motion.button>
                  </motion.div>

                ) : (
                  /* ── Instrucciones paso a paso ── */
                  <motion.div
                    key="steps"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    style={{ padding: '1.25rem 1.25rem 1.5rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                        {isIOS ? '📱 Instalar en iPhone / iPad' : '📲 Instalar en Android'}
                      </p>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => setShowSteps(false)}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex' }}>
                        <MdClose size={20} />
                      </motion.button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {(isIOS ? [
                        { n: 1, icon: <MdIosShare size={18} />, text: <>Toca el botón <strong style={{ color: '#22c55e' }}>Compartir</strong> en la barra de Safari</> },
                        { n: 2, icon: null, text: <>Baja y elige <strong style={{ color: '#22c55e' }}>"Agregar a pantalla de inicio"</strong></> },
                        { n: 3, icon: null, text: <>Toca <strong style={{ color: '#22c55e' }}>"Agregar"</strong> para confirmar</> },
                      ] : [
                        { n: 1, icon: <MdMoreVert size={18} />, text: <>Toca el menú <strong style={{ color: '#22c55e' }}>⋮</strong> de Chrome (arriba a la derecha)</> },
                        { n: 2, icon: null, text: <>Selecciona <strong style={{ color: '#22c55e' }}>"Instalar aplicación"</strong> o <strong style={{ color: '#22c55e' }}>"Agregar a pantalla"</strong></> },
                        { n: 3, icon: null, text: <>Toca <strong style={{ color: '#22c55e' }}>"Instalar"</strong> para confirmar</> },
                      ]).map(({ n, text }) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <span style={{
                            flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
                            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.72rem', fontWeight: 700, color: '#22c55e',
                          }}>{n}</span>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{text}</p>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }} onClick={dismiss}
                      style={{
                        marginTop: '1.1rem', width: '100%', padding: '0.65rem',
                        borderRadius: '0.875rem', border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      No gracias
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
