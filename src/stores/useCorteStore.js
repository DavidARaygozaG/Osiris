import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { diaMX } from '@/lib/fecha';
import { createJSONStorage, persist } from 'zustand/middleware';

// Precios por defecto; el admin los cambia en Ajustes y el wizard los carga al abrir (ver useCatalogo).
export const PRECIOS_BASE = { bulto: 880, merma: 23 };

/** Id estable para filas de listas (key de React). Nunca se envía al servidor. */
const nuevoId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Fecha local "2026-11-18". Sirve para saber si un borrador es de otro día. */
export const hoyISO = () => diaMX(); // día de Ciudad de México (igual que el servidor)

// Función (no objeto fijo) para que `fecha` siempre sea la de hoy al reiniciar.
const getInitialState = () => ({
  fecha: hoyISO(),
  paso: 1,
  modo: 'corte', // 'corte' (guarda) | 'calcular' (práctica, no guarda)
  productos: {}, // { [id]: cantidad }
  productosInfo: {}, // { [id]: { nombre, precio } } ← precios para calcular ventas
  tandas: [],
  proveedores: {}, // { [id]: { paso, dejo, cobro } }
  gastosExtra: [],
  mermaKg: 0,
  dineroEnCaja: 0,
  notas: '',
});

/** ¿El borrador tiene algo capturado? (si está vacío no vale la pena ofrecerlo) */
export const tieneDatos = s =>
  Object.values(s.productos).some(c => c > 0) ||
  s.tandas.length > 0 ||
  Object.values(s.proveedores).some(p => p.paso) ||
  s.gastosExtra.length > 0 ||
  s.mermaKg > 0 ||
  s.dineroEnCaja > 0 ||
  s.notas.trim() !== '';

/**
 * Store del corte con AUTOGUARDADO (zustand `persist` → localStorage).
 *
 * Patrón clave para Next.js: `skipHydration: true`.
 * El servidor no tiene localStorage; si zustand leyera el borrador al crear el store
 * habría un desajuste servidor/cliente. Por eso se hidrata a mano con `useHidratado()`.
 */
export const useCorteStore = create(
  persist(
    (set, get) => ({
      ...getInitialState(),
      modoPendiente: null, // modo elegido en el home; no se guarda (ver `merge`)

      setPaso: paso => set({ paso }),
      nextPaso: () => set(s => ({ paso: Math.min(s.paso + 1, 7) })),
      prevPaso: () => set(s => ({ paso: Math.max(s.paso - 1, 1) })),

      setProductoCantidad: (id, cantidad) => set(s => ({ productos: { ...s.productos, [id]: cantidad } })),

      // Guarda los precios al cargar productos (necesario para calcular ventas)
      setProductosInfo: info => set({ productosInfo: info }),

      addTanda: () => set(s => ({ tandas: [...s.tandas, { id: nuevoId(), harina: 0.5, masa: 1 }] })), // id solo para la lista (key estable); no viaja al API
      removeTanda: index => set(s => ({ tandas: s.tandas.filter((_, i) => i !== index) })),
      updateTanda: (index, field, value) =>
        set(s => ({ tandas: s.tandas.map((t, i) => (i === index ? { ...t, [field]: value } : t)) })),

      setProveedor: (id, data) =>
        set(s => ({
          proveedores: { ...s.proveedores, [id]: { paso: false, dejo: 0, cobro: 0, ...s.proveedores[id], ...data } },
        })),

      addGasto: (concepto = '') => set(s => ({ gastosExtra: [...s.gastosExtra, { id: nuevoId(), concepto, monto: 0 }] })),
      removeGasto: index => set(s => ({ gastosExtra: s.gastosExtra.filter((_, i) => i !== index) })),
      updateGasto: (index, field, value) =>
        set(s => ({ gastosExtra: s.gastosExtra.map((g, i) => (i === index ? { ...g, [field]: value } : g)) })),

      setMermaKg: kg => set({ mermaKg: Number(kg) || 0 }),
      setModo: m => set({ modo: m, modoPendiente: m }),
      setDineroEnCaja: val => set({ dineroEnCaja: Number(val) || 0 }),
      setNotas: val => set({ notas: val }),

      /** Limpia todo (conserva los precios ya cargados para no recalcular en cero). */
      reset: () => set({ ...getInitialState(), productosInfo: get().productosInfo, modoPendiente: null }),

      /** "Empezar de nuevo": limpia los datos pero respeta el modo elegido. */
      empezarDeNuevo: () => set({ ...getInitialState(), productosInfo: get().productosInfo, modo: get().modo }),

      /** "Continuar" un borrador viejo: se queda con los datos y lo marca como de hoy. */
      adoptarBorrador: () => set({ fecha: hoyISO() }),

      // Precios vigentes (NO se guardan en el borrador: siempre se cargan frescos del servidor)
      precios: PRECIOS_BASE,
      // Ignora valores vacíos: si Ajustes no tiene un precio, se queda el de por defecto
      setPrecios: p => set({ precios: { bulto: p?.bulto ?? PRECIOS_BASE.bulto, merma: p?.merma ?? PRECIOS_BASE.merma } }),

      calcularTotales: () => {
        const { tandas, productos, productosInfo, proveedores, gastosExtra, mermaKg, dineroEnCaja } = get();

        // ── Producción ────────────────────────────────────────────────────────
        const totalBultos = tandas.reduce((acc, t) => acc + t.harina + t.masa, 0);
        const ventaTortilla = Math.round(totalBultos * get().precios.bulto);

        // ── Venta de productos (precio × cantidad) ────────────────────────────
        const ventaProductos = Object.entries(productos).reduce((acc, [id, cantidad]) => {
          const precio = productosInfo[Number(id)]?.precio ?? 0;
          return acc + precio * cantidad;
        }, 0);

        // ── Gastos ────────────────────────────────────────────────────────────
        const totalMerma = mermaKg * get().precios.merma;
        const totalGastosExtras = gastosExtra.reduce((acc, g) => acc + Number(g.monto ?? 0), 0);
        // Cobro de proveedores que pasaron
        const totalProveedores = Object.values(proveedores).reduce((acc, p) => acc + (p.paso ? Number(p.cobro ?? 0) : 0), 0);

        const totalGastos = totalGastosExtras + totalMerma + totalProveedores;

        // ── Cuadre ────────────────────────────────────────────────────────────
        const totalVentas = ventaTortilla + ventaProductos;
        const deberiaHaber = totalVentas - totalGastos;
        const diferencia = dineroEnCaja - deberiaHaber;

        return {
          totalBultos,
          ventaTortilla,
          ventaProductos,
          totalMerma,
          totalGastos,
          totalProveedores,
          totalVentas,
          deberiaHaber,
          diferencia,
        };
      },
    }),
    {
      name: 'osiris-corte-draft',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Solo se guardan DATOS; las funciones y `modoPendiente` se quedan fuera.
      partialize: s => ({
        fecha: s.fecha,
        paso: s.paso,
        modo: s.modo,
        productos: s.productos,
        productosInfo: s.productosInfo,
        tandas: s.tandas,
        proveedores: s.proveedores,
        gastosExtra: s.gastosExtra,
        mermaKg: s.mermaKg,
        dineroEnCaja: s.dineroEnCaja,
        notas: s.notas,
      }),
      // Si el home acaba de elegir un modo (Practicar / Hacer cuenta), ese gana sobre el guardado.
      merge: (guardado, actual) => ({
        ...actual,
        ...guardado,
        modo: actual.modoPendiente ?? guardado?.modo ?? actual.modo,
      }),
    }
  )
);

/** true cuando el borrador de localStorage ya se cargó (solo en el cliente). */
export function useHidratado() {
  // Empieza en false en servidor Y cliente (sin desajuste). En el servidor `persist` no existe
  // porque no hay localStorage, por eso el `?.`.
  const [listo, setListo] = useState(false);
  useEffect(() => {
    Promise.resolve(useCorteStore.persist?.rehydrate()).then(() => setListo(true));
  }, []);
  return listo;
}
