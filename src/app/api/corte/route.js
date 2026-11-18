import { prisma } from '@/lib/prisma';
import { diaMX, inicioDiaMX } from '@/lib/fecha';

export async function POST(request) {
  const body = await request.json();
  const {
    productos, proveedores, tandas, gastosExtra,
    dineroEnCaja, notas, totalBultos, ventaTortilla,
    ventaProductos, totalGastos, totalVentas, deberiaHaber, diferencia,
  } = body;

  // ── Regla: un solo corte por día ─────────────────────────────────────────
  // El "día" es el de Ciudad de México (no UTC). También se busca por la hora real de guardado
  // para detectar cuentas viejas guardadas con el día UTC equivocado.
  const fechaDia = diaMX();
  const desde    = inicioDiaMX(fechaDia);
  const hasta    = new Date(desde.getTime() + 24 * 60 * 60 * 1000);
  const existe   = await prisma.corte.findFirst({
    where: { OR: [{ fechaDia }, { fecha: { gte: desde, lt: hasta } }] },
  });
  if (existe) return Response.json({ error: 'ya_existe' }, { status: 409 });

  // Valores del schema: cuadro | falto | sobro (antes "sobró" se guardaba como "coincidio")
  const estado = diferencia < 0 ? 'falto' : diferencia > 0 ? 'sobro' : 'cuadro';

  // ── Harina consumida (solo tanda.harina, NO masa) ────────────────────────
  const harinaBultos = (tandas ?? []).reduce((acc, t) => acc + (t.harina ?? 0), 0);

  // ── Proveedores que pasaron: separar harina vs. producto ─────────────────
  // Cargar el catalogo para saber el productoId de cada proveedor
  const proveedorIds = Object.keys(proveedores ?? {}).map(Number);
  const catalogoProveedores = proveedorIds.length
    ? await prisma.proveedor.findMany({ where: { id: { in: proveedorIds } } })
    : [];
  const provCatalogo = Object.fromEntries(catalogoProveedores.map(p => [p.id, p]));

  // Proveedores que efectivamente dejaron algo
  const provActivos = Object.entries(proveedores ?? {})
    .filter(([, data]) => data.paso && data.dejo > 0);

  // Harina recibida (proveedor sin productoId vinculado)
  const harinaRecibida = provActivos
    .filter(([id]) => provCatalogo[Number(id)]?.productoId == null)
    .reduce((acc, [, data]) => acc + data.dejo, 0);

  // Productos recibidos de proveedores { productoId -> totalDejo }
  const productosRecibidos = {};
  for (const [id, data] of provActivos) {
    const prodId = provCatalogo[Number(id)]?.productoId;
    if (prodId != null) {
      productosRecibidos[prodId] = (productosRecibidos[prodId] ?? 0) + data.dejo;
    }
  }

  // ── Productos vendidos con cantidad > 0 ──────────────────────────────────
  const productosVendidos = Object.entries(productos ?? {})
    .filter(([, cantidad]) => cantidad > 0);

  // ── Transacción atómica ───────────────────────────────────────────────────
  const [corte] = await prisma.$transaction([
    // 1. Crear corte con relaciones
    prisma.corte.create({
      data: {
        fechaDia,
        totalBultos:    Math.round(totalBultos),
        ventaTortilla,
        ventaProductos: ventaProductos ?? 0,
        totalGastos,
        totalVentas,
        deberiaHaber,
        dineroEnCaja,
        diferencia,
        estado,
        notas,
        tandas: { create: tandas ?? [] },
        productos: {
          create: productosVendidos.map(([productoId, cantidad]) => ({
            productoId: Number(productoId),
            cantidad,
            subtotal: 0,
          })),
        },
        proveedores: {
          create: Object.entries(proveedores ?? {}).map(([proveedorId, data]) => ({
            proveedorId: Number(proveedorId),
            ...data,
          })),
        },
        gastos: {
          create: (gastosExtra ?? [])
            .filter(g => g.concepto)
            .map(g => ({ concepto: g.concepto, monto: Number(g.monto) })),
        },
      },
    }),

    // 2. Descontar stock de cada producto vendido
    ...productosVendidos.map(([id, cantidad]) =>
      prisma.producto.update({
        where: { id: Number(id) },
        data:  { stock: { decrement: cantidad } },
      })
    ),

    // 3. Sumar al stock de productos recibidos de proveedores
    ...Object.entries(productosRecibidos).map(([prodId, total]) =>
      prisma.producto.update({
        where: { id: Number(prodId) },
        data:  { stock: { increment: total } },
      })
    ),

    // 4. Harina: descuenta lo consumido, suma lo recibido de proveedores de harina
    prisma.harinaInventario.updateMany({
      data: { stock: { decrement: harinaBultos - harinaRecibida } },
    }),
  ]);

  return Response.json({ ok: true, id: corte.id });
}
