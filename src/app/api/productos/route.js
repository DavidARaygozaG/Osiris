import { esAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

// GET — todos los activos (o todos si ?all=true para admin)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all') === 'true';

  const productos = await prisma.producto.findMany({
    where: all ? {} : { activo: true },
    orderBy: { nombre: 'asc' },
  });
  return Response.json(productos);
}

// POST — crear nuevo producto (admin)
export async function POST(req) {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  const { nombre, precio } = await req.json();
  if (!nombre || !precio) {
    return Response.json({ error: 'nombre y precio requeridos' }, { status: 400 });
  }
  const producto = await prisma.producto.create({
    data: { nombre, precio: Number(precio), stock: 0 },
  });
  return Response.json(producto);
}
