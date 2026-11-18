// Emoji por tipo de producto. Se asigna por nombre; si no existe, se busca por
// palabra clave y al final se usa el genérico.
// Aprende: así un producto nuevo desde el admin ya sale con icono razonable sin tocar código.
const META = {
  salsas: { emoji: '🌶️' },
  frijoles: { emoji: '🫘' },
  arroz: { emoji: '🍚' },
  totopos: { emoji: '🔺' },
  jarochas: { emoji: '🥜' },
  molcajete: { emoji: '🪨' },
  guacamoles: { emoji: '🥑' },
  sopes: { emoji: '🫓' },
  tostadas: { emoji: '🌽' },
  tortilla: { emoji: '🫓' },
  harina: { emoji: '🌾' },
};

const PALABRAS = [
  ['salsa', 'salsas'],
  ['frijol', 'frijoles'],
  ['arroz', 'arroz'],
  ['totopo', 'totopos'],
  ['guac', 'guacamoles'],
  ['aguacate', 'guacamoles'],
  ['sope', 'sopes'],
  ['tostada', 'tostadas'],
  ['maiz', 'tostadas'],
  ['tortilla', 'tortilla'],
  ['harina', 'harina'],
  ['jaroch', 'jarochas'],
  ['molcaj', 'molcajete'],
];

const GENERICO = { emoji: '🛒' };

export function metaProducto(nombre = '') {
  const n = String(nombre).trim().toLowerCase();
  if (META[n]) return META[n];
  const hit = PALABRAS.find(([k]) => n.includes(k));
  return hit ? META[hit[1]] : GENERICO;
}
