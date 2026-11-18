import { prisma } from '@/lib/prisma';
import { diaMX } from '@/lib/fecha';

function hoy() {
  return diaMX(); // día de Ciudad de México
}

// GET — devuelve si ya hubo ingreso hoy + stock actual
export async function GET() {
  const [ingreso, inventario] = await Promise.all([
    prisma.ingresoHarina.findUnique({ where: { fechaDia: hoy() } }),
    prisma.harinaInventario.findFirst(),
  ]);
  return Response.json({
    ingresoHoy: ingreso ?? null,
    stock: inventario?.stock ?? 0,
  });
}

// POST — registra ingreso y suma al stock
export async function POST(req) {
  const { bultos } = await req.json();
  const fechaDia = hoy();

  const existe = await prisma.ingresoHarina.findUnique({ where: { fechaDia } });
  if (existe) {
    return Response.json({ error: 'ya_ingresado', bultos: existe.bultos }, { status: 409 });
  }

  const [ingreso] = await prisma.$transaction([
    prisma.ingresoHarina.create({ data: { bultos, fechaDia } }),
    prisma.harinaInventario.updateMany({ data: { stock: { increment: bultos } } }),
  ]);

  const inventario = await prisma.harinaInventario.findFirst();
  return Response.json({ ok: true, ingreso, stockActual: inventario?.stock ?? 0 });
}
