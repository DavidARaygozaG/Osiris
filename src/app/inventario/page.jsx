'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  PiCheckCircleFill,
  PiWarningFill,
  PiXCircleFill,
  PiMagnifyingGlassBold,
  PiPackageDuotone,
  PiWifiSlashDuotone,
} from 'react-icons/pi';
import Page from '@/components/ui/Page';
import Glass from '@/components/ui/Glass';
import EmptyState from '@/components/ui/EmptyState';
import ProductoIcon from '@/components/ui/ProductoIcon';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { fraccion, money } from '@/lib/format';

// Nivel de stock: siempre icono + palabra (nunca solo color). Umbrales por tipo.
function nivel(stock, pocoHasta) {
  if (stock <= 0) return { key: 'bad', label: 'Sin stock', Icon: PiXCircleFill };
  if (stock <= pocoHasta) return { key: 'warn', label: 'Poco', Icon: PiWarningFill };
  return { key: 'ok', label: 'Bien', Icon: PiCheckCircleFill };
}

function Nivel({ n }) {
  return (
    <span
      className={`tone-${n.key} inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-sm font-bold text-[color:var(--tone)] bg-[color:var(--tone-bg)]`}>
      <n.Icon className="size-4" aria-hidden />
      {n.label}
    </span>
  );
}

// Formatos estables (fuera del componente) para AnimatedNumber
const entero = v => String(Math.round(v));
const bultos = v => fraccion(Math.round(v * 4) / 4);

// Entrada escalonada con blur, igual que el Inicio
const lista = { show: { transition: { staggerChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 240, damping: 24 } },
};

const COLOR_BARRA = { ok: 'bg-nopal', warn: 'bg-maiz', bad: 'bg-chile' };

/** Barra de nivel: crece desde 0 con un resorte (solo transform). `tope` = lo que se considera "lleno". */
function BarraNivel({ stock, tope, k }) {
  const reducir = useReducedMotion();
  const frac = Math.max(0.04, Math.min(1, stock / tope));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink/10" aria-hidden>
      <motion.div
        className={`h-full origin-left rounded-full ${COLOR_BARRA[k]}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: frac }}
        transition={reducir ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18, delay: 0.25 }}
      />
    </div>
  );
}

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [harina, setHarina] = useState(0);
  const [status, setStatus] = useState('cargando'); // cargando | ok | error
  const [q, setQ] = useState('');

  useEffect(() => {
    let vivo = true;
    Promise.all([
      fetch('/api/productos').then(r => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/harina/stock').then(r => (r.ok ? r.json() : { stock: 0 })),
    ])
      .then(([prods, h]) => {
        if (!vivo) return;
        setProductos(Array.isArray(prods) ? prods : []);
        setHarina(h?.stock ?? 0);
        setStatus('ok');
      })
      .catch(() => vivo && setStatus('error'));
    return () => {
      vivo = false;
    };
  }, []);

  // El buscador solo aparece cuando la lista ya es larga
  const conBuscador = productos.length > 8;
  const visibles = conBuscador && q.trim() ? productos.filter(p => p.nombre.toLowerCase().includes(q.trim().toLowerCase())) : productos;
  const nHarina = nivel(harina, 2);

  return (
    <Page title="Productos" subtitle="Lo que hay en el mostrador">
      {status === 'cargando' && (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando">
          <div className="skeleton h-28 w-full rounded-2xl" />
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="skeleton h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <EmptyState
          icon={PiWifiSlashDuotone}
          title="No pudimos cargar los productos"
          text="Revisa tu conexión e intenta otra vez."
          action={
            <button type="button" className="btn btn-big btn-liquid" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          }
        />
      )}

      {status === 'ok' && (
        <motion.div variants={lista} initial="hidden" animate="show" className="flex flex-col gap-3">
          {/* Harina destacada arriba, en bultos */}
          <motion.div variants={item}>
            <Glass className="glass-liquid flex flex-col gap-4 p-5">
              <div className="flex items-center gap-4">
                <ProductoIcon nombre="harina" size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-ink-soft">Harina</p>
                  <p className="num text-4xl font-extrabold leading-none">
                    <AnimatedNumber value={harina} from={0} format={bultos} />{' '}
                    <span className="text-xl font-bold">{harina === 1 ? 'bulto' : 'bultos'}</span>
                  </p>
                </div>
                <Nivel n={nHarina} />
              </div>
              <BarraNivel stock={harina} tope={8} k={nHarina.key} />
            </Glass>
          </motion.div>

          {conBuscador && (
            <motion.label variants={item} className="flex min-h-14 items-center gap-3 rounded-2xl border border-ink/10 bg-field px-4">
              <PiMagnifyingGlassBold className="size-5 text-ink-soft" aria-hidden />
              <input
                type="search"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar producto"
                aria-label="Buscar producto"
                className="min-w-0 flex-1 bg-transparent text-lg outline-none"
              />
            </motion.label>
          )}

          {productos.length === 0 && <EmptyState icon={PiPackageDuotone} title="Aún no hay productos" text="El dueño puede agregarlos desde Administración." />}
          {productos.length > 0 && visibles.length === 0 && <EmptyState icon={PiMagnifyingGlassBold} title="Nada con ese nombre" text="Prueba con otra palabra." />}

          {visibles.map(p => {
            const n = nivel(p.stock, 3);
            return (
              <motion.div key={p.id} variants={item} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <div className="glass-row flex flex-col gap-3 p-4">
                  <div className="flex items-center gap-4">
                    <ProductoIcon nombre={p.nombre} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold leading-tight">{p.nombre}</p>
                      <p className="num text-ink-soft">{money(p.precio)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="num text-3xl font-extrabold leading-none" aria-label={p.stock > 0 ? `${p.stock} en existencia` : 'Sin stock'}>
                        <AnimatedNumber value={Math.max(0, p.stock)} from={0} format={entero} />
                      </p>
                      <Nivel n={n} />
                    </div>
                  </div>
                  <BarraNivel stock={p.stock} tope={12} k={n.key} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </Page>
  );
}
