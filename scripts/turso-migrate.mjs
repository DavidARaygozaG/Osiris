/**
 * turso-migrate.mjs
 * ─────────────────────────────────────────────────────────────────
 * Aplica el schema de Prisma directamente a Turso.
 * Corre una vez antes del primer deploy, y cada vez que cambies el schema.
 *
 * Uso:  bun run db:deploy
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from '@libsql/client';
import { execSync }     from 'child_process';
import { config }       from 'dotenv';
import { resolve }      from 'path';

config();

const url       = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌  TURSO_DATABASE_URL o TURSO_AUTH_TOKEN no están en .env');
  process.exit(1);
}

console.log(`\n🔌  Conectando a Turso: ${url}\n`);
const db = createClient({ url, authToken });

// Usar el CLI de Prisma directamente via Node.js (funciona en todas las plataformas)
const prismaCli = resolve('node_modules/prisma/build/index.js');
const nul = process.platform === 'win32' ? '2>nul' : '2>/dev/null';

console.log('📐  Generando SQL desde schema.prisma…');
let sql = '';
try {
  sql = execSync(
    `node "${prismaCli}" migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script ${nul}`,
    { encoding: 'utf8' }
  );
} catch (e) {
  console.error('❌  Error al generar SQL:', e.message?.split('\n')[0]);
  process.exit(1);
}

if (!sql?.trim()) {
  console.error('❌  prisma migrate diff no devolvió SQL. Verifica el schema.');
  process.exit(1);
}

// Dividir en statements y limpiar comentarios encabezados (-- CreateTable, etc.)
const statements = sql
  .split(';')
  .map(s => {
    // Quitar líneas que son solo comentarios al inicio del statement
    const lines = s.split('\n').filter(l => l.trim() && !l.trim().startsWith('--'));
    return lines.join('\n').trim();
  })
  .filter(s => s.length > 0);

console.log(`⚙️   Ejecutando ${statements.length} statements en Turso…\n`);

let ok = 0, skip = 0, errors = 0;

for (const stmt of statements) {
  const preview = stmt.slice(0, 70).replace(/\n/g, ' ');
  try {
    await db.execute(stmt);
    console.log(`  ✅  ${preview}…`);
    ok++;
  } catch (e) {
    if (e.message?.toLowerCase().includes('already exists') || e.message?.includes('duplicate')) {
      console.log(`  ⏭   ${preview}… (ya existe)`);
      skip++;
    } else {
      console.error(`  ❌  ${preview}…`);
      console.error(`      ${e.message}`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.log(`\n⚠️   Terminado con ${errors} errores, ${ok} ejecutados, ${skip} omitidos\n`);
  process.exit(1);
} else {
  console.log(`\n🎉  ¡Schema desplegado en Turso! ${ok} ejecutados, ${skip} omitidos\n`);
}
