'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MdShare, MdDownload, MdContentCopy, MdIosShare } from 'react-icons/md';
import { toast } from 'sonner';
import * as htmlToImage from 'html-to-image';
import styles from './ShareCorte.module.css';

/**
 * Botón flotante con menú para exportar/compartir el corte como PNG.
 * Recibe `targetRef` apuntando al contenedor a capturar.
 */
export default function ShareCorte({ targetRef, corte, fecha }) {
  const [open,    setOpen]    = useState(false);
  const [working, setWorking] = useState(false);

  async function generar() {
    if (!targetRef?.current) throw new Error('Sin contenedor');
    setWorking(true);
    try {
      const dataUrl = await htmlToImage.toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0d0d0f',
      });
      return dataUrl;
    } finally {
      setWorking(false);
    }
  }

  async function descargar() {
    try {
      const dataUrl = await generar();
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `osiris-corte-${fecha?.replace(/[^\w]+/g, '-') || corte?.id}.png`;
      a.click();
      toast.success('Imagen descargada');
    } catch { toast.error('No se pudo generar la imagen'); }
    setOpen(false);
  }

  async function compartir() {
    try {
      const dataUrl = await generar();
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `osiris-corte.png`, { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Corte Osiris', text: fecha });
        toast.success('Compartido');
      } else {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('Copiado al portapapeles');
      }
    } catch (e) {
      if (e?.name !== 'AbortError') toast.error('No se pudo compartir');
    }
    setOpen(false);
  }

  async function copiar() {
    try {
      const dataUrl = await generar();
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      toast.success('Copiado al portapapeles');
    } catch { toast.error('No se pudo copiar'); }
    setOpen(false);
  }

  return (
    <div className={styles.wrapper}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.05 }}
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label="Compartir corte"
        disabled={working}
      >
        <MdShare />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className={styles.menu}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              <button className={styles.menuItem} onClick={compartir}>
                <MdIosShare /><span>Compartir…</span>
              </button>
              <button className={styles.menuItem} onClick={descargar}>
                <MdDownload /><span>Descargar PNG</span>
              </button>
              <button className={styles.menuItem} onClick={copiar}>
                <MdContentCopy /><span>Copiar imagen</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
