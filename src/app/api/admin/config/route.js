import { prisma } from '@/lib/prisma';
import { esAdmin } from '@/lib/adminAuth';

// Ajustes que cualquier empleado necesita LEER (precios y meta). El PIN nunca sale por aquí.
const PUBLICAS = ['meta_mensual', 'precio_bulto_harina', 'precio_kg_merma'];
// Ajustes que el admin puede ESCRIBIR. `numero` = debe ser un número ≥ 0; `pin` = 4 a 8 dígitos.
const EDITABLES = {
  meta_mensual: 'numero',
  precio_bulto_harina: 'numero',
  precio_kg_merma: 'numero',
  admin_pin: 'pin',
};

export async function GET() {
  const rows = await prisma.config.findMany();
  const admin = await esAdmin();
  const config = Object.fromEntries(
    rows
      .filter(r => r.key !== 'admin_pin' && (admin || PUBLICAS.includes(r.key))) // el PIN jamás se devuelve
      .map(r => [r.key, r.value])
  );
  return Response.json(config);
}

export async function PUT(req) {
  // Solo el admin (con sesión del servidor) puede cambiar ajustes
  if (!(await esAdmin())) return Response.json({ error: 'no_autorizado' }, { status: 401 });

  const { key, value } = await req.json(); // { key, value }
  const tipo = EDITABLES[key];
  if (!tipo) return Response.json({ error: 'ajuste_desconocido' }, { status: 400 });

  const texto = String(value ?? '').trim();
  if (tipo === 'numero' && !(texto !== '' && Number.isFinite(Number(texto)) && Number(texto) >= 0)) {
    return Response.json({ error: 'valor_invalido' }, { status: 400 });
  }
  if (tipo === 'pin' && !/^\d{4,8}$/.test(texto)) {
    return Response.json({ error: 'valor_invalido' }, { status: 400 });
  }

  await prisma.config.upsert({
    where: { key },
    update: { value: texto },
    create: { key, value: texto },
  });
  // No se devuelve la fila completa (podría ser el PIN)
  return Response.json({ ok: true, key });
}
