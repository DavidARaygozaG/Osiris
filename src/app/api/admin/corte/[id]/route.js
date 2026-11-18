import { esAdmin } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req, { params }) {
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });
  const { id: idStr } = await params;
  const id = Number(idStr);

  // 1. Leer corte con todos los datos para revertir inventario
  const corte = await prisma.corte.findUnique({
    where: { id },
    include: {
      productos:    true,
      tandas:       true,
      proveedores:  {
        include: { proveedor: true }, // necesitamos productoId del proveedor
      },
    },
  });
  if (!corte) return Response.json({ error: 'no_encontrado' }, { status: 404 });

  // 2. Harina neta consumida (revertir)
  const harinaBultos   = corte.tandas.reduce((a, t) => a + (t.harina ?? 0), 0);
  const harinaRecibida = corte.proveedores
    .filter(cp => cp.paso && cp.dejo > 0 && cp.proveedor.productoId == null)
    .reduce((a, cp) => a + cp.dejo, 0);
  const harinaNeta = harinaBultos - harinaRecibida;

  // 3. Productos recibidos de proveedores (revertir)
  const productosRecibidos = {};
  for (const cp of corte.proveedores) {
    if (cp.paso && cp.dejo > 0 && cp.proveedor.productoId != null) {
      const pid = cp.proveedor.productoId;
      productosRecibidos[pid] = (productosRecibidos[pid] ?? 0) + cp.dejo;
    }
  }

  // 4. Transacción: eliminar + revertir todo
  await prisma.$transaction([
    // Eliminar corte (Cascade borra hijos)
    prisma.corte.delete({ where: { id } }),

    // Restaurar stock de productos vendidos
    ...corte.productos.map(cp =>
      prisma.producto.update({
        where: { id: cp.productoId },
        data:  { stock: { increment: cp.cantidad } },
      })
    ),

    // Revertir stock de productos que dejaron proveedores
    ...Object.entries(productosRecibidos).map(([prodId, total]) =>
      prisma.producto.update({
        where: { id: Number(prodId) },
        data:  { stock: { decrement: total } },
      })
    ),

    // Restaurar harina neta
    prisma.harinaInventario.updateMany({
      data: { stock: { increment: harinaNeta } },
    }),
  ]);

  return Response.json({ ok: true });
}
