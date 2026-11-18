import { esAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function PUT(req, { params }) {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  const { id: idStr } = await params;
  const id   = Number(idStr);
  const body = await req.json();
  const data = {};
  if (body.nombre     !== undefined) data.nombre     = body.nombre;
  if (body.activo     !== undefined) data.activo     = body.activo;
  if (body.productoId !== undefined) data.productoId = body.productoId ? Number(body.productoId) : null;
  if (body.parentId   !== undefined) data.parentId   = body.parentId   ? Number(body.parentId)   : null;
  const prov = await prisma.proveedor.update({ where: { id }, data });
  return Response.json(prov);
}

export async function DELETE(req, { params }) {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  const { id: idStr } = await params;
  const id = Number(idStr);
  await prisma.proveedor.delete({ where: { id } });
  return Response.json({ ok: true });
}
