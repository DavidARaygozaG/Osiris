import { esAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { inicioMesMX } from '@/lib/fecha';

export async function GET() {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  const inicioMes = inicioMesMX(); // inicio del mes en hora de Ciudad de México

  const [cortesMes, todos] = await Promise.all([
    prisma.corte.findMany({
      where:   { fecha: { gte: inicioMes } },
      orderBy: { fecha: 'asc' },
    }),
    prisma.corte.findMany({
      orderBy: { fecha: 'desc' },
      take: 60,
      include: {
        productos:   { include: { producto: true } },
        tandas:      true,
        proveedores: { include: { proveedor: true } },
        gastos:      true,
      },
    }),
  ]);

  const totalVentasMes = cortesMes.reduce((a, c) => a + c.totalVentas, 0);
  const promedioDiario = cortesMes.length ? totalVentasMes / cortesMes.length : 0;
  const diasConFalta   = cortesMes.filter(c => c.diferencia < 0).length;
  const mejorDia       = cortesMes.reduce((best, c) => (!best || c.totalVentas > best.totalVentas ? c : best), null);

  const grafica = todos
    // El estado se deriva de la diferencia: también corrige cortes viejos guardados como "coincidio"
    .map(c => ({ fecha: c.fecha, ventas: c.totalVentas, estado: c.diferencia < 0 ? 'falto' : c.diferencia > 0 ? 'sobro' : 'cuadro' }))
    .reverse();

  return Response.json({
    totalVentasMes,
    promedioDiario,
    diasConFalta,
    totalCortesMes: cortesMes.length,
    mejorDia: mejorDia ? { fecha: mejorDia.fecha, ventas: mejorDia.totalVentas } : null,
    grafica,
    ultimosCortes: todos,   // todos con detalle completo
  });
}
