/**
 * fix-fechadia.mjs
 * ─────────────────────────────────────────────────────────────────
 * Corrige `fechaDia` de cortes e ingresos de harina guardados con el día UTC
 * (una cuenta hecha después de las 6 pm quedó con el día siguiente).
 * El día correcto sale de la hora real de guardado, en Ciudad de México (UTC-6).
 *
 * Por defecto NO escribe nada: solo muestra qué cambiaría (modo prueba).
 *   Ver cambios:   node scripts/fix-fechadia.mjs
 *   Aplicarlos:    node scripts/fix-fechadia.mjs --apply
 * Usa TURSO_DATABASE_URL / TURSO_AUTH_TOKEN de tu .env (la base real).
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

const APLICAR = process.argv.includes('--apply');
const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() ?? '';

if (!url) {
  console.error('❌  TURSO_DATABASE_URL no está en .env');
  process.exit(1);
}

const db = createClient({ url, authToken });

// Mismo cálculo que src/lib/fecha.js (día de Ciudad de México)
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' });
const diaMX = valor => fmt.format(new Date(valor));

/** Convierte lo que guarda la base (ms desde 1970, o texto ISO) en una fecha válida. */
function aFecha(v) {
  if (typeof v === 'number' || /^\d+$/.test(String(v))) return new Date(Number(v));
  return new Date(v);
}

async function revisar(tabla, columnaFecha) {
  const { rows } = await db.execute(`SELECT id, ${columnaFecha} AS f, fechaDia FROM ${tabla} ORDER BY id`);
  const cambios = [];
  for (const r of rows) {
    const f = aFecha(r.f);
    if (Number.isNaN(f.getTime())) continue;
    const correcto = diaMX(f);
    if (r.fechaDia !== correcto) cambios.push({ id: r.id, de: r.fechaDia, a: correcto });
  }
  return cambios;
}

async function main() {
  console.log(`\n🔌  Base: ${url}`);
  console.log(APLICAR ? '✍️   MODO APLICAR\n' : '👀  Modo prueba (no se escribe nada)\n');

  for (const [tabla, col] of [
    ['Corte', 'fecha'],
    ['IngresoHarina', 'fecha'],
  ]) {
    let cambios;
    try {
      cambios = await revisar(tabla, col);
    } catch (e) {
      console.log(`⚠️   ${tabla}: no se pudo revisar (${e.message.split('\n')[0]})`);
      continue;
    }
    console.log(`${tabla}: ${cambios.length ? cambios.length + ' por corregir' : 'todo correcto'}`);
    // Se aplican de mayor a menor id para no chocar con la restricción de día único
    for (const c of cambios.sort((a, b) => b.id - a.id)) {
      console.log(`   #${c.id}: ${c.de} → ${c.a}`);
      if (APLICAR) {
        try {
          await db.execute({ sql: `UPDATE ${tabla} SET fechaDia = ? WHERE id = ?`, args: [c.a, c.id] });
        } catch (e) {
          console.log(`      ❌ no se pudo (${e.message.split('\n')[0]}): ya hay otro registro con ese día`);
        }
      }
    }
  }
  console.log(APLICAR ? '\n✅  Listo.\n' : '\nPara aplicar los cambios: node scripts/fix-fechadia.mjs --apply\n');
}

main().catch(e => {
  console.error('❌ ', e.message);
  process.exit(1);
});
