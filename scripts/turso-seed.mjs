/**
 * turso-seed.mjs
 * ─────────────────────────────────────────────────────────────────
 * Puebla Turso con datos de ejemplo usando el adapter LibSQL.
 * El seed.js normal conecta al SQLite local — este conecta a Turso.
 *
 * Uso:  bun run db:seed-turso
 * ─────────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql }  from '@prisma/adapter-libsql';
import { config }        from 'dotenv';

config();

const url       = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() ?? '';

if (!url) {
  console.error('❌  TURSO_DATABASE_URL no está en .env');
  process.exit(1);
}

console.log(`\n🔌  Conectando a Turso: ${url}\n`);

const adapter = new PrismaLibSql({ url, authToken });
const prisma  = new PrismaClient({ adapter });

// ─── Helpers ────────────────────────────────────────────────────────────────

function rand(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed en Turso…\n');

  // ── Productos ──────────────────────────────────────────────────────────────
  const productosData = [
    { nombre: 'Salsas',      precio: 20 },
    { nombre: 'Frijoles',    precio: 25 },
    { nombre: 'Arroz',       precio: 25 },
    { nombre: 'Totopos',     precio: 35 },
    { nombre: 'Jarochas',    precio: 22 },
    { nombre: 'Molcajete',   precio: 20 },
    { nombre: 'Guacamoles',  precio: 20 },
    { nombre: 'Sopes',       precio: 25 },
  ];

  for (const p of productosData) {
    await prisma.producto.upsert({
      where:  { nombre: p.nombre },
      update: {},
      create: p,
    });
  }
  console.log('✅  Productos creados/verificados');

  // ── Configuración base ─────────────────────────────────────────────────────
  const configData = [
    { key: 'precio_tortilla', value: '880' },
    { key: 'admin_pin',       value: '1234' },
    { key: 'meta_mensual',    value: '80000' },
  ];

  for (const c of configData) {
    await prisma.config.upsert({
      where:  { key: c.key },
      update: {},
      create: c,
    });
  }
  console.log('✅  Configuración creada/verificada');

  // ── Proveedores ────────────────────────────────────────────────────────────
  const proveedoresData = ['Salsas', 'Guacamoles', 'Jarochas'];
  for (const nombre of proveedoresData) {
    await prisma.proveedor.upsert({
      where:  { nombre },
      update: {},
      create: { nombre },
    });
  }
  console.log('✅  Proveedores creados/verificados');

  // ── Inventario de harina inicial ───────────────────────────────────────────
  const harinaExiste = await prisma.harinaInventario.findFirst();
  if (!harinaExiste) {
    await prisma.harinaInventario.create({ data: { stock: 15 } });
    console.log('✅  Inventario de harina inicializado (15 bultos)');
  }

  // ── Cortes de los últimos 30 días ──────────────────────────────────────────
  const productos   = await prisma.producto.findMany();
  const proveedores = await prisma.proveedor.findMany();
  const hoy         = new Date();

  let creados = 0;
  let omitidos = 0;

  for (let i = 1; i <= 30; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    fecha.setHours(21, 0, 0, 0);

    // fechaDia como string "YYYY-MM-DD"
    const fechaDia = fecha.toISOString().slice(0, 10);

    // Verificar si ya existe
    const existe = await prisma.corte.findUnique({ where: { fechaDia } });
    if (existe) { omitidos++; continue; }

    const factorDia     = 0.8 + Math.random() * 0.4;
    const totalBultos   = Math.round((3 + Math.random() * 3) * factorDia);
    const ventaTortilla = totalBultos * 880;
    const ventaProductos = rand(800, 1600);
    const totalGastos   = rand(300, 700);
    const totalVentas   = ventaTortilla + ventaProductos;
    const deberiaHaber  = totalVentas - totalGastos;
    const diferencia    = i % 5 === 0 ? -rand(20, 100) : 0;
    const dineroEnCaja  = deberiaHaber + diferencia;

    await prisma.corte.create({
      data: {
        fecha,
        fechaDia,
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
          create: [
            { harina: 0.5,  masa: 1    },
            { harina: 0.5,  masa: 0.75 },
            ...(totalBultos > 4 ? [{ harina: 0.25, masa: 0.5 }] : []),
          ],
        },
        productos: {
          create: productos.map(p => {
            const cantidad = rand(5, 25);
            return { productoId: p.id, cantidad, subtotal: cantidad * p.precio };
          }),
        },
        proveedores: {
          create: proveedores.map(prov => ({
            proveedorId: prov.id,
            paso:  Math.random() > 0.3,
            dejo:  rand(0, 20),
            cobro: rand(0, 500),
          })),
        },
        gastos: {
          create: [
            { concepto: 'Gas',  monto: 200 },
            ...(Math.random() > 0.5 ? [{ concepto: 'Luz',           monto: 150                   }] : []),
            ...(Math.random() > 0.7 ? [{ concepto: 'Mantenimiento', monto: rand(100, 300)         }] : []),
            ...(Math.random() > 0.8 ? [{ concepto: 'Otros',         monto: rand(50, 150)          }] : []),
          ],
        },
      },
    });

    creados++;
    process.stdout.write(`  📅  ${fechaDia} — $${totalVentas.toLocaleString()} ventas, estado: ${diferencia < 0 ? 'falto' : 'cuadro'}\n`);
  }

  console.log(`\n✅  Cortes creados: ${creados}  |  Omitidos (ya existían): ${omitidos}`);
  console.log('\n🎉  ¡Seed en Turso completado!\n');
}

main()
  .catch(e  => { console.error('\n❌  Error en seed:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
