<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project: Frame Diagram Simulator

A Next.js 16 + React 19 client-side app that renders structural internal force diagrams (N/Q/M) for 2D frames using the direct stiffness method.

## Commands

```bash
npm install     # required: installs jsdom + testing-library for the component tests
npm run dev     # dev server on localhost:3000
npm test        # full Vitest suite (836 checks, 2 projects — must stay green)
npm run build   # production build (must stay clean)
npm run lint    # ESLint
npx tsc --noEmit  # TypeScript check
```

`npm test` runs two Vitest projects (see `vitest.config.mts`): **lib** (node env, pure math/logic in `src/lib/__tests__/*.test.ts`) and **components** (jsdom env, React render tests in `src/components/__tests__/*.test.tsx`). The component project needs `jsdom` + `@testing-library/*`, which are in `devDependencies` — run `npm install` first or `npm test` fails to start. The `test` script sets `NODE_OPTIONS=--no-experimental-webstorage` because Node's own built-in `localStorage` global otherwise shadows jsdom's implementation.

## Critical rules

### Solver and sampling — do not touch the math

`src/lib/solver.ts` and `src/lib/sampling.ts` are verified implementations. Add TypeScript type annotations only. Any change to an arithmetic expression will break the 33-test suite. If a test fails after editing these files, revert immediately.

### Test suite is non-negotiable

`src/lib/__tests__/solver.test.ts` must pass at all times (`npm test`). Never skip or modify a failing test — fix the implementation instead.

### Sign conventions

Internal (sampling) signs are fixed — never flip them:

- N > 0 = tension (teal), N < 0 = compression (red)
- Positive (sagging) M is on the tension-fibre side (below a horizontal beam)

How diagrams are *drawn and labelled* is selected by the **sign-convention setting** (`prefs.signConvention`: `argentina` default / `international`) via `src/lib/conventions.ts` (`diagramSigns` → per-diagram `{ sideSign, dispSign }`), applied in `FrameCanvas` / `DiagramLayer` / `ResultsPanel`. `sideSign` picks the drawn side; `dispSign` flips only the displayed number. `buildMemberDiagram` uses a **canonical, node-order-independent normal for N and Q** (so negatives land left of columns / above beams regardless of how the member was defined), and the **raw i→j normal for M** so the moment stays on the tension fibre and continuous across beam–column joints. This is presentation only — never touch `solver.ts` / `sampling.ts`.

## Architecture notes

- **No server state.** Everything is client-side; pages are statically prerendered (no API routes). `page.tsx` is `'use client'`; all computation happens in `useMemo`. There are also two guide pages: `/learn` (`src/app/learn/page.tsx`, Tangent Method) and `/esfuerzos-caracteristicos` (`src/app/esfuerzos-caracteristicos/page.tsx`, internal-forces guide, bilingual).
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
| `src/lib/solver3d.ts`, `sampling3d.ts` | 3D frame solver (6 DOF/node, 12×12 beam, uniform loads over the whole member or a `from`/`to` span) + N/Qx/Qy/T/Mx/My sampling — independent of the 2D solver; same don't-touch-the-math rule once verified. The solver keeps its own local frame (x' along the member); the course's triad is applied only when presenting results (`localFrame.ts`, `sampling3d.ts`) |
| `src/lib/{types3d,solve3d,results3d,presets3d,projection3d}.ts` | 3D id-based model, adapter, derived results/equilibrium, 2 presets, oblique projection (x right, z up, **y toward the viewer**, down-left — the course's left-handed global triad; the solver's numbers already follow it, verified against the professor's resolution in `frame3d.test.ts`) |
| `src/lib/localFrame.ts` | Course triad of a member (the professor's, **left-handed: x × y = −z**): **z along the member (down, or to the left if horizontal), x out of the plane (−Y for a frame in the x-z plane), y to the right (columns) or down (beams)**, independent of how the member's nodes are ordered. The global Y is drawn toward the viewer (see `projection3d.ts`), so this x points *away* from the viewer: checked against the professor's My (positive when a +Y load bends the column, i.e. tension on the back fibre). Internal forces: N > 0 tension, Qx/Qy are the force components on the +z face, T the torque about z, and Mx/My are bending moments that are positive when they tension the +y / +x fibres, so σ = N/A + Mx·y/Ix + My·x/Iy |
| `src/lib/profiles.ts`, `stress3d.ts`, `sectionCut.ts` | IPN/IPB table (CIRSOC, transcribed from the course PDF; `profiles.test.ts` checks every row against its geometry) and the σ check: σ = N/A + Mx·y/Ix + My·x/Iy at the section corners vs `sigmaAdm` (kN/cm² as in the course: 14 kN/cm² = 140 MPa; assumes kN and m; the profile's strong axis is x, depth along y, unless `rotated`); a member's `profile`/`rotated` override A, Iy, Iz, J; `sectionCut` gives the stress state of one cross-section (σ from N, Mx, My per corner, neutral axis) for the `SectionCut` panel (`stressAt` = σ at any point of the cut, `sectionRects` = the I section as three rectangles, `memberStressField` = σ(x, y, z) over the whole member from the stations, scaled by the member's largest |σ|) |
| `src/app/frame3d/page.tsx` + `Frame3DCanvas`, `Model3DEditor`, `Results3DPanel`, `canvas3d/*` | `/frame3d` — 3D simulator page (separate from the 2D app). The editor panel collapses with the « / » button in its own header (kept mounted, only `hidden`); the frame canvas has a full-screen button |
| `src/components/SectionCut.tsx`, `SectionResultant.tsx`, `SectionPrism.tsx`, `FullscreenFigure.tsx`, `SignMark.tsx` | The **Section cut** panel of `/frame3d`, four views of one cross-section: (1) `SectionCut`'s own SVG — σ(N), σ(Mx), σ(My) and the corner sums; (2) `SectionResultant` — the professor's *oblique* diagram, in the plane of the section; (3) `SectionPrism` — oblique 3D view of the **whole member** (z into the page, z = 0 at the front): the sides are painted with σ at every z (`memberStressField` in `sectionCut.ts`, interpolating the solver's stations) and the solid plate that slides with the Z slider is the cut, which carries the member's loads in the section's axes, the corner values and a black ring on the most stressed corner; the two ends are dashed outlines, the local triad sits at the right. A distributed load is drawn as a **row of arrows over its loaded span** (`zSpan` of `sectionLoads`; the legend gives the span when it is not the whole member), drawn **only up to the cut** (what is past it is not on the free body — same rule as a reaction past the cut — so the row grows with the slider and ends at the plate); the thick arrows **at the plate** appear only while the cut is inside the loaded span (past the end of the span the load is still on the free body — the row and the legend show it — but it does not act at that section); one arrow at the cut alone would read as "acts along the whole member", and faint arrows past the cut were rejected as inconsistent with the reaction rule. The "z = 0" / "z = L" labels sit clear of the cut's corner values (a test checks the vertical separation at both ends). The sides live in a memoised `PrismSides` (they do not depend on the cut: without it dragging the slider repaints ~1300 polygons per step); (4) the check equation + tables. `SignMark` is the circled + / − the σ(N), σ(Mx), σ(My) and resultant areas carry (tension / compression). `FullscreenFigure` wraps each figure (and the frame canvas) with a full-screen button and, for the cut figures, shows the cut controls (member, Z slider, "go to σ max") inside the figure while it is full screen |
| `src/lib/resultantDiagram.ts` | Geometry of the resultant diagram (pure, screen px): E.N. (σ = 0), two lines **parallel to the E.N. through the extreme fibres**, and a baseline **perpendicular to the E.N.** (the direction σ grows) with the ordinates lying *along the parallels*, so the whole diagram tilts with the E.N. Positive ordinates point down the screen, away from the section. Returns `null` when σ is uniform (only N) |
| `src/lib/peakLocation.ts` | Where the largest \|σ\| of the model is: the critical bar, and whether it is **at a node** (support, joint) or **inside the bar** (or constant along it). Derived from the stress check, so it stays true when loads are edited. `/frame3d` writes it under the canvas, in amber when the maximum is interior (that is the case that needs looking for the interior maximum). Only preset #5 is like that (a test pins it) |
| `src/lib/sectionLoads.ts` | The loads of a member in the section's axes (x right, y up, z into the page): distributed loads and the reaction (+ moments) of an end support. **Only the free body counts**: the internal forces of a cut are the ones on the +z face, which balance the part with z < the cut, so a load or reaction past the cut is not listed |
| `src/lib/basicShapes.ts` + `src/components/ShapeExplorer.tsx` | The **Basic shapes** tab of `/perfiles`: the 12 shapes of the course's "Características geométricas" table (square, rectangle, right / isosceles triangle, rhombus, trapezoid, regular hexagon, circle, semicircle, quarter circle, circular sector, ring) with area, centroid, J about X, Y through O and about Xg, Yg. Closed forms transcribed from the table (+ the formula text shown in the UI); `integrate()` computes the same quantities from the outline (Green's theorem) and `basicShapes.test.ts` checks **every** closed form against it for several dimension sets, so a transcription slip fails. Axes as the table draws them (X right, Y up, O at the lower-left of the bounding box, at the vertex for quarter circle / sector); the sector's α is the half-angle, typed in degrees. The course PDF itself is **not** in the repo (the data was typed in) |
| `src/lib/eccentric.ts` + `src/components/EccentricSection.tsx`, `src/app/flexion-compuesta/page.tsx` | `/flexion-compuesta` — eccentric axial load on an IPN/IPB section (oblique compound bending): reduces P_z at (e_x ⟂ web, e_y ∥ web) to N, Mx = P·e_y, My = P·e_x, σ at the four corners (same convention as `stress3d`, in kN and **cm**), neutral axis, tension/compression zones and the P_max that brings the critical corner to σ adm. Pure math in `eccentric.ts` (`eccentric.test.ts`, `EccentricSection.test.tsx`); independent of the 3D solver |
| `src/lib/solver.ts`                                  | `solveFrame` — direct stiffness method, Gaussian elimination                                                                                     |
| `src/lib/sampling.ts`                                | `sampleMember` — N/Q/M at 64+ stations along a member                                                                                            |
| `src/lib/solve.ts`                                   | Adapter: id-based model → solver input + `sampleMember` calls                                                                                    |
| `src/lib/geometry.ts`                                | `makeTransform` — world↔screen, padded bounds, zoom/pan                                                                                          |
| `src/lib/diagram.ts`                                 | `buildMemberDiagram`, `quadGroupToSvgPoints` (canonical normal for N/Q, raw for M)                                                               |
| `src/lib/conventions.ts`                             | `diagramSigns` — per-diagram `{sideSign, dispSign}` for Argentina vs International                                                               |
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
| `src/app/esfuerzos-caracteristicos/page.tsx`         | `/esfuerzos-caracteristicos` — internal forces guide (N/Q/M, local triad, diagrams), bilingual                                                  |
| `src/contexts/PrefsContext.tsx`                      | Persistent prefs incl. `signConvention` (argentina/international), remember-work, grid snap                                                      |
| `vitest.config.mts`                                  | Vitest, 2 projects (lib=node, components=jsdom), `@/*` alias                                                                                     |

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

- `conventions.test.ts` — `diagramSigns` returns the expected `{sideSign, dispSign}` for both conventions × N/Q/M.
- `sectionCut.test.ts`, `sectionLoads.test.ts`, `resultantDiagram.test.ts` — the cut's σ field (`stressAt`, `sectionRects`, `memberStressField`: equals the cut's field at its own z, varies along the member, same maximum as the stress check), the loads in the section's axes (free body only), and the resultant diagram's geometry (σ max / σ min where the parallels meet the baseline, σ = 0 on the E.N., baseline ⟂ E.N.).
- Components: `SectionCut.test.tsx` (figures, loads on the prism, σ along z on the prism's sides and the plate moving with the slider, legend width, full screen + the Z slider inside it), `Frame3DPage.test.tsx` (collapsible editor panel, full screen on the frame canvas).

Total 836 checks (`npm test`). Component tests render with `@testing-library/react`; remember to add a test there when adding a canvas layer or fixing a rendering bug.

## 3D presets: numbering (do not "fix" this)

The `#N` in each preset's label (`f3d.example.*` in `LanguageContext.tsx`) is its position in `PRESETS_3D` and is **permanent** — people say "preset #3". Never reorder or renumber: a new preset goes at the END (#9, #10…), a removed one leaves a gap. Labels carry the number, the kind of frame and the support, **not the loads** (they change, and are long); only a property that makes the preset special is added (#5: "σ max inside the bar"). The select shows which preset is loaded (found by identity with `PRESETS_3D[i].model`), and goes back to its placeholder as soon as the model is edited.

## Section-cut conventions (do not "fix" these)

- The cut's view is **x right, y up, z into the page** (the course's left-handed triad). The professor's own exam sheets sometimes draw x vertical / y horizontal; the app keeps one convention.
- The resultant diagram follows the professor's sheet: baseline ⟂ E.N., ordinates on the parallels. An axis-aligned baseline or a perspective "stress plane" was tried and rejected.
- **A σ below `SIGMA_EPS` (0.005, what a "0.00" shows) is zero.** The solver leaves ~1e-13 of numerical noise where the true value is 0 (the free end of a member: z = 0). `resultantLayout` returns `null` when σ is below that or varies less than that over the section, so no diagram is built on noise (it used to draw full-size triangles for "σ max = -0.00" and an E.N. miles away); a 0.00 is also never painted tension-green or compression-red.
- When σ is the same everywhere (a free end with nothing before it: σ = 0; or only N) there is no E.N., so `SectionResultant` writes that ("σ = 0 at this cut" / "uniform σ") instead of an empty figure, and `SectionPrism` shows "0.00" (never "-0.00") and no "most stressed corner" ring.
- σ labels of the resultant go *past* the baseline's ends (beside it when the baseline is flat-ish, above/below when steep), never on it. The legend of `SectionPrism` must fit its viewBox with kg-sized numbers (100+ shown without decimals; a test measures it).
- `FullscreenFigure`'s CSS (`globals.css`, `.fs-figure:fullscreen svg:not(.fs-icon)`) resizes the figure's SVG; its own button icon has the class `fs-icon`. In tests, `container.querySelector("svg")` inside a figure is the **icon**, not the drawing — use `svg:not(.fs-icon)`. jsdom has no Fullscreen API: tests install `requestFullscreen` themselves.
- The bar with the member select and the Z slider is **sticky** at the top of the scrolling area (`sticky -top-2`: the `-2` cancels the `p-2` of `<main>`, otherwise a strip of the figures shows above it), so Z can be moved while looking at any figure — not only in full screen, where the same controls are repeated inside the figure.
- Not handled: `requestFullscreen` on a `div` does not work on iPhone Safari (the button does nothing there).

## Out of scope (v1)

Dynamic/modal analysis, second-order effects, member self-weight, 3D hinges/releases, 3D drag-to-move, 3D share links (the 3D solver + `/frame3d` page exist and are tested in `solver3d.test.ts`, `frame3d.test.ts`, `Frame3DCanvas.test.tsx`), inclined supports, temperature loads, member-internal concentrated moments. Leave hook slots but do not build.
