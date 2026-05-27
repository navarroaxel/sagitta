@AGENTS.md

# Project: Frame Diagram Simulator

A Next.js 16 + React 19 client-side app that renders structural internal force diagrams (N/Q/M) for 2D frames using the direct stiffness method.

## Commands

```bash
npm run dev     # dev server on localhost:3000
npm test        # Jest test suite (33 checks — must stay green)
npm run build   # production build (must stay clean)
npm run lint    # ESLint
npx tsc --noEmit  # TypeScript check
```

## Critical rules

### Solver and sampling — do not touch the math
`src/lib/solver.ts` and `src/lib/sampling.ts` are verified implementations. Add TypeScript type annotations only. Any change to an arithmetic expression will break the 33-test suite. If a test fails after editing these files, revert immediately.

### Test suite is non-negotiable
`src/lib/__tests__/solver.test.ts` must pass at all times (`npm test`). Never skip or modify a failing test — fix the implementation instead.

### Sign conventions — do not flip
- N > 0 = tension (teal), N < 0 = compression (red)
- M diagram uses `sideSign = -1` so positive (sagging) M appears on the tension-fibre side (below a horizontal beam). Do not change this.

## Architecture notes

- **No server state.** The app is fully static. `page.tsx` is `'use client'`; all computation happens in `useMemo`.
- **Solver pipeline:** `FrameModel` (id-based) → `solve.ts` adapter → `SolverModel` (index-based) → `solveFrame` → `sampleMember` per member → `buildMemberDiagram` → SVG polygons.
- **World coords:** y-up, metres. SVG coords: y-down. The transform in `geometry.ts` handles the flip via `toSY(y) = oy − y·k`.
- **Diagram scale:** `scale = (0.17 · diagLen_px · userSlider) / globalMax`. Three independent sliders (N, Q, M), default 1.
- **Shear jump:** produced automatically by the `d ± 1e-6` station pair in `sampleMember`. No special rendering code needed.
- **Zero-crossing insertion** (`withZeros` in `diagram.ts`) is required so the two-tone N fill splits cleanly at sign changes.

## Key files

| File | Purpose |
|------|---------|
| `src/lib/types.ts` | `FrameModel`, `FrameNode`, `Member`, `Load`, `Material`, `Support` |
| `src/lib/solver.ts` | `solveFrame` — direct stiffness method, Gaussian elimination |
| `src/lib/sampling.ts` | `sampleMember` — N/Q/M at 64+ stations along a member |
| `src/lib/solve.ts` | Adapter: id-based model → solver input + `sampleMember` calls |
| `src/lib/geometry.ts` | `makeTransform` — world↔screen, padded bounds |
| `src/lib/diagram.ts` | `buildMemberDiagram`, `quadGroupToSvgPoints` |
| `src/lib/presets.ts` | 5 preset models |
| `src/components/FrameCanvas.tsx` | Main SVG component; drag-to-move nodes |
| `src/components/ModelEditor.tsx` | Tabbed editor (nodes / members / loads / material) |
| `src/components/DiagramControls.tsx` | Toggles + scale sliders |
| `src/components/PresetMenu.tsx` | Preset dropdown |
| `src/app/page.tsx` | Root client component, wires everything together |
| `jest.config.ts` | Jest + ts-jest, node environment, `@/*` alias |

## Testing

Tests live in `src/lib/__tests__/solver.test.ts`. They cover:
1. Simply supported beam — UDL reactions, mid-span M, end-shear values
2. Cantilever — point load reactions, support moment, constant shear
3. Cantilever — UDL reactions and moment
4. Moment release (hinge) — M = 0 at the released end
5. Compound two-bay portal — global equilibrium (ΣFx, ΣFy, ΣM), hinge condition, local member equilibrium, and three expected reaction values

## Out of scope (v1)

Dynamic/modal analysis, second-order effects, member self-weight, 3D frames, inclined supports, temperature loads, member-internal concentrated moments. Leave hook slots but do not build.
