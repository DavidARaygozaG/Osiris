-- CreateTable
CREATE TABLE "Producto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precio" REAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Corte" (
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
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CorteProducto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "corteId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "CorteProducto_corteId_fkey" FOREIGN KEY ("corteId") REFERENCES "Corte" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CorteProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tanda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "corteId" INTEGER NOT NULL,
    "harina" REAL NOT NULL,
    "masa" REAL NOT NULL,
    CONSTRAINT "Tanda_corteId_fkey" FOREIGN KEY ("corteId") REFERENCES "Corte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "CorteProveedor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "corteId" INTEGER NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "paso" BOOLEAN NOT NULL DEFAULT false,
    "dejo" REAL NOT NULL DEFAULT 0,
    "cobro" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "CorteProveedor_corteId_fkey" FOREIGN KEY ("corteId") REFERENCES "Corte" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CorteProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GastoExtra" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "corteId" INTEGER NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    CONSTRAINT "GastoExtra_corteId_fkey" FOREIGN KEY ("corteId") REFERENCES "Corte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Producto_nombre_key" ON "Producto"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Corte_fecha_key" ON "Corte"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_nombre_key" ON "Proveedor"("nombre");
