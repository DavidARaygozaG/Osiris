---
version: 1
slug: "src-app-page-js"
primary_target: "src/app/page.js"
related_targets: ["src/app","src/modules","src/components"]
---

# Surface brief: app completa (Operate, móvil primero)

Modo: Operate. Todas las vistas de la PWA: Inicio, Corte (wizard), Historial, Inventario, Admin, Offline.

Audiencia/tarea: empleado de mostrador, al cierre, de pie, con prisa, poca experiencia tecnológica. Cierra la cuenta del día sin errores. Restricción: conservar todos los datos, el cálculo del store y las rutas /api existentes.

## Direction contract

THESIS: "Maíz Líquido". Una pregunta por pantalla, números enormes, cristal claro sobre luz de masa y maíz. Rechaza el dashboard oscuro con tarjetas iguales y el wizard de formulario largo.

OWN-WORLD: Tema claro. Ground crema de masa (#FBF3E1) con tres manchas de luz borrosas fijas (oro maíz, chile, nopal). Tinta marrón de nixtamal (#2A1F14), nunca negro. Primario oro maíz con texto tinta; "cuadró" = verde nopal; "faltó" = rojo chile. Liquid Glass: backdrop-filter blur+saturate, relleno blanco 40-55%, borde interior de 1px claro, brillo especular superior, sombra cálida tintada. Radios 16 (tarjetas), 24 (hojas y dock), 14 (botones, inputs). Tipografía: Bricolage Grotesque (display y cifras, tabular) + Hanken Grotesk (texto). Iconos Phosphor (react-icons/pi), un solo trazo.

STORY: El empleado sabe en cada pantalla qué sigue. Ve el total del día crecer mientras captura y al final entiende de un vistazo si cuadró, faltó o sobró.

FIRST VIEWPORT (Inicio, 390x844): saludo corto + fecha arriba con engranaje de admin discreto; una hoja de cristal con el estado del día (hay corte / falta hacerlo) y la meta del mes; un botón gigante "Hacer cuenta del día" en oro maíz que ocupa el tercio inferior-medio; debajo dos acciones secundarias grandes "Practicar cuenta" (calcular) y "Llegó harina"; dock de cristal flotante con 3 destinos (Inicio, Historial, Inventario).

FORM: Hojas de cristal (signature move): la navegación secundaria y las capturas abren como hoja de cristal que se desliza sobre el campo con un leve overshoot, no reemplazan la pantalla (adaptación de "sheets" de la dirección Exposure Record). Teclado numérico propio grande para dinero y cantidades. Seed: 0e3c328f, candidato asignado 3 (reinterpretado dentro de la fijación Liquid Glass del CLAUDE.md del usuario).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
