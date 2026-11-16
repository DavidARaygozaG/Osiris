import { prisma } from '@/lib/prisma';

export async function GET() {
  const cortes = await prisma.corte.findMany({
    orderBy: { fecha: 'desc' },
    include: {
      gastos: true,
      tandas: true,
      productos: {
        include: {
          producto: { select: { nombre: true, precio: true } },
        },
      },
      proveedores: {
        include: {
          proveedor: { select: { nombre: true, productoId: true } },
        },
      },
      _count: { select: { tandas: true } },
    },
  });
  return Response.json(cortes);
}
