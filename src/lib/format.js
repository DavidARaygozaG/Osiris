// Formateadores compartidos. Un solo lugar = números y fechas iguales en toda la app.

const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

const mxnCents = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** $1,234 */
export const money = n => mxn.format(Math.round(Number(n) || 0));

/** $1,234.50 */
export const moneyExact = n => mxnCents.format(Number(n) || 0);

/** Fracciones de bulto legibles: 0.5 → "½", 1.25 → "1 ¼" */
export function fraccion(n) {
  const v = Number(n) || 0;
  const entero = Math.floor(v);
  const dec = Math.round((v - entero) * 100) / 100;
  const map = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' };
  if (dec in map) return `${entero || ''}${entero && map[dec] ? ' ' : ''}${map[dec]}` || '0';
  return String(v);
}

/** "martes, 18 de noviembre" */
export const fechaLarga = (d = new Date()) =>
  new Date(d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

/** "18 nov" */
export const fechaCorta = d =>
  new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '');

/** Saludo según la hora */
export function saludo(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Estado de un corte según su diferencia (fuente de verdad; ignora el campo `estado` guardado). */
export const estadoDe = c => {
  const d = Math.round(Number(c?.diferencia) || 0);
  return d < 0 ? 'falto' : d > 0 ? 'sobro' : 'cuadro';
};

/** Tono del cuadre: ok (cuadró) | bad (faltó) | warn (sobró) */
export function cuadre(diferencia) {
  const d = Math.round(Number(diferencia) || 0);
  if (d === 0) return { tone: 'ok', label: 'Cuadró', detalle: 'No falta ni sobra nada' };
  if (d < 0) return { tone: 'bad', label: 'Faltó dinero', detalle: `Faltan ${money(Math.abs(d))}` };
  return { tone: 'warn', label: 'Sobró dinero', detalle: `Sobran ${money(d)}` };
}
