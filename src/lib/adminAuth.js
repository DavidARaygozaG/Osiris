// Sesión de admin REAL (en el servidor).
// Antes "ser admin" era solo una bandera en el navegador: cualquiera podía llamar al API sin PIN.
// Ahora, al poner el PIN correcto el servidor entrega una cookie firmada (HMAC) que dura 12 horas.
// Las rutas que cambian cosas delicadas llaman a `await esAdmin()` y responden 401 si no hay sesión.
//
// Aprende: una cookie httpOnly no se puede leer desde JavaScript del navegador, así que aunque
// alguien abra la consola no puede copiarla ni fabricarla: sin la clave del servidor no hay firma válida.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const COOKIE = 'osiris-admin';
const DURACION = 12 * 60 * 60; // segundos

/** PIN vigente: el de la base (si el dueño lo cambió) o el de .env. */
export async function pinActual() {
  const c = await prisma.config.findUnique({ where: { key: 'admin_pin' } });
  return c?.value ?? process.env.ADMIN_PIN ?? '1234';
}

// La firma incluye el PIN: si el dueño cambia el PIN, todas las sesiones anteriores dejan de valer.
const firmar = (exp, pin) =>
  createHmac('sha256', `${process.env.ADMIN_SESSION_SECRET ?? process.env.TURSO_AUTH_TOKEN ?? ''}|${pin}`)
    .update(String(exp))
    .digest('hex');

/** Crea la cookie de sesión (llamar solo después de validar el PIN). */
export async function iniciarSesionAdmin() {
  const exp = Math.floor(Date.now() / 1000) + DURACION;
  const jar = await cookies();
  jar.set(COOKIE, `${exp}.${firmar(exp, await pinActual())}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACION,
  });
}

export async function cerrarSesionAdmin() {
  (await cookies()).delete(COOKIE);
}

/** true si la petición trae una sesión de admin válida y vigente. */
export async function esAdmin() {
  const valor = (await cookies()).get(COOKIE)?.value;
  if (!valor) return false;
  const [exp, firma] = valor.split('.');
  if (!exp || !firma || Number(exp) < Date.now() / 1000) return false;
  const a = Buffer.from(firma);
  const b = Buffer.from(firmar(exp, await pinActual()));
  return a.length === b.length && timingSafeEqual(a, b); // comparación en tiempo constante
}
