import { cerrarSesionAdmin, esAdmin, iniciarSesionAdmin, pinActual } from '@/lib/adminAuth';

// POST { pin } → si es correcto, crea la sesión (cookie firmada) y responde { ok: true }
export async function POST(req) {
  const { pin } = await req.json();
  const ok = typeof pin === 'string' && pin === (await pinActual());
  if (ok) await iniciarSesionAdmin();
  return Response.json({ ok });
}

// GET → ¿hay sesión de admin vigente? (la pantalla lo usa para no confiar solo en el navegador)
export async function GET() {
  return Response.json({ admin: await esAdmin() });
}

// DELETE → cerrar sesión de admin
export async function DELETE() {
  await cerrarSesionAdmin();
  return Response.json({ ok: true });
}
