import { prisma } from '@/lib/prisma';

export async function GET() {
  const todos = await prisma.proveedor.findMany({
    where: { activo: true },
    orderBy: { id: 'asc' },
  });

  // Padres = sin parentId, con sus hijos anidados
  const padres = todos
    .filter(p => p.parentId === null)
    .map(p => ({
      ...p,
      hijos: todos.filter(h => h.parentId === p.id),
    }));

  return Response.json(padres);
}

export async function POST(req) {
  const { nombre, productoId, parentId } = await req.json();
  const prov = await prisma.proveedor.create({
    data: {
      nombre,
      productoId: productoId ? Number(productoId) : null,
      parentId:   parentId   ? Number(parentId)   : null,
    },
  });
  return Response.json(prov);
}
