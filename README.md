# Frame Diagram Simulator

Interactive 2D plane frame simulator that computes and renders the three characteristic internal force diagrams — **N** (normal/axial), **Q** (shear), **M** (bending moment) — for statically determinate and indeterminate frames.

## Features

- Define frames via an editable table: nodes (x, y, support type), members (with optional end hinges), and loads (nodal, member point, UDL)
- Solves determinate **and** indeterminate frames using the direct stiffness method
- Renders N, Q, M as filled polygons along/perpendicular to each member with correct sign conventions:
  - N two-tone: tension (`+`) in teal, compression (`−`) in red
  - Q shows jumps at point loads automatically
  - M drawn on the tension-fibre side; parabolic under UDL
- Drag nodes to reshape the structure — diagrams recompute live
- Per-diagram scale sliders and on/off toggles
- Reactions, load arrows, support symbols, and internal hinge markers
- Export current view as SVG or PNG
- Five built-in example presets

## Tech stack

| Concern    | Choice                               |
|------------|--------------------------------------|
| Framework  | Next.js 16 (App Router), TypeScript  |
| Rendering  | Inline SVG                           |
| Styling    | Tailwind CSS v4                      |
| State      | React `useState` / `useMemo`         |
| Tests      | Jest + ts-jest                       |

The entire interactive surface is a client component (`'use client'`). No API routes, no server state.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # solver test suite (33 checks)
npm run build      # production build
```

## Project structure

```
src/
  app/
    layout.tsx          # root layout + metadata
    page.tsx            # 'use client' — hosts the whole simulator
    globals.css
  components/
    FrameCanvas.tsx     # SVG scene: structure, supports, loads, N/Q/M diagrams
    ModelEditor.tsx     # tabbed editor for nodes, members, loads, material
    DiagramControls.tsx # diagram toggles + per-diagram scale sliders
    PresetMenu.tsx      # dropdown to load example structures
  lib/
    types.ts            # FrameModel, FrameNode, Member, Load, Material
    solver.ts           # direct stiffness solver (solveFrame) — do not edit math
    sampling.ts         # internal force sampling (sampleMember) — do not edit math
    solve.ts            # adapter: id-based FrameModel → solver index-based input
    geometry.ts         # world↔screen transform + bounds
    diagram.ts          # polygon builder for N/Q/M diagrams
    presets.ts          # five example structures
    __tests__/
      solver.test.ts    # 33 acceptance checks
```

## Sign conventions

| Diagram | Convention |
|---------|-----------|
| **N** | `> 0` tension, `< 0` compression |
| **Q** | Standard beam convention from the i-end free body |
| **M** | `> 0` sagging; diagram drawn on the tension-fibre side (positive M on a horizontal beam appears below the beam) |

## Load types

| Type | Fields | Notes |
|------|--------|-------|
| `nodal` | `node`, `fx`, `fy`, `m` | Force/moment at a node; global components |
| `mpoint` | `member`, `dist`, `gx`, `gy` | Point load on member at `dist` from n1; global components |
| `mudl` | `member`, `gx`, `gy` | Uniformly distributed load over full member length; global components |

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
