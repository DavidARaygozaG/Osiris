---
name: Osiris · Cuenta del día
description: Cristal líquido sobre una aurora de verde, maíz y café, en claro y en oscuro, con cifras enormes y una pregunta por pantalla, para cerrar la cuenta de la tortillería de pie y con prisa.
colors:
  ground: "#f6eedb"
  masa-clara: "#fffaf0"
  masa-dorada: "#eadcbc"
  ink: "#3a2616"
  ink-soft: "#6b5440"
  cafe: "#7a4e2d"
  cafe-deep: "#4a2f1b"
  nopal: "#2a8452"
  nopal-deep: "#1b6340"
  nopal-light: "#7bd29c"
  nopal-text: "#16703c"
  maiz: "#f2b518"
  maiz-deep: "#7d5200"
  chile: "#c8321a"
  info: "#2f7fb8"
  warning: "#b8860b"
  grafito: "#272b29"
  grafito-claro: "#323634"
  grafito-alto: "#3b403d"
  crema-oscuro: "#f4ecdc"
  nopal-oscuro: "#4cc287"
  cafe-oscuro: "#c99a6e"
  maiz-oscuro: "#f5c443"
  chile-oscuro: "#ff8a73"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-rounded, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bricolage Grotesque, ui-rounded, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Bricolage Grotesque, ui-rounded, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tabular-nums lining-nums"
  title:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.45
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.45
  button:
    fontFamily: "Bricolage Grotesque, ui-rounded, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
rounded:
  field: "14px"
  card: "16px"
  gota: "19.2px"
  dock: "25.6px"
  sheet: "28px"
  status: "12px"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  safe-bottom: "128px"
components:
  button-liquid:
    backgroundColor: "{colors.nopal}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.card}"
    height: "56px"
  button-cafe:
    backgroundColor: "{colors.cafe}"
    textColor: "#fff3e0"
    typography: "{typography.button}"
    rounded: "{rounded.card}"
    height: "56px"
  button-maiz:
    backgroundColor: "{colors.maiz}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  button-glass:
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    height: "64px"
  glass-card:
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  money-field:
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px 20px"
    height: "80px"
  glass-sheet:
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "24px"
  dock:
    rounded: "{rounded.dock}"
    padding: "6px"
  dock-item-active:
    backgroundColor: "{colors.nopal}"
    textColor: "#ffffff"
    rounded: "{rounded.gota}"
    height: "64px"
  dock-item:
    textColor: "{colors.ink-soft}"
    height: "64px"
  status-ok:
    textColor: "{colors.nopal-text}"
    rounded: "{rounded.status}"
  status-bad:
    textColor: "{colors.chile}"
    rounded: "{rounded.status}"
  status-warn:
    textColor: "{colors.maiz-deep}"
    rounded: "{rounded.status}"
  numpad-key:
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    height: "64px"
  stepper-button:
    textColor: "{colors.ink-soft}"
    size: "56px"
---

# Design System: Osiris · Cuenta del día

## Overview

**Creative North Star: "Maíz Líquido"**

Una app de mostrador usada de pie, al cierre, con prisa y en teléfono. El sistema es cristal líquido sobre una aurora: cuatro manchas de luz (verde, maíz, café y menta) derivan despacio detrás de hojas de cristal translúcido, y encima van cifras muy grandes. Existe en dos temas que comparten la misma estructura: claro (masa cremosa) y oscuro (grafito verdoso y café, nunca negro puro). Cada pantalla plantea una sola pregunta y deja claro qué sigue.

La paleta tiene roles fijos: el verde es la acción y el "cuadró", el café es la estructura (texto, botones secundarios, scroll) y el amarillo es solo un destello (selección, avisos, el "+" opcional, la ola trasera del orbe). El amarillo nunca domina una pantalla. El cristal, la aurora y el orbe líquido son la identidad aprobada por el usuario; los iconos y emojis van sueltos, sin cuadro ni círculo contenedor (decisión del usuario).

La densidad es baja y táctil: objetivos de 56 px o más, texto base de 17 px, una acción verde principal por pantalla. El estado del cuadre se lee con tres tonos (nopal cuadró, chile faltó, maíz oscuro sobró) siempre con icono y palabra. Toda interacción responde con microanimaciones que se apagan con "menos movimiento".

El tema se registra en daisyUI como `maiz` (claro, por defecto) y `maiz-oscuro` (por preferencia del teléfono), y los colores viven en variables `--c-*` que solo cambian con el tema, así ningún componente necesita estilos oscuros aparte.

**Key Characteristics:**
- Dos temas (claro y oscuro) con las mismas variables semánticas `--c-*`; script en el `<head>` que elige tema antes de pintar.
- Aurora de 4 manchas como fondo; el cristal la refracta.
- Cristal líquido: blur con saturación, relleno blanco translúcido, rim iridiscente de 1 px y brillo especular que sigue al dedo.
- Refracción SVG real solo en Chromium (clase `lq`); Safari y Firefox usan el blur normal.
- Orbe líquido (LiquidGauge) para la meta del mes.
- Cifras enormes, tabulares, que ruedan al cambiar.
- Iconos Phosphor (react-icons/pi) y emojis de producto, sueltos con sombra suave.
- Hojas inferiores como gesto de firma para capturas y confirmaciones.

## Colors

Paleta de cocina en tres familias con roles: verde nopal (acción), café de nixtamal (estructura) y maíz (destello), sobre masa clara o grafito verdoso.

### Primary
- **Nopal** (`nopal`): acción principal (`btn-liquid`, la gota activa del dock, "+" del stepper, anillo de foco, progreso). `nopal-deep` cierra el degradado y `nopal-light` lo abre y llena el orbe. `nopal-text` es el verde de texto para "Cuadró" con contraste suficiente.

### Secondary
- **Café de Nixtamal** (`ink`): texto principal; es café, nunca negro. `ink-soft` es el texto secundario y los iconos inactivos.
- **Café Estructura** (`cafe`): botones secundarios de peso (`btn-cafe`), iconos de estado vacío, scrollbar. `cafe-deep` cierra su degradado.

### Tertiary
- **Maíz** (`maiz`): solo destello: selección de texto, `btn-maiz`, ola trasera del orbe, gotas de la ráfaga, mancha de la aurora. `maiz-deep` es el tono de "sobró" y avisos (en oscuro se aclara a `maiz-oscuro`).
- **Chile** (`chile`): "faltó", errores y cursor de captura.

### Neutral
- **Masa** (`ground`): fondo de `<html>` y color de tema del navegador; `masa-clara` y `masa-dorada` son base-100 y base-300 de daisyUI.
- **Grafito verdoso** (`grafito`): fondo del modo oscuro; `grafito-claro` y `grafito-alto` son base-100 y base-300. Texto en `crema-oscuro`.
- **Variantes oscuras:** `nopal-oscuro`, `cafe-oscuro`, `maiz-oscuro` y `chile-oscuro` reemplazan a sus pares claros en `maiz-oscuro`; el cristal baja a blanco 14 a 6% de opacidad y la sombra se tiñe de verde oscuro.
- `info` y `warning` solo existen como tonos del tema daisyUI.

### Named Rules
**The Role Rule.** Verde es acción y éxito, café es estructura, amarillo es destello. El amarillo nunca es el color dominante ni el botón principal.
**The Never-Black Rule.** Ni el texto ni el fondo son negro puro: el claro usa café, el oscuro usa grafito verdoso con café. Los scrims son café oscuro (42%) o grafito (55%).
**The Icon-Plus-Word Rule.** Cuadró, faltó y sobró jamás se expresan solo con color: siempre icono y palabra.
**The One Green Rule.** Una sola acción en verde por pantalla u hoja; lo demás es cristal o café.

## Typography

**Display Font:** Bricolage Grotesque (con ui-rounded, system-ui)
**Body Font:** Hanken Grotesk (con system-ui)

**Character:** Bricolage aporta carácter cálido en títulos, botones y cifras; Hanken es sobria y muy legible en pantallas pequeñas.

### Hierarchy
- **Display** (800, 2rem, 1.05): título de página (h1).
- **Headline** (800, 1.5rem, 1.25): título de hoja inferior (h2).
- **Figure** (800, 1.875rem a 3.75rem, 1): dinero y cantidades, tabulares; la mayor es el teclado numérico (3.75rem).
- **Body** (400, 17px, 1.45): texto corrido; etiquetas de campo en 600.
- **Label** (600 a 700, 0.875rem): pistas, rótulos del dock y estados.
- **Button** (700, 1.125rem, -0.01em): botones grandes (`btn-big`).

### Named Rules
**The Tabular Figures Rule.** Toda cifra usa `.num` (display, tabular-nums, lining-nums); las que cambian usan AnimatedNumber para rodar sin saltar.
**The Balanced Headings Rule.** h1 a h3 con `text-wrap: balance`, párrafos con `pretty`, espaciado de letras -0.02em.

## Layout

Móvil primero, una columna centrada con máximo `max-w-xl` y margen lateral de 16 px. Cada vista usa la plantilla Page; el contenido deja 128 px abajo para el dock. La altura usa `100dvh` y los espacios seguros de iPhone (`pb-safe`, `pt-safe`, mínimo 16 px). Hay un enlace "Saltar al contenido".

El ritmo es de huecos de 6, 10, 16 y 24 px. Los controles táctiles miden 48 px o más (cierre 48, stepper 56, botón grande 56, tecla 64, campo de dinero 80, ítem del dock 64). El dock flotante mide como máximo `max-w-sm` y solo tiene 3 destinos. Las listas largas usan `glass-row` (cristal sin blur) por rendimiento. Las vistas entran con Stagger: aparecen escalonadas con blur.

## Elevation & Depth

Profundidad híbrida: cristal translúcido con blur más sombras tintadas con el color de sombra del tema (`--shadow-rgb`: café cálido `96 60 20` en claro, verde oscuro `6 10 8` en oscuro; nunca grises neutros). El contorno lo da un rim de 1 px con degradado (luz blanca arriba a la izquierda, verde líquido abajo a la derecha) y un filo interior claro.

### Shadow Vocabulary
- **Cristal** (`inset 0 1px 0 var(--edge), 0 14px 34px -16px rgb(var(--shadow-rgb) / .42), 0 2px 8px -3px rgb(var(--shadow-rgb) / .16)`): tarjetas, filas y campos.
- **Hoja** (`inset 0 1px 0 var(--edge), 0 -24px 60px -20px rgb(var(--shadow-rgb) / .5)`): hoja inferior, proyecta hacia arriba.
- **Dock** (`inset 0 1px 0 var(--edge), 0 22px 44px -16px rgb(var(--shadow-rgb) / .55), 0 2px 8px -3px rgb(var(--shadow-rgb) / .2)`): barra flotante.
- **Botón verde** (`inset 0 1px 0 rgb(255 255 255 / .55), inset 0 -10px 18px -8px rgb(0 0 0 / .25), 0 16px 28px -14px rgb(var(--nopal-rgb) / .9)`): relieve líquido; el botón café y el maíz siguen la misma receta con su color.
- **Icono suelto** (`drop-shadow(0 3px 4px rgb(var(--shadow-rgb) / .32))`): sombra de iconos y emojis en `.perla`.

Blur por superficie: tarjeta y dock 22 px con saturación 1.8; hoja 30 px con 1.9. En Chromium (`.lq`) dock, hoja y `glass-liquid` usan `url(#liquid)` (turbulencia fractal con desplazamiento 26) más blur de 14 px. Brillo especular: radial que sigue al dedo (`--sx`, `--sy`) y un barrido lento de 9 s. Variante `glass-strong` (relleno 84 a 62%) para texto largo. Sin soporte de blur, el relleno pasa al color de fondo.

### Named Rules
**The Tinted Shadow Rule.** Toda sombra se tiñe con `--shadow-rgb` del tema o con el color de la acción; no hay sombras duras ni grises neutras.
**The Glass-Needs-Light Rule.** El cristal solo funciona sobre la aurora; no se apila cristal sobre cristal sin necesidad y solo una superficie `glass-liquid` por pantalla.

## Shapes

Formas redondeadas y suaves: 14 px en campos, 16 px en tarjetas, botones grandes y teclas, 19.2 px en la gota del dock, 25.6 px en el dock, 28 px en la parte superior de las hojas, 12 px en insignias de estado. La gota activa del dock y las olas del orbe son las formas líquidas de firma. Foco: anillo de 3 px en nopal con separación de 3 px.

**The Loose Icon Rule.** Iconos y emojis (ProductoIcon, Phosphor) van sueltos sobre el cristal con sombra suave, sin cuadro, círculo ni fondo contenedor. `.perla` solo los alinea. Los botones de solo icono (`btn-circle`) no llevan fondo ni cristal; solo el icono con área táctil de 48 a 56 px y un velo claro al pasar el cursor. Las excepciones son las que el usuario aprobó: la gota verde del dock y el orbe del medidor.

## Components

### Buttons
- **Shape:** 16 px de radio, alto mínimo 56 px, letra display 700 a 18 px.
- **Verde (`btn-liquid`):** degradado nopal con brillo en la mitad superior y texto blanco; acción principal de pantalla u hoja.
- **Café (`btn-cafe`):** degradado café con texto crema; acción secundaria de peso.
- **Maíz (`btn-maiz`):** degradado amarillo con texto café; solo destello, usarlo poco.
- **Cristal (`btn-glass`):** secundario neutro con texto café.
- **Microanimación:** al presionar la gota se aplasta (squish `scale(1.025, .94)`, 90 ms) y regresa; una onda líquida blanca nace donde toca el dedo y crece 650 ms (la dispara LiquidEffects con un solo listener global); vibración de 6 ms en Android.

### Cards / Containers
- **Corner Style:** 16 px.
- **Background:** blanco translúcido 66 a 36% en claro, 14 a 6% en oscuro (degradado 160°); variante fuerte 84 a 62%.
- **Shadow Strategy:** Cristal, con rim y brillo especular.
- **Internal Padding:** 20 a 24 px.

### Inputs / Fields
Los datos numéricos se capturan con MoneyField: tarjeta de cristal de 80 px de alto, etiqueta a la izquierda (600) con pista en tinta suave y cifra de 1.875rem a la derecha; al tocarlo abre el NumPad en una hoja. Cursor de texto en chile. El NumPad muestra la cifra en 3.75rem, teclas `btn-glass` de 64 px en 3 columnas con huecos de 10 px, "Borrar todo" y confirmación verde a todo el ancho; el valor inicial se reemplaza al primer toque, limita a 8 dígitos y 2 decimales.

### Navigation
Dock flotante de cristal con 3 destinos (Inicio, Días, Productos), icono duotone de 28 px sobre etiqueta de 14 px en 700. La gota verde (`layoutId`) viaja entre destinos con resorte (stiffness 380, damping 26, mass 0.8) y el icono activo da un pequeño salto; los inactivos van en tinta suave. ThemeToggle es un botón de 48 px con sol o luna que rota al cambiar y usa View Transitions (450 ms); guarda la elección en `localStorage` (`osiris-tema`) y el script del `<head>` la aplica antes de pintar.

### Hoja de cristal (signature)
Hoja inferior que se desliza con resorte (stiffness 380, damping 26, mass 0.9), sobre un scrim del tema con blur de 3 px. Alto máximo 92 dvh, ancho máximo `max-w-xl`, asa de 44x6 px, título 2xl en 800, cierre con X, arrastre hacia abajo (más de 120 px o velocidad 600), toque fuera o Escape; atrapa el foco y lo devuelve. Con "menos movimiento" solo hace fundido. Las capturas y confirmaciones abren como hoja y no reemplazan la pantalla.

### Orbe líquido (LiquidGauge)
Círculo de cristal que se llena con dos olas en bucle (7 s y 11 s en sentido contrario): ola trasera maíz, ola delantera en degradado verde, brillo especular y filo de borde. El nivel sube con resorte (stiffness 60, damping 16). Muestra la meta del mes; es identidad aprobada por el usuario.

### Estado del cuadre
Insignia de 12 px de radio con fondo tintado del tono y texto e icono del tono, más palabra: Cuadró (nopal, check), Faltó (chile, advertencia), Sobró (maíz oscuro, flecha). Entra con un pop elástico. Al cuadrar, Burst lanza una ráfaga de gotas (verde, maíz, café) desde el centro.

### Cantidades y cifras
QtyStepper: menos en tinta suave y más en verde, ambos íconos sueltos de 56 px sin fondo, con la cifra central (1.875rem) entre ellos; la cifra rueda hacia arriba o abajo con blur y al tocarla abre el teclado. AnimatedNumber hace rodar el dinero y los porcentajes hasta su valor (0.9 s, ease-out-expo). ProductoIcon muestra el emoji del producto (🌶️ salsas, 🫘 frijoles, 🍚 arroz, 🔺 totopos, 🥜 jarochas, 🪨 molcajete, 🥑 guacamoles, 🫓 sopes y tortilla, 🌽 tostadas, 🌾 harina, 🛒 genérico) en 32, 44 o 64 px, y al tocarlo se agranda y gira.

### Estados vacíos y carga
EmptyState: tarjeta de cristal con icono grande en café (puede flotar), título, frase corta y acción. Los esqueletos usan un brillo que cruza (shimmer).

## Do's and Don'ts

### Do:
- **Do** usar `.glass` (o Glass) como contenedor de todo bloque y abrir capturas en `Sheet`.
- **Do** asignar colores por rol: verde para acción y éxito, café para estructura, amarillo para destello.
- **Do** colocar iconos y emojis sueltos, con sombra suave, sin cuadro ni círculo.
- **Do** leer colores de las variables `--c-*` para que el tema oscuro funcione solo.
- **Do** mantener objetivos táctiles de 56 px o más en acciones de captura.
- **Do** mostrar toda cifra con `.num` y animar las que cambian con AnimatedNumber.
- **Do** acompañar cada tono de estado con icono y palabra.
- **Do** respetar `prefers-reduced-motion` (la hoja de CSS reduce animaciones a 0.01 ms y los componentes de motion lo consultan).

### Don't:
- **Don't** usar negro puro en texto, fondo o sombra del tema claro; el oscuro es grafito verdoso con café.
- **Don't** poner iconos o emojis dentro de cuadros o círculos contenedores.
- **Don't** hacer del amarillo el color dominante ni el botón principal.
- **Don't** poner más de una acción verde por pantalla.
- **Don't** expresar cuadró, faltó o sobró solo con color.
- **Don't** esconder navegación en menús; el dock tiene 3 destinos fijos.
- **Don't** mezclar otra librería de iconos con Phosphor.
- **Don't** depender de la refracción SVG: es mejora solo para Chromium y el diseño debe verse completo con blur normal.
