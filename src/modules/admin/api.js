// Cliente mínimo para las rutas /api. Un solo lugar = errores siempre en español claro.
// Lanza Error con un mensaje listo para mostrar al usuario (nunca alert).
import { useAdminStore } from '@/stores/useAdminStore';

export async function api(url, { method = 'GET', body, errorMsg } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('No hay conexión. Revisa tu internet e intenta otra vez.');
  }
  if (res.status === 401) {
    // La sesión de admin del servidor venció (dura 12 h): se regresa a la pantalla del PIN
    useAdminStore.getState().logout();
    throw new Error('Tu sesión de admin terminó. Entra otra vez con tu PIN.');
  }
  if (!res.ok) throw new Error(errorMsg ?? 'No se pudo completar. Intenta otra vez.');
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
