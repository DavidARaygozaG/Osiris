import { prisma } from '@/lib/prisma';

export async function GET() {
  const rows = await prisma.config.findMany();
  const config = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return Response.json(config);
}

export async function PUT(req) {
  const body = await req.json(); // { key, value }
  const row = await prisma.config.upsert({
    where:  { key: body.key },
    update: { value: String(body.value) },
    create: { key: body.key, value: String(body.value) },
  });
  return Response.json(row);
}
