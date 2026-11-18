'use client';

import { useMemo } from 'react';
import { cuadre } from '@/lib/format';
import { diaMX } from '@/lib/fecha';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Día real de la cuenta en Ciudad de México, calculado de la hora de guardado (así también se
// corrigen las cuentas viejas guardadas con el día UTC).
export const claveDia = c => diaMX(c.fecha);

/** Estado normalizado desde la diferencia de caja: 'ok' | 'bad' | 'warn' (el campo estado viejo no es confiable). */
export const toneDe = c => cuadre(c.diferencia).tone;

/**
 * Resume el mes elegido. Devuelve cifras simples y frases listas para mostrar.
 * useMemo evita recalcular mientras cortes/mes no cambien.
 */
export function useHistorialStats(cortes, year, month) {
  return useMemo(() => {
    const prefijo = `${year}-${String(month + 1).padStart(2, '0')}`;
    const cortesMes = (Array.isArray(cortes) ? cortes : []).filter(c => claveDia(c).startsWith(prefijo));

    const totalCortes = cortesMes.length;
    const totalVentas = cortesMes.reduce((a, c) => a + (c.totalVentas || 0), 0);
    const cuadraron = cortesMes.filter(c => toneDe(c) === 'ok').length;
    const faltaron = cortesMes.filter(c => toneDe(c) === 'bad').length;
    const sobraron = cortesMes.filter(c => toneDe(c) === 'warn').length;

    // Racha: días seguidos que cuadró, contando desde el corte más reciente
    const recientes = [...(cortes ?? [])].sort((a, b) => claveDia(b).localeCompare(claveDia(a)));
    let racha = 0;
    for (const c of recientes) {
      if (toneDe(c) === 'ok') racha++;
      else break;
    }

    // Mejor día de la semana por venta promedio
    const porDia = Array.from({ length: 7 }, () => ({ total: 0, n: 0 }));
    cortesMes.forEach(c => {
      const [y, m, d] = claveDia(c).split('-').map(Number);
      const i = new Date(y, m - 1, d).getDay();
      porDia[i].total += c.totalVentas || 0;
      porDia[i].n += 1;
    });
    let mejorDia = null;
    porDia.forEach((x, i) => {
      if (x.n && (!mejorDia || x.total / x.n > mejorDia.prom)) mejorDia = { nombre: DIAS[i], prom: x.total / x.n };
    });

    // Producto con más venta en el mes
    const prod = {};
    cortesMes.forEach(c =>
      (c.productos ?? []).forEach(p => {
        const n = p.producto?.nombre ?? 'Producto';
        prod[n] ??= { nombre: n, cantidad: 0, subtotal: 0 };
        prod[n].cantidad += p.cantidad || 0;
        prod[n].subtotal += p.subtotal ?? (p.cantidad || 0) * (p.producto?.precio ?? 0);
      })
    );
    const mejor = Object.values(prod).sort((a, b) => b.subtotal - a.subtotal)[0];
    const productoEstrella = mejor && mejor.subtotal > 0 ? mejor : null; // sin venta no hay estrella

    return { cortesMes, totalCortes, totalVentas, cuadraron, faltaron, sobraron, racha, mejorDia, productoEstrella };
  }, [cortes, year, month]);
}
