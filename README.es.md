# Simulador de Diagramas de Esfuerzos

Simulador interactivo de pórticos planos 2D que calcula y representa los tres diagramas de esfuerzos internos característicos — **N** (normal/axial), **Q** (cortante), **M** (momento flector) — para estructuras determinadas e indeterminadas, con un panel de resultados completo y una guía de aprendizaje paso a paso.

## Funcionalidades

- Define estructuras mediante tablas editables con pestañas: nodos (x, y, tipo de apoyo), barras (con articulaciones opcionales en los extremos) y cargas (nodales, puntuales sobre barra, distribuidas uniformes)
- Resuelve pórticos **determinados e indeterminados** mediante el método de rigidez directa
- Representa N, Q, M como polígonos rellenos a lo largo/perpendicularmente a cada barra, con convención de signos correcta:
  - N en dos colores: tracción (`+`) en verde azulado, compresión (`−`) en rojo
  - Q muestra saltos en cargas puntuales de forma automática
  - M se dibuja del lado de la fibra traccionada; parabólico bajo carga distribuida
- **Pestaña Resultados** — esfuerzos en barras con Q/M pico, reacciones en apoyos, desplazamientos nodales y verificación de equilibrio global (ΣFx, ΣFy, ΣM con indicador ✓/✗)
- Arrastra nodos para remodelar la estructura — los diagramas se recalculan en tiempo real; zoom y paneo del lienzo
- Controles de escala por diagrama y activación/desactivación independiente; haz clic en una carga para resaltarla en el lienzo
- Flechas de reacciones, flechas de cargas, símbolos de apoyos y marcadores de articulaciones internas
- **Menú de configuración** — personaliza cada color del lienzo (cargas, barras, etiquetas, diagramas N/Q/M, grilla, fondo…) mediante selector de color + campo hexadecimal, con un preajuste de alto contraste; los toggles y controles de escala de N/Q/M siguen los colores de su diagrama
- **Preferencias que persisten** — «recordar mi trabajo» guarda automáticamente el modelo + la vista entre recargas, además de un tamaño de ajuste de grilla configurable
- **i18n** (español / inglés) y **modo oscuro**, ambos dentro del menú de configuración
- Exporta la vista actual como SVG o PNG
- Ejemplos predefinidos incorporados, incluyendo un pórtico + reticulado y un reticulado de cordones paralelos
- Página **/learn** con la explicación paso a paso del Método de la Tangente (Teoremas de Mohr)

## Tecnologías

| Ámbito       | Elección                                   |
| ------------ | ------------------------------------------ |
| Framework    | Next.js 16 (App Router), TypeScript        |
| Renderizado  | SVG en línea                               |
| Estilos      | Tailwind CSS v4                            |
| Estado       | React `useState` / `useMemo`               |
| i18n / tema  | React context (ES/EN, claro/oscuro)        |
| Tests        | Jest + ts-jest (entorno node + jsdom)      |

Toda la interfaz interactiva es un componente cliente (`'use client'`). Sin rutas de API ni estado en servidor — todas las páginas se prerenderizan estáticamente.

## Primeros pasos

```bash
npm install        # instala también jsdom + testing-library usados en los tests de componentes
npm run dev        # http://localhost:3000
npm test           # suite Jest completa (2 proyectos: lib + components)
npm run build      # build de producción
npm run lint       # ESLint
```

## Estructura del proyecto

```
src/
  app/
    layout.tsx          # layout raíz + metadatos
    page.tsx            # 'use client' — aloja todo el simulador
    learn/page.tsx      # /learn — guía del Método de la Tangente (Mohr)
    globals.css
  components/
    FrameCanvas.tsx     # compone las capas de canvas/; arrastre de nodos, zoom/paneo
    canvas/             # capas SVG por responsabilidad + primitivas
      DiagramLayer.tsx  #   polígonos de diagramas N/Q/M
      GridLayer.tsx     #   rejilla de fondo
      LoadsLayer.tsx    #   flechas de carga (nodal / puntual / distribuida)
      ReactionsLayer.tsx#   flechas de reacción + momentos
      SupportSymbol.tsx #   símbolos de apoyo articulado / móvil / empotrado
      ValueLabel.tsx    #   etiquetas de valores
      loads.tsx         #   primitivas de flecha y marcador de momento
      constants.ts      #   colores y tamaños compartidos
    ModelEditor.tsx     # editor con pestañas: nodos / barras / cargas / material / resultados
    ResultsPanel.tsx    # esfuerzos en barras, reacciones, desplazamientos, equilibrio
    DiagramControls.tsx # activación de diagramas + controles de escala por diagrama
    SettingsPanel.tsx   # menú de configuración: colores, alto contraste, idioma, tema, preferencias
    PresetMenu.tsx      # menú desplegable para cargar estructuras de ejemplo
    Footer.tsx · GitHubLink.tsx
  contexts/
    LanguageContext.tsx # i18n (ES/EN), t(), unión TranslationKey
    ColorContext.tsx    # colores personalizables del lienzo (sagitta-colors)
    PrefsContext.tsx    # preferencias que persisten (recordar trabajo, ajuste de grilla)
  lib/
    types.ts            # FrameModel, FrameNode, Member, Load, Material, Support
    solver.ts           # solver de rigidez directa (solveFrame) — no modificar la matemática
    sampling.ts         # muestreo de esfuerzos internos (sampleMember) — no modificar
    solve.ts            # adaptador: FrameModel con ids → entrada indexada del solver
    geometry.ts         # transformación mundo↔pantalla, límites, zoom/paneo
    diagram.ts          # constructor de polígonos para diagramas N/Q/M
    results.ts          # esfuerzos pico, verificación de equilibrio, limpieza de valores
    loadProjection.ts   # colocación de cargas / auxiliares de flechas UDL
    theme.ts            # lectura/aplicación del tema (claro/oscuro)
    presets.ts          # estructuras de ejemplo
    __tests__/          # solver (33), diagram, geometry, loadProjection, results, presets
  components/__tests__/  # FrameCanvas, ValueLabel, ReactionsLayer, SettingsPanel (jsdom)
```

## Convención de signos

| Diagrama | Convención                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| **N**    | `> 0` tracción, `< 0` compresión                                                                                        |
| **Q**    | Convención estándar de viga desde el sólido libre del extremo i                                                         |
| **M**    | `> 0` flector positivo (sagging); diagrama en el lado de la fibra traccionada (M positivo en viga horizontal → debajo) |

## Tipos de carga

| Tipo     | Campos                       | Notas                                                                       |
| -------- | ---------------------------- | --------------------------------------------------------------------------- |
| `nodal`  | `node`, `fx`, `fy`, `m`      | Fuerza/momento en un nodo; componentes globales                             |
| `mpoint` | `member`, `dist`, `gx`, `gy` | Carga puntual en la barra a `dist` desde n1; componentes globales           |
| `mudl`   | `member`, `gx`, `gy`         | Carga distribuida uniforme en toda la longitud de la barra; componentes globales |

## Apoyos

`free` (libre) · `pinned` (articulado) · `fixed` (empotrado) · `roller-v` (solo reacción vertical) · `roller-h` (solo reacción horizontal)

## Propiedades del material

Expuestas como `E`, `A`, `I` en el modelo con valores por defecto de ingeniería (`E = 2,1×10⁸`, `A = 0,01`, `I = 8,3×10⁻⁵`). En estructuras **determinadas** los diagramas son independientes de estos valores; solo influyen en estructuras **indeterminadas**.

## Ejemplos predefinidos

1. **Viga simplemente apoyada** — carga distribuida uniforme, M parabólico en el centro
2. **Ménsula** — carga puntual en el extremo libre
3. **Pórtico (empotrado)** — indeterminado, carga lateral + carga distribuida
4. **Arco de tres rótulas** — estructura determinada
5. **Pórtico de dos vanos** — pórtico indeterminado compuesto (ensayo de aceptación del solver)
6. **Pórtico + Reticulado** — pórtico de alma llena unido a un reticulado biarticulado, apoyos articulados
7. **Reticulado** — reticulado de cordones paralelos de 12 m × 4 m (3 paneles), apoyo móvil + fijo
8. **Pórtico articulado** — pórtico biapoyado con articulación interna en el dintel
```
