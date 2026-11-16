'use client';

import { useMemo } from 'react';

const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Analiza el array de cortes y devuelve estadísticas agregadas:
 *  - totalCortes, totalVentas, totalGastos, totalNeto, promedioVentas
 *  - coincidencia (% de cortes con estado 'coincidio')
 *  - rachaActual (días consecutivos con corte coincidio hacia atrás desde hoy)
 *  - mejorDia ({ dia, ventas, pct }) día de la semana con mayor venta promedio
 *  - productoEstrella ({ nombre, cantidad, subtotal })
 *  - sparkline (array de ventas por día del mes filtrado)
 *  - insights (string[] generados por reglas)
 *
 * @param {Array} cortes Cortes con productos.producto, totalVentas, totalGastos, estado, fecha
 * @param {Object} opts  { year, month } para filtrar al mes seleccionado (opcional)
 */
export function useHistorialStats(cortes, { year, month } = {}) {
  return useMemo(() => {
    if (!Array.isArray(cortes) || cortes.length === 0) {
      return {
        totalCortes: 0, totalVentas: 0, totalGastos: 0, totalNeto: 0,
        promedioVentas: 0, coincidencia: 0, rachaActual: 0,
        mejorDia: null, productoEstrella: null,
        sparkline: [], insights: [], cortesMes: [],
      };
    }

    // Filtra al mes si se especifica
    const cortesMes = (year != null && month != null)
      ? cortes.filter(c => {
          const d = new Date(c.fecha);
          return d.getFullYear() === year && d.getMonth() === month;
        })
      : cortes;

    const totalCortes  = cortesMes.length;
    const totalVentas  = cortesMes.reduce((a, c) => a + (c.totalVentas || 0), 0);
    const totalGastos  = cortesMes.reduce((a, c) => a + (c.totalGastos || 0), 0);
    const totalNeto    = totalVentas - totalGastos;
    const promedioVentas = totalCortes ? totalVentas / totalCortes : 0;

    const coincididos  = cortesMes.filter(c => c.estado === 'coincidio').length;
    const coincidencia = totalCortes ? (coincididos / totalCortes) * 100 : 0;

    // Racha actual: cortes consecutivos hacia atrás desde el más reciente
    const sortedDesc = [...cortes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    let rachaActual = 0;
    for (const c of sortedDesc) {
      if (c.estado === 'coincidio') rachaActual++;
      else break;
    }

    // Mejor día de la semana (por ventas promedio)
    const dowAgg = Array.from({ length: 7 }, () => ({ total: 0, n: 0 }));
    cortesMes.forEach(c => {
      const dow = new Date(c.fecha).getDay();
      dowAgg[dow].total += c.totalVentas || 0;
      dowAgg[dow].n     += 1;
    });
    const dowProm = dowAgg.map((d, i) => ({ dia: DOW[i], prom: d.n ? d.total / d.n : 0 }));
    const mejorDia = dowProm.reduce((best, cur) => cur.prom > (best?.prom ?? 0) ? cur : best, null);
    const promGlobal = promedioVentas || 1;
    if (mejorDia) mejorDia.pct = ((mejorDia.prom - promGlobal) / promGlobal) * 100;

    // Producto estrella (suma de cantidad * precio)
    const prodMap = {};
    cortesMes.forEach(c => {
      (c.productos || []).forEach(p => {
        const key = p.producto?.nombre ?? `prod-${p.productoId}`;
        if (!prodMap[key]) prodMap[key] = { nombre: key, cantidad: 0, subtotal: 0 };
        prodMap[key].cantidad += p.cantidad;
        prodMap[key].subtotal += p.cantidad * (p.producto?.precio ?? 0);
      });
    });
    const productoEstrella = Object.values(prodMap).sort((a, b) => b.subtotal - a.subtotal)[0] ?? null;

    // Sparkline: ventas por día del mes (rellena con 0)
    let sparkline = [];
    if (year != null && month != null) {
      const totalDias = new Date(year, month + 1, 0).getDate();
      sparkline = Array.from({ length: totalDias }, () => 0);
      cortesMes.forEach(c => {
        const d = new Date(c.fecha).getDate();
        sparkline[d - 1] = c.totalVentas || 0;
      });
    }

    // Insights por reglas
    const insights = [];
    if (rachaActual >= 3)  insights.push(`🔥 Llevas ${rachaActual} días seguidos cuadrando caja`);
    if (coincidencia >= 80 && totalCortes >= 5) insights.push(`💎 ${coincidencia.toFixed(0)}% de coincidencia este mes — excelente control`);
    if (mejorDia && mejorDia.pct > 15) insights.push(`📈 Los ${mejorDia.dia.toLowerCase()} vendes ${mejorDia.pct.toFixed(0)}% más que el promedio`);
    if (productoEstrella) insights.push(`⭐ ${productoEstrella.nombre} es tu producto estrella (${productoEstrella.cantidad} vendidos)`);

    return {
      totalCortes, totalVentas, totalGastos, totalNeto,
      promedioVentas, coincidencia, rachaActual,
      mejorDia, productoEstrella, sparkline, insights, cortesMes,
    };
  }, [cortes, year, month]);
}
