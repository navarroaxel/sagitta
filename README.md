# Frame Diagram Simulator

Interactive 2D plane frame simulator that computes and renders the three characteristic internal force diagrams — **N** (normal/axial), **Q** (shear), **M** (bending moment) — for statically determinate and indeterminate frames, plus a full results breakdown and a step-by-step learning guide.

## Features

- Define frames via an editable, tabbed table: nodes (x, y, support type), members (with optional end hinges), and loads (nodal, member point, UDL)
- Solves determinate **and** indeterminate frames using the direct stiffness method
- Renders N, Q, M as filled polygons along/perpendicular to each member with correct sign conventions:
  - N two-tone: tension (`+`) in teal, compression (`−`) in red
  - Q shows jumps at point loads automatically
  - M drawn on the tension-fibre side; parabolic under UDL
- **Results tab** — member forces with peak Q/M, support reactions, nodal displacements, and a global equilibrium check (ΣFx, ΣFy, ΣM with a ✓/✗ flag)
- Drag nodes to reshape the structure — diagrams recompute live; zoom and pan the canvas
- Per-diagram scale sliders and on/off toggles; click a load card to highlight it on the canvas
- Reactions, load arrows, support symbols, and internal hinge markers
- **i18n** (English / Spanish) and **dark mode**
- Export current view as SVG or PNG
- Seven built-in example presets, including a frame+truss (`r1`) and a parallel-chord truss (`r2`)
- A **/learn** page walking through the Tangent Method (Mohr's theorems) step by step

## Tech stack

| Concern    | Choice                              |
| ---------- | ----------------------------------- |
| Framework  | Next.js 16 (App Router), TypeScript |
| Rendering  | Inline SVG                          |
| Styling    | Tailwind CSS v4                     |
| State      | React `useState` / `useMemo`        |
| i18n/theme | React context (EN/ES, light/dark)   |
| Tests      | Jest + ts-jest (node + jsdom)       |

The entire interactive surface is a client component (`'use client'`). No API routes, no server state — all pages are statically prerendered.

## Getting started

```bash
npm install        # also installs jsdom + testing-library used by the component tests
npm run dev        # http://localhost:3000
npm test           # full Jest suite (~83 checks across 2 projects)
npm run build      # production build
npm run lint       # ESLint
```

## Project structure

```
src/
  app/
    layout.tsx          # root layout + metadata
    page.tsx            # 'use client' — hosts the whole simulator
    learn/page.tsx      # /learn — Tangent Method (Mohr) guide
    globals.css
  components/
    FrameCanvas.tsx     # composes the canvas/ layers; drag nodes, zoom/pan
    canvas/             # per-concern SVG layers + primitives
      DiagramLayer.tsx  #   N/Q/M diagram polygons
      GridLayer.tsx     #   background grid
      LoadsLayer.tsx    #   load arrows (nodal / point / UDL)
      ReactionsLayer.tsx#   reaction arrows + moments
      SupportSymbol.tsx #   pinned / roller / fixed symbols
      ValLabel.tsx      #   value labels
      loads.tsx         #   arrow + moment-marker primitives
      constants.ts      #   shared colors / sizes
    ModelEditor.tsx     # tabbed editor: nodes / members / loads / material / results
    ResultsPanel.tsx    # member forces, reactions, displacements, equilibrium
    DiagramControls.tsx # diagram toggles + per-diagram scale sliders
    PresetMenu.tsx      # dropdown to load example structures
    ThemeToggle.tsx · Footer.tsx · GitHubLink.tsx
  contexts/
    LanguageContext.tsx # i18n (EN/ES), t(), TranslationKey union
  lib/
    types.ts            # FrameModel, FrameNode, Member, Load, Material, Support
    solver.ts           # direct stiffness solver (solveFrame) — do not edit math
    sampling.ts         # internal force sampling (sampleMember) — do not edit math
    solve.ts            # adapter: id-based FrameModel → solver index-based input
    geometry.ts         # world↔screen transform, bounds, zoom/pan
    diagram.ts          # polygon builder for N/Q/M diagrams
    results.ts          # peak forces, equilibrium check, value cleaning
    loadProjection.ts   # load placement / UDL arrow helpers
    presets.ts          # seven example structures
    __tests__/          # solver (33), diagram, geometry, loadProjection, results
  components/__tests__/  # FrameCanvas, ValLabel, ReactionsLayer (jsdom)
```

## Sign conventions

| Diagram | Convention                                                                                                      |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| **N**   | `> 0` tension, `< 0` compression                                                                                |
| **Q**   | Standard beam convention from the i-end free body                                                               |
| **M**   | `> 0` sagging; diagram drawn on the tension-fibre side (positive M on a horizontal beam appears below the beam) |

## Load types

| Type     | Fields                       | Notes                                                                 |
| -------- | ---------------------------- | --------------------------------------------------------------------- |
| `nodal`  | `node`, `fx`, `fy`, `m`      | Force/moment at a node; global components                             |
| `mpoint` | `member`, `dist`, `gx`, `gy` | Point load on member at `dist` from n1; global components             |
| `mudl`   | `member`, `gx`, `gy`         | Uniformly distributed load over full member length; global components |

## Supports

`free` · `pinned` · `fixed` · `roller-v` (vertical reaction only) · `roller-h` (horizontal reaction only)

## Material properties

Exposed as `E`, `A`, `I` on the model with engineering defaults (`E = 2.1×10⁸`, `A = 0.01`, `I = 8.3×10⁻⁵`). For **determinate** frames the diagrams are independent of these values; they only matter for **indeterminate** frames.

## Presets

1. Simply supported beam — UDL, mid-span parabolic M
2. Cantilever — point load at tip
3. Portal frame (fixed bases) — indeterminate, lateral load + UDL
4. Three-hinged frame — determinate arch
5. Two-bay portal — compound indeterminate frame (the solver acceptance test)
6. Frame + truss (`r1`) — solid-web frame joined to a pin-jointed truss, pinned supports
7. Truss (`r2`) — 12 m × 4 m parallel-chord truss (3 panels), roller + pinned supports
