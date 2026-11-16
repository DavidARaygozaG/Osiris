import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const { pin } = await req.json();

  const config = await prisma.config.findUnique({ where: { key: 'admin_pin' } });
  const pinCorrecto = config?.value ?? process.env.ADMIN_PIN ?? '1234';

  return Response.json({ ok: pin === pinCorrecto });
}
