import { create } from 'zustand';

const PRECIO_KG_MERMA = 22;

const initialState = {
  paso: 1,
  modo: 'corte',      // 'corte' | 'calcular'
  productos: {},      // { [id]: cantidad }
  productosInfo: {},  // { [id]: { nombre, precio } } ← precios para calcular ventas
  tandas: [],
  proveedores: {},    // { [id]: { paso, dejo, cobro } }
  gastosExtra: [],
  mermaKg: 0,
  dineroEnCaja: 0,
  notas: '',
};

export const useCorteStore = create((set, get) => ({
  ...initialState,

  setPaso:   paso => set({ paso }),
  nextPaso:  ()   => set(s => ({ paso: Math.min(s.paso + 1, 6) })),
  prevPaso:  ()   => set(s => ({ paso: Math.max(s.paso - 1, 1) })),

  setProductoCantidad: (id, cantidad) =>
    set(s => ({ productos: { ...s.productos, [id]: cantidad } })),

  // Guarda los precios al cargar productos (necesario para calcular ventas)
  setProductosInfo: (info) => set({ productosInfo: info }),

  addTanda:    ()             => set(s => ({ tandas: [...s.tandas, { harina: 0.5, masa: 1 }] })),
  removeTanda: index          => set(s => ({ tandas: s.tandas.filter((_, i) => i !== index) })),
  updateTanda: (index, field, value) =>
    set(s => ({ tandas: s.tandas.map((t, i) => (i === index ? { ...t, [field]: value } : t)) })),

  setProveedor: (id, data) =>
    set(s => ({ proveedores: { ...s.proveedores, [id]: { paso: false, dejo: 0, cobro: 0, ...s.proveedores[id], ...data } } })),

  addGasto:    ()             => set(s => ({ gastosExtra: [...s.gastosExtra, { concepto: '', monto: 0 }] })),
  removeGasto: index          => set(s => ({ gastosExtra: s.gastosExtra.filter((_, i) => i !== index) })),
  updateGasto: (index, field, value) =>
    set(s => ({ gastosExtra: s.gastosExtra.map((g, i) => (i === index ? { ...g, [field]: value } : g)) })),

  setMermaKg:      kg  => set({ mermaKg: Number(kg) }),
  setModo:         m   => set({ modo: m }),
  setDineroEnCaja: val => set({ dineroEnCaja: val }),
  setNotas:        val => set({ notas: val }),

  reset: () => set(initialState),

  calcularTotales: () => {
    const { tandas, productos, productosInfo, proveedores, gastosExtra, mermaKg, dineroEnCaja } = get();

    // ── Producción ────────────────────────────────────────────────────────
    const totalBultos   = tandas.reduce((acc, t) => acc + t.harina + t.masa, 0);
    const ventaTortilla = Math.round(totalBultos * 880);

    // ── Venta de productos (precio × cantidad) ────────────────────────────
    const ventaProductos = Object.entries(productos).reduce((acc, [id, cantidad]) => {
      const precio = productosInfo[Number(id)]?.precio ?? 0;
      return acc + precio * cantidad;
    }, 0);

    // ── Gastos ────────────────────────────────────────────────────────────
    const totalMerma        = mermaKg * PRECIO_KG_MERMA;
    const totalGastosExtras = gastosExtra.reduce((acc, g) => acc + Number(g.monto ?? 0), 0);
    // Cobro de proveedores que pasaron
    const totalProveedores  = Object.values(proveedores).reduce((acc, p) =>
      acc + (p.paso ? Number(p.cobro ?? 0) : 0), 0);

    const totalGastos  = totalGastosExtras + totalMerma + totalProveedores;

    // ── Cuadre ────────────────────────────────────────────────────────────
    const totalVentas  = ventaTortilla + ventaProductos;
    const deberiaHaber = totalVentas - totalGastos;
    const diferencia   = dineroEnCaja - deberiaHaber;

    return {
      totalBultos, ventaTortilla, ventaProductos,
      totalMerma, totalGastos, totalProveedores,
      totalVentas, deberiaHaber, diferencia,
    };
  },
}));
