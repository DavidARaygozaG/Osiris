'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { PiXBold, PiCaretLeftBold, PiFlaskDuotone, PiWarningFill, PiArrowRightBold } from 'react-icons/pi';
import Page from '@/components/ui/Page';
import Sheet from '@/components/ui/Sheet';
import StatusBadge from '@/components/ui/StatusBadge';
import { hoyISO, tieneDatos, useCorteStore, useHidratado } from '@/stores/useCorteStore';
import { cuadre, money } from '@/lib/format';
import { diaMX } from '@/lib/fecha';
import { PASOS, TOTAL_PASOS } from './pasos';
import { useCatalogo } from './useCatalogo';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { EASE_OUT_EXPO, fila, lista, toque } from './anim';
import Cargando from './Cargando';
import PasoProductos from './PasoProductos';
import PasoProveedores from './PasoProveedores';
import PasoTandas from './PasoTandas';
import PasoSobrante from './PasoSobrante';
import PasoGastos from './PasoGastos';
import PasoCaja from './PasoCaja';
import PasoResumen from './PasoResumen';
import { BorradorViejo, Guardada, YaExiste } from './Pantallas';

/**
 * Wizard del corte: 7 pantallas, una pregunta cada una.
 * Patrón: el store (zustand + persist) guarda todo; este componente solo decide
 * QUÉ pantalla mostrar (cargando → borrador viejo → paso N → guardada / ya existe).
 */
export default function CorteModule() {
  const router = useRouter();
  const hidratado = useHidratado();
  const catalogo = useCatalogo();

  const paso = useCorteStore(s => s.paso);
  const modo = useCorteStore(s => s.modo);
  const fecha = useCorteStore(s => s.fecha);
  const hayBorradorViejo = useCorteStore(s => s.fecha !== hoyISO() && tieneDatos(s));
  const { nextPaso, prevPaso, setModo, reset, empezarDeNuevo, adoptarBorrador } = useCorteStore.getState();

  const [dir, setDir] = useState(1); // 1 = avanzando, -1 = regresando (dirección de la animación)
  const [vista, setVista] = useState('wizard'); // 'wizard' | 'guardada' | 'yaExiste'
  const [diferenciaGuardada, setDiferenciaGuardada] = useState(0);
  const [confirmar, setConfirmar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [falloGuardar, setFalloGuardar] = useState(false);
  const titulo = useRef(null);

  // Al entrar en modo 'corte': si la cuenta de hoy ya existe, se avisa antes de capturar nada
  useEffect(() => {
    if (!hidratado || modo !== 'corte') return;
    let vivo = true;
    fetch('/api/historial')
      .then(r => (r.ok ? r.json() : []))
      .then(cs => {
        // Mismo criterio de fecha que HomeActions (UTC, YYYY-MM-DD)
        const hoy = hoyISO();
        if (vivo && Array.isArray(cs) && cs.some(c => diaMX(c.fecha) === hoy)) setVista(v => (v === 'wizard' ? 'yaExiste' : v));
      })
      .catch(() => {}); // sin red: se deja capturar; el servidor responde 409 al guardar
    return () => {
      vivo = false;
    };
  }, [hidratado, modo]);

  // Borrador de otro día pero vacío: no hay nada que ofrecer, se reinicia en silencio.
  useEffect(() => {
    if (hidratado && fecha !== hoyISO() && !hayBorradorViejo) empezarDeNuevo();
  }, [hidratado, fecha, hayBorradorViejo, empezarDeNuevo]);

  // Al cambiar de paso: arriba de todo y el foco al título (lectores de pantalla)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    titulo.current?.focus({ preventScroll: true });
  }, [paso, hidratado]);

  const ir = d => {
    setDir(d);
    if (d > 0) nextPaso();
    else prevPaso();
  };

  const guardar = async () => {
    setGuardando(true);
    setFalloGuardar(false);
    const s = useCorteStore.getState();
    const totales = s.calcularTotales();
    // El API descarta gastos sin nombre; aquí les damos uno para que el total siempre coincida.
    const gastosExtra = s.gastosExtra
      .filter(g => Number(g.monto) > 0 || g.concepto.trim())
      .map(g => ({ concepto: g.concepto.trim() || 'Gasto', monto: Number(g.monto) || 0 }));

    try {
      const res = await fetch('/api/corte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: s.productos,
          proveedores: s.proveedores,
          tandas: s.tandas.map(({ harina, masa }) => ({ harina, masa })), // sin el id de la lista
          gastosExtra,
          dineroEnCaja: s.dineroEnCaja,
          notas: s.notas,
          ...totales,
        }),
      });
      if (res.status === 409) {
        setConfirmar(false);
        setVista('yaExiste');
      } else if (res.ok) {
        setDiferenciaGuardada(totales.diferencia);
        reset(); // limpia también el borrador guardado
        setConfirmar(false);
        setVista('guardada');
      } else {
        setFalloGuardar(true);
      }
    } catch {
      setFalloGuardar(true);
    } finally {
      setGuardando(false);
    }
  };

  // ── Pantallas que no son un paso ────────────────────────────────────────────
  if (!hidratado)
    return (
      <Page title="Cuenta del día" dock={false} back="/">
        <Cargando filas={3} />
      </Page>
    );
  if (vista === 'guardada') return <Guardada diferencia={diferenciaGuardada} onVerDias={() => router.push('/historial')} />;
  if (vista === 'yaExiste')
    return (
      <YaExiste
        onVerDias={() => router.push('/historial')}
        onBorrar={() => {
          reset();
          router.push('/');
        }}
      />
    );
  if (hayBorradorViejo) return <BorradorViejo fecha={fecha} onContinuar={adoptarBorrador} onNuevo={empezarDeNuevo} />;

  // ── Wizard ──────────────────────────────────────────────────────────────────
  const info = PASOS[paso - 1];
  const esResumen = paso === TOTAL_PASOS;
  const practica = modo === 'calcular';

  const Contenido = [PasoProductos, PasoProveedores, PasoTandas, PasoSobrante, PasoGastos, PasoCaja, PasoResumen][paso - 1];

  // Texto del botón principal según el paso y el modo
  let etiqueta = 'Siguiente';
  if (paso === TOTAL_PASOS - 1) etiqueta = 'Ver resultado';
  if (esResumen) etiqueta = practica ? 'Convertir en cuenta real' : 'Guardar la cuenta';
  const accionPrincipal = () => {
    if (!esResumen) return ir(1);
    if (practica) return setModo('corte');
    setFalloGuardar(false);
    setConfirmar(true);
  };

  return (
    // reducedMotion="user": si el teléfono pide menos movimiento, motion lo respeta solo
    <MotionConfig reducedMotion="user">
      <main id="contenido" className="mx-auto w-full max-w-xl flex-1 px-4 pb-44">
        <Encabezado paso={paso} esResumen={esResumen} />

        <AnimatePresence>
          {practica && (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="tone-warn mt-3 flex items-center gap-2.5 rounded-2xl px-4 py-3 font-semibold"
              style={{ background: 'var(--tone-bg)' }}>
              <PiFlaskDuotone className="size-6 shrink-0 text-maiz-deep" aria-hidden />
              Práctica: no se guarda nada
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={paso}
            custom={dir}
            variants={{
              entra: d => ({ opacity: 0, x: d * 28 }),
              visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
              sale: { opacity: 0, transition: { duration: 0.12 } },
            }}
            initial="entra"
            animate="visible"
            exit="sale"
            className="pt-6">
            <motion.div variants={lista} initial="hidden" animate="show">
              <motion.h1 variants={fila} ref={titulo} tabIndex={-1} className="text-[2rem] font-extrabold leading-[1.1] focus:outline-none">
                {info.pregunta}
              </motion.h1>
              {info.ayuda ? (
                <motion.p variants={fila} className="mb-5 mt-2 text-ink-soft">
                  {info.ayuda}
                </motion.p>
              ) : (
                <div className="mb-5" />
              )}
            </motion.div>
            <Contenido catalogo={catalogo} />

            {esResumen && practica && (
              <motion.button
                type="button"
                whileTap={toque}
                onClick={() => {
                  reset();
                  router.push('/');
                }}
                className="btn btn-big btn-glass mt-4 w-full">
                Terminar práctica
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Botón principal fijo abajo, al alcance del pulgar */}
      <div className="pb-safe pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4">
        <div className="glass-dock pointer-events-auto flex w-full max-w-xl items-center gap-2 p-2">
          {paso > 1 && (
            <motion.button
              type="button"
              whileTap={toque}
              onClick={() => ir(-1)}
              aria-label="Paso anterior"
              className="btn btn-big btn-ghost size-14 shrink-0 px-0 text-ink">
              <PiCaretLeftBold className="size-7" />
            </motion.button>
          )}
          <motion.button type="button" whileTap={toque} onClick={accionPrincipal} className="btn btn-big btn-liquid flex-1">
            {etiqueta}
            {!esResumen && <PiArrowRightBold className="size-5" aria-hidden />}
          </motion.button>
        </div>
      </div>

      <ConfirmarGuardado abierto={confirmar} guardando={guardando} fallo={falloGuardar} onCerrar={() => !guardando && setConfirmar(false)} onGuardar={guardar} />
    </MotionConfig>
  );
}

/** Encabezado fijo: salir, paso actual, total del día en vivo y barra de progreso. */
function Encabezado({ paso, esResumen }) {
  // El selector devuelve un número: el chip solo se vuelve a pintar cuando el total cambia.
  const total = useCorteStore(s => s.calcularTotales().totalVentas);

  return (
    <header className="pt-safe sticky top-0 z-30 -mx-4 px-4 pb-1">
      <div className="glass glass-liquid px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Salir" className="btn btn-ghost btn-circle size-12 min-h-12 shrink-0 text-ink">
            <PiXBold className="size-7" />
          </Link>
          <p className="min-w-0 flex-1 leading-tight">
            <span className="block text-lg font-extrabold">
              Paso {paso} de {TOTAL_PASOS}
            </span>
            <span className="block text-sm text-ink-soft">Tu avance se guarda solo</span>
          </p>
          {!esResumen && (
            <p className="bg-field shrink-0 rounded-xl px-3 py-1.5 text-right leading-tight" aria-live="polite">
              <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-ink-soft">
                <span className="pulse-ring size-2 rounded-full bg-maiz" aria-hidden />
                Vendido hoy
              </span>
              <AnimatedNumber value={total} className="num block text-xl font-extrabold" />
            </p>
          )}
        </div>
        <div className="mt-3 flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL_PASOS} aria-valuenow={paso} aria-label={`Paso ${paso} de ${TOTAL_PASOS}`}>
          {PASOS.map((p, i) => (
            <span key={p.id} className={`relative h-2 flex-1 rounded-full bg-ink/15 ${i === paso - 1 ? 'pulse-ring' : ''}`}>
              <motion.span
                className="absolute inset-0 origin-left rounded-full bg-nopal"
                initial={false}
                animate={{ scaleX: i < paso ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 22, delay: i < paso ? i * 0.04 : 0 }}
              />
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

/** Hoja de confirmación antes de guardar (no se puede deshacer, así que se pregunta). */
function ConfirmarGuardado({ abierto, guardando, fallo, onCerrar, onGuardar }) {
  const diferencia = useCorteStore(s => s.calcularTotales().diferencia);
  const c = cuadre(diferencia);

  return (
    <Sheet
      open={abierto}
      onClose={onCerrar}
      title="¿Guardar la cuenta de hoy?"
      footer={
        <div className="flex flex-col gap-2 pb-2">
          <button type="button" onClick={onGuardar} disabled={guardando} className="btn btn-big btn-liquid w-full">
            {guardando ? <span className="loading loading-spinner" aria-hidden /> : null}
            {guardando ? 'Guardando…' : fallo ? 'Intentar otra vez' : 'Sí, guardar'}
          </button>
          <button type="button" onClick={onCerrar} disabled={guardando} className="btn btn-big btn-ghost w-full">
            Revisar otra vez
          </button>
        </div>
      }>
      <div className="space-y-3">
        <p className="text-lg">No se puede cambiar después.</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusBadge tone={c.tone} label={c.label} />
          <span className="font-semibold">{c.detalle}</span>
        </div>
        {fallo && (
          <p role="alert" className="tone-bad flex items-start gap-2.5 rounded-2xl p-3 font-semibold" style={{ background: 'var(--tone-bg)', color: 'var(--tone)' }}>
            <PiWarningFill className="mt-0.5 size-6 shrink-0" aria-hidden />
            No se pudo guardar. Revisa tu internet y toca Intentar otra vez. Lo que anotaste sigue aquí.
          </p>
        )}
      </div>
    </Sheet>
  );
}
