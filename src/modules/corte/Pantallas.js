'use client';

import { motion } from 'motion/react';
import { PiCalendarCheckDuotone, PiNotePencilDuotone, PiArrowRightBold } from 'react-icons/pi';
import Page from '@/components/ui/Page';
import Glass from '@/components/ui/Glass';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { cuadre, fechaLarga } from '@/lib/format';
import { fila, lista, toque } from './anim';
import Celebracion from './Celebracion';

/** Pantallas completas del corte que no son un paso: borrador viejo, "ya existe" y éxito. */

/** Hay una cuenta empezada otro día: continuar o empezar de nuevo. */
export function BorradorViejo({ fecha, onContinuar, onNuevo }) {
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const cuando = fecha === ayer.toLocaleDateString('en-CA') ? 'ayer' : `el ${fechaLarga(`${fecha}T12:00:00`)}`;

  return (
    <Page title="Cuenta empezada" dock={false} back="/">
      <EmptyState
        icon={PiNotePencilDuotone}
        title={`Tienes una cuenta empezada ${cuando}`}
        text="¿Quieres seguir con esa o empezar una nueva? Si empiezas de nuevo, se borra lo anotado."
        action={
          <div className="mt-3 flex w-full flex-col gap-3">
            <motion.button type="button" whileTap={toque} onClick={onContinuar} className="btn btn-big btn-liquid w-full">
              Continuar esa cuenta
            </motion.button>
            <motion.button type="button" whileTap={toque} onClick={onNuevo} className="btn btn-big btn-glass w-full">
              Empezar de nuevo
            </motion.button>
          </div>
        }
      />
    </Page>
  );
}

/** Error 409: la regla es una cuenta por día. */
export function YaExiste({ onVerDias, onBorrar }) {
  return (
    <Page title="Cuenta de hoy" dock={false}>
      <EmptyState
        icon={PiCalendarCheckDuotone}
        title="Hoy ya se guardó la cuenta"
        text="Solo se puede guardar una cuenta por día. Si algo quedó mal, el dueño puede corregirlo desde Administración."
        action={
          <div className="mt-3 flex w-full flex-col gap-3">
            <motion.button type="button" whileTap={toque} onClick={onVerDias} className="btn btn-big btn-liquid w-full">
              Ir a Días <PiArrowRightBold className="size-5" aria-hidden />
            </motion.button>
            <motion.button type="button" whileTap={toque} onClick={onBorrar} className="btn btn-big btn-glass w-full">
              Borrar lo que anoté
            </motion.button>
          </div>
        }
      />
    </Page>
  );
}

/** Éxito breve: sello animado + resultado + un solo botón. */
export function Guardada({ diferencia, onVerDias }) {
  const c = cuadre(diferencia);
  return (
    <Page title="Cuenta guardada" dock={false}>
      <motion.div variants={lista} initial="hidden" animate="show" className="flex flex-col gap-5">
        <motion.div variants={fila}>
          <Glass variant="strong" className="glass-liquid flex flex-col items-center gap-3 px-6 py-9 text-center">
            <Celebracion tone={c.tone} />
            <h2 className="text-2xl font-extrabold">La cuenta de hoy quedó guardada</h2>
            <StatusBadge tone={c.tone} label={c.label} size="lg" />
            {c.tone !== 'ok' && (
              <p className="num text-5xl font-extrabold" style={{ color: 'var(--tone)' }}>
                <AnimatedNumber value={Math.abs(Math.round(diferencia))} from={0} />
              </p>
            )}
            <p className="text-lg text-ink-soft">{c.detalle}</p>
          </Glass>
        </motion.div>
        <motion.div variants={fila}>
          <motion.button type="button" whileTap={toque} onClick={onVerDias} className="btn btn-big btn-liquid w-full">
            Ver mis días
          </motion.button>
        </motion.div>
      </motion.div>
    </Page>
  );
}
