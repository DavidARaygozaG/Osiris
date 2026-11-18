'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { PiDownloadSimpleBold, PiXBold, PiShareNetworkBold, PiDotsThreeVerticalBold } from 'react-icons/pi';

const KEY = 'pwa-dismissed';

// localStorage puede fallar (modo privado): siempre con try/catch
const leerCierre = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
const guardarCierre = () => {
  try {
    localStorage.setItem(KEY, '1');
  } catch {}
};

/** Invitación discreta a instalar la app: tarjeta de cristal arriba del dock. */
export default function InstallPWA() {
  const enInicio = usePathname() === '/';
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [pasos, setPasos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone || leerCierre()) return;

    // Aparece un instante después de cargar (no compite con la primera pantalla)
    const t = setTimeout(() => setVisible(true), 1500);

    const onPrompt = e => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => {
      clearTimeout(t);
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, []);

  async function instalar() {
    if (!prompt) return setPasos(true); // sin diálogo nativo: mostramos los pasos
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
  }

  function cerrar() {
    guardarCierre();
    setVisible(false);
  }

  // Solo se renderiza en el cliente (visible=true), así que navigator existe
  const isIOS = visible && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const lista = isIOS
    ? [
        { Icon: PiShareNetworkBold, texto: 'Toca Compartir en la barra de Safari' },
        { texto: 'Elige "Agregar a pantalla de inicio"' },
        { texto: 'Toca "Agregar"' },
      ]
    : [
        { Icon: PiDotsThreeVerticalBold, texto: 'Toca el menú de Chrome (arriba a la derecha)' },
        { texto: 'Elige "Instalar aplicación"' },
        { texto: 'Toca "Instalar"' },
      ];

  return (
    <AnimatePresence>
      {visible && enInicio && (
        // Solo en el inicio: nunca tapa el corte ni el admin.
        // bottom-28: queda justo arriba del dock flotante
        <motion.aside
          role="complementary"
          aria-label="Instalar la app"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-28 z-30 mx-auto w-[calc(100%-2rem)] max-w-sm">
          <div className="glass glass-strong glass-liquid p-4">
            {!pasos ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/icon-192x192.png" alt="" className="float size-12 shrink-0 rounded-xl" />
                  <p className="min-w-0 flex-1 font-bold leading-tight">Ten la app en tu pantalla</p>
                  <button type="button" onClick={cerrar} aria-label="Cerrar" className="btn btn-circle btn-ghost size-12 min-h-12 text-ink-soft">
                    <PiXBold className="size-5" />
                  </button>
                </div>
                <button type="button" onClick={instalar} className="btn btn-big btn-liquid w-full">
                  <PiDownloadSimpleBold className="size-5" aria-hidden />
                  Instalar app
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-bold">{isIOS ? 'En iPhone' : 'En Android'}</p>
                  <button type="button" onClick={cerrar} aria-label="Cerrar" className="btn btn-circle btn-ghost size-12 min-h-12 text-ink-soft">
                    <PiXBold className="size-5" />
                  </button>
                </div>
                <ol className="mt-1 flex flex-col gap-2">
                  {lista.map((p, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i, type: 'spring', stiffness: 260, damping: 24 }}>
                      <span className="num grid size-8 shrink-0 place-items-center font-bold text-cafe">{i + 1}</span>
                      <span className="flex-1">{p.texto}</span>
                      {p.Icon && <p.Icon className="size-5 text-ink-soft" aria-hidden />}
                    </motion.li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
