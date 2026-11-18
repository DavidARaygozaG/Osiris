# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Empleados de la tortillería "Tortillería Única | Eduardo's". Usan la app en su teléfono al cierre del día (de pie, con prisa, a veces con las manos sucias de masa). Tienen conocimientos tecnológicos básicos: saben usar WhatsApp y poco más. Confirmado por el usuario: la usan solo empleados.
El dueño revisa historial y administración (PIN de admin) de forma ocasional; no es el usuario principal.

## Product Purpose

Hacer el corte de caja diario sin errores: capturar lo vendido, la harina usada, proveedores, gastos y merma, y el dinero en caja; la app calcula cuánto debería haber y si cuadra (coincidió / faltó). También lleva inventario de productos y harina, historial por calendario y meta mensual. Éxito = el empleado termina el corte en pocos minutos, sin dudas y sin cálculos a mano.

## Positioning

Un cierre diario hecho para el mostrador de una tortillería: habla en palabras del oficio (bultos, tandas, masa, merma), no en términos contables.

## Operating Context

- Móvil primero, PWA instalable con página offline.
- Un solo corte por día (regla de negocio, 409 `ya_existe`).
- Modo "Calcular" = simulación sin guardar; modo "Hacer cuenta" = guarda.
- Ingreso de harina diario por modal.
- Compartir el corte como imagen (html-to-image).

## Capabilities and Constraints

- Stack: Next 16.2 (App Router, JS sin TypeScript), React 19 + React Compiler, Tailwind 4, daisyUI 5, motion, zustand 5, Prisma 6 + libsql/Turso (SQLite local en dev), react-hook-form + zod.
- Cálculo vigente (se preserva): venta tortilla = (harina + masa de tandas) × 880; venta productos = Σ precio × cantidad; gastos = extras + merma kg × 22 + cobro de proveedores que pasaron; debería haber = ventas − gastos; diferencia = caja − debería haber.
- Rutas API existentes se conservan (corte, historial, productos, proveedores, harina, admin).
- Decisión del usuario: se puede rediseñar libremente el flujo del corte (reordenar/fusionar pasos) conservando todos los datos y el cálculo.
- Decisión del usuario: unificar en Tailwind 4 + daisyUI 5 + motion; se eliminan Mantine y los CSS Modules.
- Deuda detectada (no decidida): Prisma 6 con @prisma/adapter-libsql 7; `/calendario` duplica el calendario de `/historial`; admin con PIN + flag en localStorage.

## Brand Commitments

Nombre: "Tortillería Única | Eduardo's" (app: osiris-sell-controller). Interfaz en español de México. Dirección técnica del CLAUDE.md del usuario: glassmorphism / Liquid Glass y diseño en tendencia (el usuario lo pidió explícitamente; el aspecto actual lo considera obsoleto).

## Evidence on Hand

Sin testimonios, métricas ni clientes reales documentados; no inventar. Existe public/images/bg.jpg y el ícono dollarWithWings.

## Product Principles

1. Una sola cosa por pantalla: el empleado nunca debe preguntarse "¿qué sigue?".
2. Lenguaje del oficio, no contable; frases cortas y números grandes.
3. A prueba de errores: borrador autoguardado, confirmaciones claras antes de guardar, deshacer visible.
4. Uso a una mano en móvil; objetivos táctiles grandes.
5. El resultado del día (cuadró / faltó) se entiende de un vistazo.

## Accessibility & Inclusion

Usuarios con poca experiencia tecnológica, uso con prisa y en condiciones de luz variable: alto contraste, texto grande, no depender solo del color para "cuadró/faltó", respetar prefers-reduced-motion.
