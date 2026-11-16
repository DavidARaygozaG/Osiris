import { prisma } from '@/lib/prisma';

export async function GET() {
  const hoy       = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

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
  const diasConFalta   = cortesMes.filter(c => c.estado === 'falto').length;
  const mejorDia       = cortesMes.reduce((best, c) => (!best || c.totalVentas > best.totalVentas ? c : best), null);

  const grafica = todos
    .map(c => ({ fecha: c.fecha, ventas: c.totalVentas, estado: c.estado }))
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
