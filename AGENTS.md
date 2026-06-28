<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Frame Diagram Simulator

A Next.js 16 + React 19 client-side app that renders structural internal force diagrams (N/Q/M) for 2D frames using the direct stiffness method.

## Commands

```bash
npm install     # required: installs jsdom + testing-library for the component tests
npm run dev     # dev server on localhost:3000
npm test        # full Jest suite (107 checks, 2 projects — must stay green)
npm run build   # production build (must stay clean)
npm run lint    # ESLint
npx tsc --noEmit  # TypeScript check
```

`npm test` runs two Jest projects (see `jest.config.ts`): **lib** (node env, pure math/logic in `src/lib/__tests__/*.test.ts`) and **components** (jsdom env, React render tests in `src/components/__tests__/*.test.tsx`). The component project needs `jest-environment-jsdom` + `@testing-library/*`, which are in `devDependencies` — run `npm install` first or `npm test` fails to start.

## Critical rules

### Solver and sampling — do not touch the math

`src/lib/solver.ts` and `src/lib/sampling.ts` are verified implementations. Add TypeScript type annotations only. Any change to an arithmetic expression will break the 33-test suite. If a test fails after editing these files, revert immediately.

### Test suite is non-negotiable

`src/lib/__tests__/solver.test.ts` must pass at all times (`npm test`). Never skip or modify a failing test — fix the implementation instead.

### Sign conventions — do not flip

- N > 0 = tension (teal), N < 0 = compression (red)
- M diagram uses `sideSign = -1` so positive (sagging) M appears on the tension-fibre side (below a horizontal beam). Do not change this.

## Architecture notes

- **No server state.** Everything is client-side; pages are statically prerendered (no API routes). `page.tsx` is `'use client'`; all computation happens in `useMemo`. There is also a `/learn` page (`src/app/learn/page.tsx`).
- **Solver pipeline:** `FrameModel` (id-based) → `solve.ts` adapter → `SolverModel` (index-based) → `solveFrame` → `sampleMember` per member → `buildMemberDiagram` → SVG polygons.
- **Canvas is modular.** `FrameCanvas.tsx` composes per-concern layers in `src/components/canvas/` (`DiagramLayer`, `GridLayer`, `LoadsLayer`, `ReactionsLayer`, `SupportSymbol`, `ValueLabel`), with shared colors/consts in `constants.ts` and arrow primitives in `loads.tsx`. Don't reintroduce the old "god component" — add new visuals as a layer.
- **Results are derived, not stored.** `ResultsPanel.tsx` + `src/lib/results.ts` compute member-force peaks (`peak`), the equilibrium residual check (`equilibrium`, ✓/✗ via `EQ_TOL`), reactions, and nodal displacements straight from the `SolveOutput`. The editor's **results** tab surfaces them.
- **World coords:** y-up, metres. SVG coords: y-down. The transform in `geometry.ts` handles the flip via `toSY(y) = oy − y·k`. The canvas supports zoom/pan.
- **Reaction/load arrows:** drawn with the tip AT the node and the shaft trailing opposite the force. For the vertical reaction the arrowhead base offset and the shaft must share the same `sign` (`ReactionsLayer.tsx`) — a mismatch flips the head for one sign.
- **i18n + theme.** All user-facing strings go through `LanguageContext.tsx` (`t(key)`, EN/ES); adding a string means adding the key to BOTH `EN` and `ES` (the `EN` object's keys define the `TranslationKey` union). Dark mode via `ThemeToggle.tsx`.
- **Diagram scale:** `scale = (0.17 · diagLen_px · userSlider) / globalMax`. Three independent sliders (N, Q, M), default 1.
- **Shear jump:** produced automatically by the `d ± 1e-6` station pair in `sampleMember`. No special rendering code needed.
- **Zero-crossing insertion** (`withZeros` in `diagram.ts`) is required so the two-tone N fill splits cleanly at sign changes.

## Key files

| File                                                 | Purpose                                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/types.ts`                                   | `FrameModel`, `FrameNode`, `Member`, `Load`, `Material`, `Support`                                                                               |
| `src/lib/solver.ts`                                  | `solveFrame` — direct stiffness method, Gaussian elimination                                                                                     |
| `src/lib/sampling.ts`                                | `sampleMember` — N/Q/M at 64+ stations along a member                                                                                            |
| `src/lib/solve.ts`                                   | Adapter: id-based model → solver input + `sampleMember` calls                                                                                    |
| `src/lib/geometry.ts`                                | `makeTransform` — world↔screen, padded bounds, zoom/pan                                                                                          |
| `src/lib/diagram.ts`                                 | `buildMemberDiagram`, `quadGroupToSvgPoints`                                                                                                     |
| `src/lib/results.ts`                                 | `peak`, `equilibrium`, `clean` — derived results + ✓/✗ tolerances                                                                                |
| `src/lib/loadProjection.ts`                          | Load placement helpers (`pointLoadPos`, UDL arrow fractions)                                                                                     |
| `src/lib/presets.ts`                                 | 8 preset models (frame+truss, truss, portal w/ hinge, etc.)                                                                                      |
| `src/components/FrameCanvas.tsx`                     | Composes the `canvas/` layers; drag-to-move nodes, zoom/pan                                                                                      |
| `src/components/canvas/*`                            | Per-concern SVG layers: `DiagramLayer`, `GridLayer`, `LoadsLayer`, `ReactionsLayer`, `SupportSymbol`, `ValueLabel` (+ `constants.ts`, `loads.tsx`) |
| `src/components/ModelEditor.tsx`                     | Tabbed editor (nodes / members / loads / material / results)                                                                                     |
| `src/components/ResultsPanel.tsx`                    | Member forces, reactions, displacements, equilibrium                                                                                             |
| `src/components/DiagramControls.tsx`                 | Toggles + scale sliders                                                                                                                          |
| `src/components/PresetMenu.tsx`                      | Preset dropdown (keys mirror `PRESETS`, see `PRESET_KEYS`)                                                                                       |
| `src/components/{ThemeToggle,Footer,GitHubLink}.tsx` | Dark-mode toggle, footer, repo link                                                                                                              |
| `src/contexts/LanguageContext.tsx`                   | i18n (EN/ES), `t()`, `TranslationKey` union                                                                                                      |
| `src/app/page.tsx`                                   | Root client component, wires everything together                                                                                                 |
| `src/app/learn/page.tsx`                             | `/learn` — Tangent Method (Mohr) step-by-step guide                                                                                              |
| `jest.config.ts`                                     | Jest + ts-jest, 2 projects (lib=node, components=jsdom), `@/*` alias                                                                             |

## Testing

**lib project (node, pure math/logic):**

- `solver.test.ts` — the 33-check acceptance suite (non-negotiable):
    1. Simply supported beam — UDL reactions, mid-span M, end-shear values
    2. Cantilever — point load reactions, support moment, constant shear
    3. Cantilever — UDL reactions and moment
    4. Moment release (hinge) — M = 0 at the released end
    5. Compound two-bay portal — global equilibrium (ΣFx, ΣFy, ΣM), hinge condition, local member equilibrium, and three expected reaction values
- `diagram.test.ts`, `geometry.test.ts`, `loadProjection.test.ts`, `results.test.ts` — diagram/geometry/load-placement/results helpers.

**components project (jsdom, React render):** `FrameCanvas.test.tsx`, `ValueLabel.test.tsx`, `ReactionsLayer.test.tsx` (the last guards reaction-arrow direction for both signs of the reaction).

Total ~107 checks. Component tests render with `@testing-library/react`; remember to add a test there when adding a canvas layer or fixing a rendering bug.

## Out of scope (v1)

Dynamic/modal analysis, second-order effects, member self-weight, 3D frames, inclined supports, temperature loads, member-internal concentrated moments. Leave hook slots but do not build.
