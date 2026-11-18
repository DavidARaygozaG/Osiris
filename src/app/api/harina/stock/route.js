import { esAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const inventario = await prisma.harinaInventario.findFirst();
    return Response.json({ stock: inventario?.stock ?? 0 });
  } catch {
    return Response.json({ stock: 0 });
  }
}

export async function PUT(req) {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  try {
    const { stock } = await req.json();
    const existing = await prisma.harinaInventario.findFirst();
    if (existing) {
      await prisma.harinaInventario.update({ where: { id: existing.id }, data: { stock: Number(stock) } });
    } else {
      await prisma.harinaInventario.create({ data: { stock: Number(stock) } });
    }
    return Response.json({ ok: true, stock: Number(stock) });
  } catch {
    return Response.json({ error: 'error al actualizar' }, { status: 500 });
  }
}
