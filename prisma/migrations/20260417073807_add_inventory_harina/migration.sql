-- CreateTable
CREATE TABLE "HarinaInventario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stock" REAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IngresoHarina" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bultos" REAL NOT NULL,
    "fechaDia" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Corte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalBultos" INTEGER NOT NULL DEFAULT 0,
    "ventaTortilla" REAL NOT NULL DEFAULT 0,
    "ventaProductos" REAL NOT NULL DEFAULT 0,
    "totalGastos" REAL NOT NULL DEFAULT 0,
    "totalVentas" REAL NOT NULL DEFAULT 0,
    "deberiaHaber" REAL NOT NULL DEFAULT 0,
    "dineroEnCaja" REAL NOT NULL DEFAULT 0,
    "diferencia" REAL NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'cuadro',
    "fechaDia" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Corte" ("createdAt", "deberiaHaber", "diferencia", "dineroEnCaja", "estado", "fecha", "id", "notas", "totalBultos", "totalGastos", "totalVentas", "updatedAt", "ventaProductos", "ventaTortilla", "fechaDia")
SELECT "createdAt", "deberiaHaber", "diferencia", "dineroEnCaja", "estado", "fecha", "id", "notas", "totalBultos", "totalGastos", "totalVentas", "updatedAt", "ventaProductos", "ventaTortilla",
  CAST(strftime('%Y-%m-%d', "fecha") AS TEXT) || '-seed-' || CAST("id" AS TEXT)
FROM "Corte";
DROP TABLE "Corte";
ALTER TABLE "new_Corte" RENAME TO "Corte";
CREATE UNIQUE INDEX "Corte_fecha_key" ON "Corte"("fecha");
CREATE UNIQUE INDEX "Corte_fechaDia_key" ON "Corte"("fechaDia");
CREATE TABLE "new_Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "stock" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_Producto" ("activo", "id", "nombre", "precio") SELECT "activo", "id", "nombre", "precio" FROM "Producto";
DROP TABLE "Producto";
ALTER TABLE "new_Producto" RENAME TO "Producto";
CREATE UNIQUE INDEX "Producto_nombre_key" ON "Producto"("nombre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "IngresoHarina_fechaDia_key" ON "IngresoHarina"("fechaDia");
