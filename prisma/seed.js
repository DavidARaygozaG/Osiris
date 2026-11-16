const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── Productos ───────────────────────────────────────────────────────────────
  const productosData = [
    { nombre: 'Salsas', precio: 20 },
    { nombre: 'Frijoles', precio: 25 },
    { nombre: 'Arroz', precio: 25 },
    { nombre: 'Totopos', precio: 35 },
    { nombre: 'Jarochas', precio: 22 },
    { nombre: 'Molcajete', precio: 20 },
    { nombre: 'Guacamoles', precio: 20 },
    { nombre: 'Sopes', precio: 25 },
  ];

  for (const p of productosData) {
    await prisma.producto.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: p,
    });
  }
  console.log('✅ Productos creados');

  // ── Proveedores ─────────────────────────────────────────────────────────────
  const proveedoresData = ['Salsas', 'Guacamoles', 'Jarochas'];
  for (const nombre of proveedoresData) {
    await prisma.proveedor.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log('✅ Proveedores creados');

  // ── Cortes de los últimos 30 días ────────────────────────────────────────────
  const productos = await prisma.producto.findMany();
  const proveedores = await prisma.proveedor.findMany();
  const hoy = new Date();

  for (let i = 1; i <= 30; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    fecha.setHours(21, 0, 0, 0); // 8pm simulando cierre

    // Variación aleatoria para datos realistas
    const factorDia = 0.8 + Math.random() * 0.4;
    const totalBultos = Math.round((3 + Math.random() * 3) * factorDia);
    const ventaTortilla = totalBultos * 880;
    const ventaProductos = Math.round(800 + Math.random() * 800);
    const totalGastos = Math.round(300 + Math.random() * 400);
    const totalVentas = ventaTortilla + ventaProductos;
    const deberiaHaber = totalVentas - totalGastos;
    const diferencia = i % 5 === 0 ? -Math.round(Math.random() * 100) : 0;
    const dineroEnCaja = deberiaHaber + diferencia;

    // Verificar si ya existe para evitar duplicados
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const existe = await prisma.corte.findFirst({
      where: { fecha: { gte: fechaInicio, lte: fechaFin } },
    });
    if (existe) continue;

    const corte = await prisma.corte.create({
      data: {
        fecha,
        totalBultos,
        ventaTortilla,
        ventaProductos,
        totalGastos,
        totalVentas,
        deberiaHaber,
        dineroEnCaja,
        diferencia,
        estado: diferencia < 0 ? 'falto' : diferencia > 0 ? 'sobro' : 'cuadro',
        tandas: {
          create: [{ harina: 0.5, masa: 1 }, { harina: 0.5, masa: 0.75 }, ...(totalBultos > 4 ? [{ harina: 0.25, masa: 0.5 }] : [])],
        },
        productos: {
          create: productos.map(p => ({
            productoId: p.id,
            cantidad: Math.round(5 + Math.random() * 20),
            subtotal: Math.round((5 + Math.random() * 20) * p.precio),
          })),
        },
        proveedores: {
          create: proveedores.map(prov => ({
            proveedorId: prov.id,
            paso: Math.random() > 0.3,
            dejo: Math.round(Math.random() * 20),
            cobro: Math.round(Math.random() * 500),
          })),
        },
        gastos: {
          create: [
            { concepto: 'Gas', monto: 200 },
            ...(Math.random() > 0.5 ? [{ concepto: 'Luz', monto: 150 }] : []),
            ...(Math.random() > 0.7 ? [{ concepto: 'Mantenimiento', monto: Math.round(100 + Math.random() * 200) }] : []),
          ],
        },
      },
    });
  }

  console.log('✅ 30 cortes de ejemplo creados');
  console.log('🎉 Seed completado!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
