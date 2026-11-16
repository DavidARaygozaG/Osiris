<div align="center">

# 🌿 Osiris Sell Controller

### Sistema de control de ventas para tortillería — moderno, glassmorphic, mobile-first

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io)
[![Turso](https://img.shields.io/badge/Turso-LibSQL-4FF8D2?style=for-the-badge)](https://turso.tech)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-v5-FF6B35?style=for-the-badge)](https://zustand-demo.pmnd.rs)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)

![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Mobile First](https://img.shields.io/badge/mobile-first-blueviolet?style=flat-square)
![Glassmorphism](https://img.shields.io/badge/design-glassmorphism-9ecaed?style=flat-square)

</div>

---

## 📖 Tabla de contenido

- [Visión general](#-visión-general)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Modelo de datos](#-modelo-de-datos-erd)
- [Flujo del corte diario](#-flujo-del-corte-diario)
- [API Reference](#-api-reference)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Tech Stack detallado](#-tech-stack-detallado)
- [State management (Zustand)](#-state-management-zustand)
- [Hooks personalizados](#-hooks-personalizados)
- [Guía de instalación](#-guía-de-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Deploy en Vercel + Turso](#-deploy-en-vercel--turso)
- [Comandos útiles](#-comandos-útiles)
- [Diseño — Design Tokens](#-diseño--design-tokens)
- [Roadmap](#-roadmap)

---

## 🎯 Visión general

**Osiris Sell Controller** es una PWA mobile-first para controlar el negocio diario de una tortillería. Registra ventas, producción, proveedores y gastos en un **corte diario** (turno), reconcilia el efectivo en caja y genera historial con análisis automático.

### ¿Qué resuelve?

| Problema real                          | Solución en Osiris                               |
| -------------------------------------- | ------------------------------------------------ |
| Contar a mano cuánto se vendió         | Formulario paso a paso con cálculo automático    |
| No saber si cuadra la caja             | Reconciliación automática: _debe haber_ vs _hay_ |
| Perder registro de proveedores del día | Módulo de proveedores por corte                  |
| Sin historial de producción            | Calendario con cortes pasados + analytics        |
| Inventario de harina desconocido       | Control de stock con ingreso diario              |

---

## 🏗 Arquitectura del sistema

```mermaid
graph TB
    subgraph Client["🖥 Cliente (Browser / PWA)"]
        UI["React 19 + Next.js App Router"]
        ZS["Zustand Store\n(useCorteStore · useAdminStore)"]
        Hooks["Custom Hooks\n(useHistorialStats · useScrollReveal · useMediaQuery)"]
        Motion["motion/react\n(animaciones · scroll · layout)"]
        UI --> ZS
        UI --> Hooks
        UI --> Motion
    end

    subgraph NextServer["⚙️ Next.js Server (Vercel Serverless)"]
        AppRouter["App Router\npage.js / layout.js"]
        APIRoutes["API Routes\n/api/**"]
        PrismaLib["lib/prisma.js\n(singleton + LibSQL adapter)"]
        AppRouter --> APIRoutes
        APIRoutes --> PrismaLib
    end

    subgraph DB["🗄 Base de datos"]
        TursoDB["Turso (LibSQL)\nSQLite distribuido en la nube"]
        LocalDB["dev.db\n(SQLite local · solo Prisma CLI)"]
    end

    Client -->|"fetch() / API calls"| NextServer
    PrismaLib -->|"libsql:// adapter"| TursoDB
    PrismaLib -.->|"file: (CLI only)"| LocalDB

    style Client fill:#1a1a2e,color:#e8e8f0,stroke:#6ee7b7
    style NextServer fill:#16213e,color:#e8e8f0,stroke:#818cf8
    style DB fill:#0f3460,color:#e8e8f0,stroke:#fbbf24
```

### Patrón de capas

```mermaid
graph LR
    A["🎨 UI Layer\nComponents + Modules\nCSS Modules + Tailwind"] --> B["🧠 State Layer\nZustand Stores\nCustom Hooks"]
    B --> C["🔌 API Layer\nNext.js Route Handlers\n/app/api/**"]
    C --> D["💾 Data Layer\nPrisma ORM\nLibSQL/Turso Adapter"]
    D --> E["☁️ Cloud DB\nTurso\nSQLite edge"]

    style A fill:#6ee7b7,color:#064e3b
    style B fill:#818cf8,color:#1e1b4b
    style C fill:#fbbf24,color:#451a03
    style D fill:#f87171,color:#7f1d1d
    style E fill:#60a5fa,color:#1e3a5f
```

---

## 📊 Modelo de datos (ERD)

```mermaid
erDiagram
    Corte {
        Int id PK
        DateTime fecha
        String fechaDia UK
        Int totalBultos
        Float ventaTortilla
        Float ventaProductos
        Float totalGastos
        Float totalVentas
        Float deberiaHaber
        Float dineroEnCaja
        Float diferencia
        String estado
        String notas
        DateTime createdAt
        DateTime updatedAt
    }

    Producto {
        Int id PK
        String nombre UK
        Float precio
        Boolean activo
        Float stock
    }

    CorteProducto {
        Int id PK
        Int corteId FK
        Int productoId FK
        Int cantidad
        Float subtotal
    }

    Tanda {
        Int id PK
        Int corteId FK
        Float harina
        Float masa
    }

    Proveedor {
        Int id PK
        String nombre UK
        Boolean activo
        Int productoId FK
        Int parentId
    }

    CorteProveedor {
        Int id PK
        Int corteId FK
        Int proveedorId FK
        Boolean paso
        Float dejo
        Float cobro
    }

    HarinaInventario {
        Int id PK
        Float stock
        DateTime updatedAt
    }

    IngresoHarina {
        Int id PK
        Float bultos
        String fechaDia UK
        DateTime fecha
    }

    Config {
        Int id PK
        String key UK
        String value
    }

    GastoExtra {
        Int id PK
        Int corteId FK
        String concepto
        Float monto
    }

    Corte ||--o{ CorteProducto : "tiene"
    Corte ||--o{ Tanda : "incluye"
    Corte ||--o{ CorteProveedor : "registra"
    Corte ||--o{ GastoExtra : "tiene"
    Producto ||--o{ CorteProducto : "aparece en"
    Proveedor ||--o{ CorteProveedor : "participa en"
    Producto ||--o{ Proveedor : "es surtido por"
```

---

## 🔄 Flujo del corte diario

```mermaid
flowchart TD
    Start(["▶ Iniciar Corte"]) --> P1

    subgraph Wizard["📋 Wizard de 6 pasos (Zustand)"]
        P1["Paso 1\n📦 Productos\nCantidades vendidas"]
        P2["Paso 2\n🚚 Proveedores\npasó · dejó · cobró"]
        P3["Paso 3\n🌽 Tandas\nharina (bultos) · masa"]
        P4["Paso 4\n💸 Gastos\ngastos extra · merma"]
        P5["Paso 5\n💵 Caja\ndinero físico contado"]
        P6["Paso 6\n✅ Resumen\nreconciliación final"]
    end

    P1 --> P2 --> P3 --> P4 --> P5 --> P6

    P6 --> Calc["calcularTotales()\n────────────────\nventaTortilla = bultos × precioTortilla\nventaProductos = Σ cantidad × precio\ntotalVentas = ventaTortilla + ventaProductos\ntotalGastos = Σ gastos + merma\ndeberiaHaber = totalVentas − totalGastos\ndiferencia = dineroEnCaja − deberiaHaber"]

    Calc --> Save["POST /api/corte\n(transacción atómica)"]

    Save --> DB["💾 Turso DB\nCorte + CorteProducto[]\n+ Tanda[] + CorteProveedor[]\n+ GastoExtra[]"]

    DB --> Estado{{"estado\n(resultado)?"}}
    Estado -->|"diferencia = 0"| Cuadro["🟢 cuadro"]
    Estado -->|"diferencia > 0"| Sobro["🔵 sobró"]
    Estado -->|"diferencia < 0"| Falto["🔴 faltó"]

    style Start fill:#6ee7b7,color:#064e3b
    style Calc fill:#fbbf24,color:#451a03
    style Save fill:#818cf8,color:#1e1b4b
    style DB fill:#60a5fa,color:#1e3a5f
    style Cuadro fill:#34d399,color:#064e3b
    style Sobro fill:#60a5fa,color:#1e3a5f
    style Falto fill:#f87171,color:#7f1d1d
```

---

## 🌐 API Reference

### Mapa de endpoints

```mermaid
graph LR
    subgraph Public["🌍 Endpoints públicos"]
        C1["POST /api/corte\nCrear corte diario"]
        H1["GET /api/historial\nListar todos los cortes"]
        P1["GET /api/productos\nListar productos activos"]
        P2["GET /api/proveedores\nListar proveedores activos"]
        HA1["GET /api/harina/stock\nStock actual de harina"]
        HA2["POST /api/harina/ingreso\nRegistrar ingreso de harina"]
    end

    subgraph Admin["🔒 Endpoints admin"]
        A1["POST /api/admin/auth\nVerificar PIN"]
        A2["GET|PUT /api/admin/config\nLeer/escribir config"]
        A3["DELETE /api/admin/corte/:id\nEliminar corte"]
        A4["GET /api/admin/stats\nEstadísticas del mes"]
    end

    style Public fill:#1a2e1a,color:#6ee7b7,stroke:#6ee7b7
    style Admin fill:#2e1a1a,color:#f87171,stroke:#f87171
```

### Tabla completa

| Método   | Ruta                    | Body / Query                                                                    | Descripción                            |
| -------- | ----------------------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| `POST`   | `/api/corte`            | `{ productos, tandas, proveedores, gastosExtra, mermaKg, dineroEnCaja, notas }` | Crea corte completo en una transacción |
| `GET`    | `/api/historial`        | —                                                                               | Historial con relaciones completas     |
| `GET`    | `/api/productos`        | `?all=true` para incluir inactivos                                              | Lista de productos                     |
| `POST`   | `/api/productos`        | `{ nombre, precio }`                                                            | Crear producto                         |
| `PUT`    | `/api/productos/[id]`   | `{ nombre?, precio?, activo?, stock? }`                                         | Actualizar producto                    |
| `DELETE` | `/api/productos/[id]`   | —                                                                               | Eliminar producto                      |
| `GET`    | `/api/proveedores`      | —                                                                               | Lista con jerarquía parent-child       |
| `POST`   | `/api/proveedores`      | `{ nombre, productoId?, parentId? }`                                            | Crear proveedor                        |
| `PUT`    | `/api/proveedores/[id]` | `{ nombre?, activo?, productoId?, parentId? }`                                  | Actualizar proveedor                   |
| `DELETE` | `/api/proveedores/[id]` | —                                                                               | Eliminar proveedor                     |
| `GET`    | `/api/harina/stock`     | —                                                                               | Stock actual en bultos                 |
| `PUT`    | `/api/harina/stock`     | `{ stock }`                                                                     | Actualizar stock                       |
| `GET`    | `/api/harina/ingreso`   | —                                                                               | Ingreso del día actual                 |
| `POST`   | `/api/harina/ingreso`   | `{ bultos }`                                                                    | Registrar ingreso diario               |
| `POST`   | `/api/admin/auth`       | `{ pin }`                                                                       | Verificar PIN de admin                 |
| `GET`    | `/api/admin/config`     | `?key=KEY`                                                                      | Leer configuración                     |
| `PUT`    | `/api/admin/config`     | `{ key, value }`                                                                | Escribir configuración                 |
| `DELETE` | `/api/admin/corte/[id]` | —                                                                               | Eliminar corte y revertir inventario   |
| `GET`    | `/api/admin/stats`      | —                                                                               | Estadísticas del mes                   |

---

## 📁 Estructura del proyecto

```
osiris-sell-controller/
│
├── 📂 src/
│   ├── 📂 app/                         # Next.js App Router
│   │   ├── 📂 api/                     # Route Handlers (serverless)
│   │   │   ├── admin/
│   │   │   │   ├── auth/route.js       # POST — verificar PIN admin
│   │   │   │   ├── config/route.js     # GET|PUT — configuración global
│   │   │   │   ├── corte/[id]/route.js # DELETE — eliminar corte
│   │   │   │   └── stats/route.js      # GET — estadísticas del mes
│   │   │   ├── corte/route.js          # POST — crear corte diario
│   │   │   ├── harina/
│   │   │   │   ├── ingreso/route.js    # GET|POST — ingreso diario de harina
│   │   │   │   └── stock/route.js      # GET|PUT — stock actual
│   │   │   ├── historial/route.js      # GET — historial completo
│   │   │   ├── productos/
│   │   │   │   ├── route.js            # GET|POST
│   │   │   │   └── [id]/route.js       # PUT|DELETE
│   │   │   └── proveedores/
│   │   │       ├── route.js            # GET|POST
│   │   │       └── [id]/route.js       # PUT|DELETE
│   │   │
│   │   ├── admin/page.jsx              # 🔒 Panel de administración
│   │   ├── corte/page.js               # 📋 Wizard del corte (6 pasos)
│   │   ├── historial/page.jsx          # 📊 Historial + analytics
│   │   ├── inventario/page.jsx         # 📦 Inventario de productos y harina
│   │   ├── calendario/page.jsx         # 📅 Vista calendario de cortes
│   │   ├── page.js                     # 🏠 Home / landing
│   │   ├── layout.js                   # Root layout (fuentes, providers)
│   │   └── globals.css                 # Design tokens + utilidades globales
│   │
│   ├── 📂 components/                  # Componentes reutilizables
│   │   ├── HomeActions.js              # Botones de acción principal en home
│   │   ├── cards/
│   │   │   ├── ActionCard/             # Card clicable con icono y flecha
│   │   │   ├── GlassCard/              # Wrapper glassmorphism base
│   │   │   └── Section/                # Sección animada con scroll reveal
│   │   ├── modals/
│   │   │   └── HarinaModal/            # Modal para ingreso de harina
│   │   └── navigation/
│   │       ├── BottomNav/              # Barra de navegación inferior
│   │       ├── NavButton/              # Controles Anterior/Siguiente
│   │       └── Stepper/                # Indicador visual de pasos
│   │
│   ├── 📂 hooks/                       # Hooks personalizados
│   │   ├── useHistorialStats.js        # Agregados del historial (racha, sparkline…)
│   │   ├── useMediaQuery.js            # Re-export de @mantine/hooks
│   │   └── useScrollReveal.js          # Fade-up con useInView (motion)
│   │
│   ├── 📂 lib/
│   │   ├── prisma.js                   # Singleton Prisma + LibSQL adapter
│   │   └── utils.js                    # Helpers (cn, formatCurrency…)
│   │
│   ├── 📂 modules/                     # Feature modules (UI + lógica)
│   │   ├── corte/                      # Wizard del corte
│   │   │   ├── index.js                # Orquestador de pasos
│   │   │   ├── Productos.js            # Paso 1 — ventas por producto
│   │   │   ├── Proveedores.js          # Paso 2 — proveedores del día
│   │   │   ├── Tandas.js               # Paso 3 — producción de masa
│   │   │   ├── Gastos.js               # Paso 4 — gastos extra + merma
│   │   │   ├── Caja.js                 # Paso 5 — efectivo en caja
│   │   │   ├── Summary.js              # Paso 6 — reconciliación final
│   │   │   └── styles/                 # CSS Modules por módulo
│   │   └── historial/                  # Historial & analytics
│   │       ├── Calendario.jsx          # Calendario mensual con layoutId
│   │       ├── DetalleCorte.jsx        # Panel de detalle completo
│   │       ├── InsightsCard.jsx        # Insights automáticos + sparkline
│   │       ├── MetaMensual.jsx         # Meta mensual con anillo SVG
│   │       └── ShareCorte.jsx          # Exportar/compartir como PNG
│   │
│   └── 📂 stores/                      # Zustand stores
│       ├── useCorteStore.js            # Estado del wizard del corte
│       └── useAdminStore.js            # Autenticación de admin
│
├── 📂 prisma/
│   ├── schema.prisma                   # Esquema de la base de datos
│   ├── seed.js                         # Datos iniciales
│   └── dev.db                          # SQLite local (solo desarrollo)
│
├── 📂 scripts/
│   └── turso-migrate.mjs               # Deploy del schema a Turso
│
├── 📂 public/
│   ├── images/                         # Imágenes (bg.jpg, etc.)
│   ├── svg/
│   ├── fonts/
│   └── lotties/                        # Animaciones Lottie
│
├── .env                                # Variables de entorno (no commitear)
├── .env.example                        # Plantilla de variables
├── package.json
└── README.md
```

---

## 🛠 Tech Stack detallado

```mermaid
mindmap
  root((Osiris))
    Frontend
      Next.js 16 App Router
      React 19
      CSS Modules
      Tailwind CSS v4
      DaisyUI v5
    Animaciones
      motion/react
        useInView
        useScroll
        useSpring
        AnimatePresence
        layoutId
    State
      Zustand v5
        useCorteStore
        useAdminStore
    Formularios
      React Hook Form v7
      Zod v4
    Base de datos
      Prisma 6
      LibSQL Turso Adapter
      Turso Cloud
      SQLite local
    UI Extras
      react-icons
      sonner toasts
      html-to-image
      clsx + tailwind-merge
    Dev Tools
      ESLint
      Bun
      Vercel CLI
```

### Por qué este stack

| Tecnología         | Por qué                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| **Next.js 16**     | SSR + API Routes en un solo proyecto, deploy sin config en Vercel        |
| **Turso + LibSQL** | SQLite serverless con 500 DBs gratis, latencia edge, sin servidor propio |
| **Prisma 6**       | Type-safe ORM, migraciones, Prisma Studio para inspeccionar datos        |
| **Zustand**        | Estado global mínimo sin boilerplate; persiste entre pasos del wizard    |
| **motion/react**   | Animaciones declarativas con layout animations y scroll-driven effects   |
| **CSS Modules**    | Scoping por componente + tokens globales en `globals.css`                |
| **DaisyUI v5**     | Componentes listos para glassmorphism sobre Tailwind                     |

---

## 🧠 State management (Zustand)

### useCorteStore — el corazón del wizard

```mermaid
stateDiagram-v2
    [*] --> Paso1 : iniciar corte

    Paso1 : Paso 1 - Productos
    Paso2 : Paso 2 - Proveedores
    Paso3 : Paso 3 - Tandas
    Paso4 : Paso 4 - Gastos
    Paso5 : Paso 5 - Caja
    Paso6 : Paso 6 - Resumen

    Paso1 --> Paso2 : nextPaso()
    Paso2 --> Paso3 : nextPaso()
    Paso3 --> Paso4 : nextPaso()
    Paso4 --> Paso5 : nextPaso()
    Paso5 --> Paso6 : nextPaso()
    Paso6 --> [*] : reset() tras guardar

    Paso2 --> Paso1 : prevPaso()
    Paso3 --> Paso2 : prevPaso()
    Paso4 --> Paso3 : prevPaso()
    Paso5 --> Paso4 : prevPaso()
    Paso6 --> Paso5 : prevPaso()
```

### Fórmula de reconciliación

```js
// calcularTotales() en useCorteStore.js
const ventaTortilla  = totalBultos  * precioTortilla     // bultos × precio config
const ventaProductos = Σ (cantidad[id] * precio[id])     // todos los productos
const totalVentas    = ventaTortilla + ventaProductos
const totalGastos    = Σ gastos.monto + (mermaKg * 22)   // $22/kg merma
const deberiaHaber   = totalVentas   - totalGastos
const diferencia     = dineroEnCaja  - deberiaHaber
const estado         = diferencia === 0 ? 'cuadro'
                     : diferencia >   0 ? 'sobro'
                     :                    'falto'
```

---

## 🪝 Hooks personalizados

### `useHistorialStats(cortes[])`

```js
// Retorna:
{
  totalMes,          // Float — ventas totales del mes actual
  promedioVentas,    // Float — promedio por día
  coincidencia,      // Number 0-100 — % de días que cuadró la caja
  rachaActual,       // Number — días consecutivos cuadrando
  mejorDia,          // String — "lunes", "martes"… (más ventas en promedio)
  productoEstrella,  // String — producto con más unidades vendidas
  sparkline,         // Float[] — ventas por día del mes (para SVG)
  insights,          // String[] — frases automáticas con reglas simples
}
```

### `useScrollReveal({ amount, once, margin })`

```js
import { useScrollReveal, fadeUp } from '@/hooks/useScrollReveal'

const { ref, inView } = useScrollReveal({ amount: 0.2 })

// Usar con motion:
<motion.div
  ref={ref}
  variants={fadeUp}
  initial="hidden"
  animate={inView ? 'show' : 'hidden'}
>
```

### `useMediaQuery(query)`

```js
import { useMediaQuery } from '@/hooks/useMediaQuery';

const isDesktop = useMediaQuery('(min-width: 768px)');
// → true en desktop, false en mobile
```

---

## 🚀 Guía de instalación

### Prerrequisitos

```
Node.js >= 18
Bun >= 1.0      (recomendado, o npm/pnpm)
Git
```

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-usuario/osiris-sell-controller.git
cd osiris-sell-controller
bun install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus valores (ver sección Variables de entorno)
```

### 3. Preparar base de datos local

```bash
# Generar cliente Prisma
bunx prisma generate

# Crear SQLite local y aplicar schema
bunx prisma db push

# (Opcional) Cargar datos de ejemplo
bun run db:seed
```

### 4. Iniciar en desarrollo

```bash
bun run dev
# → http://localhost:3000
```

> 💡 **Tip:** Abre `bunx prisma studio` en otra terminal para ver y editar datos visualmente en `localhost:5555`.

---

## 🔐 Variables de entorno

```bash
# ── Prisma CLI (solo local: db:push, studio, migrate) ──────────────────────
DATABASE_URL="file:./prisma/dev.db"

# ── Turso — runtime en producción (y en db:deploy) ─────────────────────────
TURSO_DATABASE_URL="libsql://tu-db.aws-us-east-1.turso.io"
TURSO_AUTH_TOKEN="eyJhbGci..."
```

| Variable             | Requerida | Descripción                         |
| -------------------- | --------- | ----------------------------------- |
| `DATABASE_URL`       | ✅ Dev    | URL SQLite local para CLI de Prisma |
| `TURSO_DATABASE_URL` | ✅ Prod   | URL de la base de datos Turso       |
| `TURSO_AUTH_TOKEN`   | ✅ Prod   | Token JWT de autenticación Turso    |

> ⚠️ **Nunca** subas `.env` a Git. Usa `.env.example` como plantilla.

---

## ☁️ Deploy en Vercel + Turso

### Diagrama de deployment

```mermaid
sequenceDiagram
    participant Dev as 💻 Desarrollador
    participant Git as 📦 GitHub
    participant Vercel as ▲ Vercel
    participant Turso as 🗄 Turso

    Dev->>Turso: turso db create osiris
    Turso-->>Dev: libsql://osiris.turso.io + auth token

    Dev->>Dev: bun run db:deploy
    Note over Dev,Turso: Aplica schema.prisma a Turso via scripts/turso-migrate.mjs

    Dev->>Vercel: vercel env add TURSO_DATABASE_URL
    Dev->>Vercel: vercel env add TURSO_AUTH_TOKEN

    Dev->>Git: git push origin main
    Git->>Vercel: webhook → trigger build

    Vercel->>Vercel: bun install + prisma generate
    Vercel->>Vercel: next build
    Vercel-->>Dev: Deploy URL lista

    Note over Vercel,Turso: En runtime lib/prisma.js conecta via LibSQL adapter
```

### Pasos de deployment

```bash
# 1. Crear DB en Turso (si no existe)
turso db create osiris
turso db tokens create osiris

# 2. Copiar credenciales a .env

# 3. Desplegar schema a Turso
bun run db:deploy

# 4. Agregar env vars a Vercel
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production

# 5. Deploy
vercel --prod
```

### Estrategia dual de base de datos

```mermaid
graph LR
    subgraph Local["💻 Desarrollo local"]
        CLI["Prisma CLI\ndb:push, studio, migrate"] --> LocalDB["file:./prisma/dev.db\nSQLite local"]
    end

    subgraph Runtime["⚙️ Runtime (dev + prod)"]
        App["Next.js API Routes\nlib/prisma.js"] --> Adapter["LibSQL Adapter\n@prisma/adapter-libsql"] --> TursoDB["Turso Cloud\nlibsql://...turso.io"]
    end

    style Local fill:#1a2e1a,color:#6ee7b7,stroke:#6ee7b7
    style Runtime fill:#1a1a2e,color:#818cf8,stroke:#818cf8
```

> **Clave:** `DATABASE_URL=file:./dev.db` para que el CLI de Prisma funcione en local. `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` para el runtime via `lib/prisma.js`.

---

## ⚡ Comandos útiles

```bash
# ── Desarrollo ──────────────────────────────────────────
bun run dev              # Iniciar servidor dev → localhost:3000
bun run build            # Build de producción
bun run lint             # Linter (ESLint)

# ── Base de datos ────────────────────────────────────────
bun run db:push          # Push schema → SQLite local (sin migraciones)
bun run db:migrate       # Crear y aplicar migración (dev)
bun run db:deploy        # Desplegar schema a Turso en la nube
bun run db:seed          # Poblar DB con datos de ejemplo
bun run db:studio        # Abrir Prisma Studio en localhost:5555

# ── Prisma ───────────────────────────────────────────────
bunx prisma generate     # Re-generar cliente Prisma
bunx prisma format       # Formatear schema.prisma
bunx prisma validate     # Validar schema
```

---

## 🎨 Diseño — Design Tokens

### Paleta de colores

| Token               | Valor               | Uso                              |
| ------------------- | ------------------- | -------------------------------- |
| `--color-primary`   | `#6ee7b7` esmeralda | Acciones principales, checkmarks |
| `--color-secondary` | `#818cf8` índigo    | Acentos, badges secundarios      |
| `--color-accent`    | `#fbbf24` ámbar     | Advertencias, highlights         |
| `--color-base-100`  | `#0d0d0f`           | Fondo principal                  |
| `--color-success`   | `#34d399`           | Estado "cuadro"                  |
| `--color-error`     | `#f87171`           | Estado "faltó"                   |
| `--color-info`      | `#60a5fa`           | Estado "sobró"                   |

### Glassmorphism — receta base

```css
/* Aplicar a cualquier card */
background: var(--glass-bg); /* rgba(255,255,255,0.04) */
border: 1px solid var(--glass-border); /* rgba(255,255,255,0.08) */
backdrop-filter: var(--glass-blur); /* blur(8px) */

box-shadow: var(--glass-shadow); /* 0 8px 32px rgba(0,0,0,0.4) */
border-radius: 16px;

/* O simplemente: */
.glass {
  /* clase utilitaria en globals.css */
}
```

---

## 🗺 Roadmap

```mermaid
gantt
    title Osiris Sell Controller — Roadmap
    dateFormat  YYYY-MM-DD
    section MVP completado
    Wizard corte 6 pasos        :done, 2025-01-01, 2025-02-28
    Historial + calendario      :done, 2025-03-01, 2025-03-31
    Admin panel                 :done, 2025-04-01, 2025-05-31
    Deploy Vercel + Turso       :done, 2026-01-01, 2026-04-01

    section En curso
    Rediseño historial pro      :active, 2026-04-01, 2026-04-30
    Insights automaticos        :active, 2026-04-01, 2026-04-30
    Meta mensual con anillo     :active, 2026-04-15, 2026-04-30
    Exportar PNG corte          :active, 2026-04-15, 2026-04-30

    section Fase 3
    Integracion IA prediccion   :2026-05-01, 2026-06-30
    Notificaciones push         :2026-06-01, 2026-07-31
    PWA offline-first           :2026-07-01, 2026-08-31
    Multi-sucursal              :2026-09-01, 2026-11-30
```

### Features planificadas

- [ ] 🤖 **IA de predicción** — Sugerir cuánta harina pedir según histórico de producción
- [ ] 📲 **PWA offline-first** — Funcionar sin internet y sincronizar al reconectar
- [ ] 🔔 **Push notifications** — Recordatorio diario del corte
- [ ] 📊 **Dashboard ejecutivo** — Gráficas de tendencias semana/mes
- [ ] 🏪 **Multi-sucursal** — Soporte para múltiples puntos de venta
- [ ] 📱 **App nativa** — Wrapper Capacitor para iOS/Android

---

## 🤝 Contribuir

```bash
# 1. Fork del repositorio
# 2. Crear rama de feature
git checkout -b feature/mi-feature

# 3. Commits convencionales
git commit -m "feat: agregar gráfica de tendencias semanal"
git commit -m "fix: reconciliación con gastos negativos"
git commit -m "style: mejorar responsive del corte wizard"

# 4. Push y Pull Request
git push origin feature/mi-feature
```

### Convenciones de código

- **Componentes**: PascalCase + `.module.css` sibling
- **Hooks**: camelCase con prefijo `use`
- **API routes**: `export async function GET/POST/PUT/DELETE(req)`
- **CSS**: tokens en `globals.css`, estilos locales en `.module.css`
- **Commits**: [Conventional Commits](https://conventionalcommits.org/)

---

<div align="center">

**Osiris Sell Controller** — Hecho con 💚 y glassmorphism

_Next.js · Turso · Prisma · motion/react · Zustand · Tailwind_

</div>
