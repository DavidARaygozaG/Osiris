import { esAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function PUT(req, { params }) {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  const { id: idStr } = await params;
  const id = Number(idStr);
  const { nombre, precio, stock, activo } = await req.json();

  const data = {};
  if (nombre  !== undefined) data.nombre  = nombre;
  if (precio  !== undefined) data.precio  = Number(precio);
  if (stock   !== undefined) data.stock   = Number(stock);
  if (activo  !== undefined) data.activo  = activo;

  const producto = await prisma.producto.update({ where: { id }, data });
  return Response.json(producto);
}

export async function DELETE(req, { params }) {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  const { id: idStr } = await params;
  const id = Number(idStr);
  await prisma.producto.delete({ where: { id } });
  return Response.json({ ok: true });
}
