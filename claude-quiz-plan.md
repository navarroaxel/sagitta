# Plan — Add `/claude-quiz` to `sagitta` and link it from `/quiz`

**Repo:** https://github.com/navarroaxel/sagitta — Next.js 16 + React 19, Tailwind v4,
App Router, static prerender, custom i18n (EN/ES) via `LanguageContext`.

## Context (read carefully)

`/quiz` **already exists** in the repo, on an **unmerged branch**. It is not an index —
it is a concrete exam: **20 True/False statics questions**, with **bilingual data
(`en`/`es`)**, persistence via `PrefsContext` ("remember my work"), i18n via
`LanguageContext`, a link in the **header** next to `/learn`, and SEO metadata on the
page. Its files (as planned): `src/lib/quiz.ts` (types + logic), `src/lib/quizData.ts`
(the 20 questions), `src/components/quiz/`, `src/app/quiz/page.tsx`.

**Goal of this task:** add a **second** theory exam — *Estabilidad* (Ing. Eléctrica,
UTN FRBA), **42 questions, True/False + multiple choice**, with per-topic filtering,
immediate feedback, and explanations — at the route **`/claude-quiz`**, with **SEO**,
and add a link on the **`/quiz`** page to `/claude-quiz` presented as **another theory
exam example**.

> The exam content (statements/explanations) is in **Spanish** on purpose — this is
> exam-prep material for a Spanish-language university course. The full question bank
> is provided inline in section **§11** of this file; copy it verbatim.

---

## 0) Before writing code (required)

1. **Work on top of the unmerged `/quiz` branch, not `main`.** Locate it and branch
   off it so both exams coexist without conflicts:
   ```bash
   git fetch --all
   git branch -a            # find the /quiz branch (e.g. feat/quiz)
   git switch <quiz-branch>
   git switch -c feat/claude-quiz
   ```
   If the `/quiz` branch is not available, **ask the user for the branch/PR name**
   before proceeding. Do **not** recreate `/quiz`.
2. **Read the actual `/quiz` code** already written (`src/app/quiz/page.tsx`,
   `src/lib/quiz.ts`, `src/lib/quizData.ts`, `src/components/quiz/*`) and **copy its
   conventions exactly**: the shape of the bilingual data, how it declares SEO
   metadata, how it persists state with `PrefsContext`, and where/how it added the
   header link.
3. `AGENTS.md` warns that **this Next.js is NOT the one in your training data**. Read
   the local docs before touching metadata/routes:
   ```bash
   npm install
   ls node_modules/next/dist/docs/   # metadata, generateMetadata, sitemap/robots, server vs client
   ```
4. Establish a green baseline first:
   ```bash
   npm test && npm run build && npx tsc --noEmit && npm run lint
   ```
   Do **not** touch `src/lib/solver.ts` or `src/lib/sampling.ts` (verified math).

---

## 1) Avoid collisions with the existing `/quiz` ⚠️

`/quiz` already owns these names. **Do not reuse them for the new exam:**

| Used by `/quiz`         | Use for `/claude-quiz`                              |
| ----------------------- | -------------------------------------------------- |
| `src/lib/quiz.ts`       | `src/lib/claudeQuiz.ts` (logic) — or reuse types   |
| `src/lib/quizData.ts`   | `src/lib/claudeQuizData.ts` (content in §11)        |
| `src/components/quiz/`   | `src/components/claude-quiz/`                       |
| `src/app/quiz/`         | `src/app/claude-quiz/`                              |

The new data exports are namespaced to avoid clashes: `ClaudeQuizQuestion`,
`ClaudeQuizTopic`, `ClaudeQuizType`, `CLAUDE_QUIZ_QUESTIONS`, `CLAUDE_QUIZ_TOPICS`.

---

## 2) Reuse the `/quiz` engine, or build a new one?

The two exams have **different mechanics**:

| | `/quiz` (existing) | `/claude-quiz` (new) |
|---|---|---|
| Types | True/False only | True/False **and** multiple choice |
| Grading | "Check" at the end (all at once) | **immediate**, per question |
| Extras | — | **topic filter**, per-question explanation, shuffle |

**Recommendation:** build `/claude-quiz` as a **parallel feature** (its own data, its
own components in `src/components/claude-quiz/`), **reusing patterns** from `/quiz`
(PrefsContext persistence, SEO metadata pattern, Tailwind/stone styling, i18n) but
**without** forcing a shared engine. Generalizing the `/quiz` engine to support MC +
filter + immediate feedback adds coupling/risk on a still-unmerged branch. If the user
prefers DRY, that's a decision to confirm (§9). If reusing types, extract a base type
in `src/lib/quiz.ts` and have the new one extend it — only if `/quiz` already exposes
something compatible.

---

## 3) Data — `src/lib/claudeQuizData.ts`

Create this file with the **exact content from §11** (42 questions: 9 forces, 9
supports/DOF, 6 kinematic chains, 10 trusses, 8 inertia). Statements and explanations
stay in **Spanish**.

**Consistency decision (confirm, §9):** `/quiz` stores bilingual statements
(`{en, es}`). To match that standard here, change `statement`/`explanation` to
`{ es: string; en: string }` and resolve by language in the component (a comment in
the file marks exactly this). Translating 42×2 texts is extra work; by default keep
**ES-only** with the type ready to go bilingual.

`src/lib/claudeQuiz.ts` (optional): pure, testable helpers (shuffle questions, compute
score, filter by topic, validate the data). Good for the TDD step (§7).

---

## 4) `/claude-quiz` — page with SEO + UI

### 4.1 `src/app/claude-quiz/page.tsx` — **server component** (SEO)
- No `'use client'`. Export `metadata: Metadata`, **replicating the pattern `/quiz`
  already uses** (look at its `page.tsx`). Include:
  - `title`, e.g. *"Examen teórico de Estabilidad (V/F y multiple choice) — Ing.
    Eléctrica UTN FRBA"*
  - `description` (150–160 chars) with natural keywords from the syllabus.
  - `alternates: { canonical: "/claude-quiz" }`
  - `openGraph` + `twitter` (mirror `/quiz` for consistency).
  - `keywords` from the syllabus.
- **JSON-LD** via `<script type="application/ld+json">` (`@type: "Quiz"` or
  `"LearningResource"`, `inLanguage: "es"`, `educationalLevel: "University"`,
  `numberOfQuestions: CLAUDE_QUIZ_QUESTIONS.length`). If `/quiz` already factored a
  reusable JSON-LD helper, reuse it.
- Render an `<h1>` + intro paragraph **in the server component** (indexable content),
  with the interactive client component below it.

### 4.2 `src/components/claude-quiz/ClaudeQuiz.tsx` — `'use client'`
Port the UX from the prototype (behavior described below) to React + Tailwind/stone
with dark mode. It must have:
- Topic filter (chips): All + the 5 topics, with a per-topic count.
- One card per question: number, topic label, type badge (True/False or Multiple
  choice), statement, options as A/B/C/D buttons.
- **Immediate grading**: on selection, disable options, mark correct (emerald) and
  wrong (red), and show the explanation block with a ✓/✗ verdict.
- Progress bar + `answered` and `correct` counters.
- **Shuffle** (Fisher–Yates) and **Reset** buttons.
- Final summary (score, %, message) once all are answered.
- **Optional persistence** via `PrefsContext.rememberWork`, like `/quiz` (save
  answers/state to survive reload). If `/quiz` does it, mirror it; if you want it
  simple, keep it ephemeral in v1 (confirm §9).
- Accessibility: `aria-pressed` on chips, visible focus, `aria-live` on the score,
  `motion-reduce:` on transitions.
- Chrome via `t()`; statements/explanations from `CLAUDE_QUIZ_QUESTIONS`.

**Prototype behavior reference** (single-file HTML built earlier — reproduce this
interaction model, not its raw CSS): chips filter the visible cards; clicking an
option locks the card, colors correct/incorrect, and reveals the explanation; the
score bar tracks answered/correct; Shuffle reorders via Fisher–Yates; Reset clears all
answers; when every question is answered a summary panel shows score, percentage, and
a message (≥85% "great", ≥60% "ok", else "review").

---

## 5) Link from `/quiz` → `/claude-quiz` (core requirement)

In **`src/app/quiz/page.tsx`** (the existing exam), add a section/card that links to
`/claude-quiz`, presented as **another theory exam**. Example copy:
> *"Want more practice? Try another theory exam: **Estabilidad — Teoría (1.º parcial)**,
> 42 questions, True/False + multiple choice." → `/claude-quiz`*

- Use `next/link`, classes consistent with the page.
- Text via `t()` (new keys, §6).
- Place it where it won't disrupt the exam flow (e.g. at the bottom near the
  score/summary, or under an "Other exams" heading).

**Optional (if the user wants `/quiz` to become a hub):** refactor `/quiz` to list
exams as an array `[{href, titleKey, descKey, count, tag}]` so both the V/F exam and
`/claude-quiz` appear as items. That's a larger change on an unmerged branch —
**confirm first** (§9). By default, just add the link.

**Global nav:** the header link to `/quiz` already exists (added by the prior work).
No second global link to `/claude-quiz` is needed; users enter it from `/quiz`. If one
is wanted anyway, add it in the header using the same pattern as `/learn` and `/quiz`.

---

## 6) i18n — new keys (EN **and** ES)

Add to the `EN` object and its `ES` mirror in `LanguageContext.tsx` (the `EN` keys
define the `TranslationKey` union). Reuse any `/quiz` keys that already exist (e.g.
`quiz.shuffle`, `quiz.reset`) if applicable; create the missing ones with a distinct
prefix so nothing is overwritten:

```
"claudeQuiz.link"              EN "Estabilidad theory"     ES "Teoría de Estabilidad"
"claudeQuiz.title"             ...
"claudeQuiz.intro"             ...
"claudeQuiz.back"              EN "← Back to /quiz"         ES "← Volver a /quiz"
"claudeQuiz.filter.all"        EN "All"                     ES "Todos"
"claudeQuiz.topic.fuerzas"     EN "Force systems"           ES "Sistemas de fuerzas"
"claudeQuiz.topic.vinculos"    EN "Supports & DOF"          ES "Vínculos y GDL"
"claudeQuiz.topic.cadenas"     EN "Kinematic chains"        ES "Cadenas cinemáticas"
"claudeQuiz.topic.reticulados" EN "Trusses"                 ES "Reticulados"
"claudeQuiz.topic.inercia"     EN "Inertia / sections"      ES "Inercia / superficies"
"claudeQuiz.type.vf"           EN "True / False"            ES "Verdadero / Falso"
"claudeQuiz.type.mc"           EN "Multiple choice"         ES "Opción múltiple"
"claudeQuiz.answered"          EN "answered"                ES "respondidas"
"claudeQuiz.correct"           EN "correct"                 ES "correctas"
"claudeQuiz.verdict.ok"        EN "Correct"                 ES "Correcto"
"claudeQuiz.verdict.no"        EN "Incorrect"               ES "Incorrecto"
"claudeQuiz.shuffle"           EN "Shuffle"                 ES "Mezclar"
"claudeQuiz.reset"             EN "Reset"                   ES "Reiniciar"
"claudeQuiz.result.great"      EN "Solid — ready for the theory part."  ES "Muy sólido. Estás listo para la parte teórica."
"claudeQuiz.result.ok"         EN "On track — review the misses and retry."  ES "Bien encaminado. Repasá las que fallaste y reintentá."
"claudeQuiz.result.low"        EN "Review the weak topics and retry."  ES "Repasá los temas flojos y reintentá."
// link from /quiz:
"quiz.more.title"              EN "More theory exams"       ES "Más exámenes teóricos"
"quiz.more.claude"             EN "Estabilidad — Theory (1st partial), 42 Q"  ES "Estabilidad — Teoría (1.º parcial), 42 preguntas"
```

The topic labels in `claudeQuizData.ts` (`CLAUDE_QUIZ_TOPICS`) are a fallback; the
source of truth is `t()` in the component (so it follows the selected language).

---

## 7) Tests (keep green + add coverage)

- **lib project (node):** `src/lib/__tests__/claudeQuiz.test.ts` — validate the data
  (`correct` in range, `options.length ≥ 2`, unique `id`s, valid `topic`s) and, if
  there are helpers in `claudeQuiz.ts`, test score/filter/shuffle. TDD: red test →
  implementation → green.
- **components project (jsdom):** `src/components/__tests__/ClaudeQuiz.test.tsx` with
  `@testing-library/react`, wrapping the render in `<LanguageProvider>` (and
  `PrefsProvider` if persistence is used). Cover: questions render; clicking the
  correct option shows ✓ and increments the correct counter; clicking a wrong option
  shows ✗ and marks the correct one; topic filter reduces the number of cards; reset
  clears answers.

Close with:
```bash
npm test && npm run build && npx tsc --noEmit && npm run lint
```
The solver suite (33 checks) must stay untouched.

---

## 8) Cross-cutting SEO (only what `/quiz` hasn't already added)

Check whether the `/quiz` branch already added these; if not, add them:
- `layout.tsx`: `metadataBase: new URL("https://<prod-domain>")` for absolute
  OG/canonical URLs.
- `src/app/sitemap.ts`: include `/`, `/learn`, `/quiz`, `/claude-quiz`.
- `src/app/robots.ts`: allow-all + sitemap reference.
If `/quiz` already created them, **just add the `/claude-quiz` entry** to the sitemap.

---

## 9) Confirm before merging
1. **`/quiz` branch/PR name** to base this feature on.
2. **Engine:** parallel feature (recommended) vs. generalizing the `/quiz` engine.
3. **Bilingual:** `/claude-quiz` data ES-only (default) or `{en, es}` like `/quiz`?
4. **`/quiz` as a hub:** just add the link (default) or turn it into an exam index?
5. **Persistence** via `rememberWork`: mirror `/quiz` (recommended) or ephemeral v1?
6. **Production domain** for `metadataBase`/sitemap (if not set yet).

---

## 10) Work order (small commits on `feat/claude-quiz`)
1. `feat: claude-quiz data module (src/lib/claudeQuizData.ts)` + data test (TDD).
2. `feat: /claude-quiz page (server metadata + JSON-LD) + client component`.
3. `feat: link from /quiz to /claude-quiz (another theory exam)`.
4. `feat: i18n keys (EN+ES)`.
5. `test: ClaudeQuiz render/interaction`.
6. `chore: sitemap/robots entry for /claude-quiz` (if applicable).
7. Final verification + PR (targeting the `/quiz` branch or `main`, per decision §9).

### Definition of done
- `/claude-quiz` works (topic filter, immediate grading, explanations, progress,
  shuffle, reset, summary), Tailwind/stone + dark mode, i18n chrome.
- `/quiz` shows and links `/claude-quiz` as another theory exam.
- No collisions with the existing `/quiz` files.
- Per-route SEO (metadata + JSON-LD) + sitemap entry; consistent with `/quiz`.
- `npm test` / `build` / `tsc` / `lint` green; solver untouched.

---

## 11) Question bank — copy verbatim into `src/lib/claudeQuizData.ts`

> Content is Spanish on purpose (Spanish-language course). To go bilingual later,
> change `statement`/`explanation` to `{ es: string; en: string }` and resolve by
> language in the component.

```ts
// Theory question bank for the "Estabilidad" (Ing. Eléctrica, UTN FRBA)
// first-partial theory quiz. Content is Spanish — exam-prep material for a
// Spanish-language course. UI chrome is translated via LanguageContext; the
// academic statements/explanations intentionally stay in ES.

export type ClaudeQuizTopic =
  | "fuerzas"
  | "vinculos"
  | "cadenas"
  | "reticulados"
  | "inercia";

export type ClaudeQuizType = "vf" | "mc";

export interface ClaudeQuizQuestion {
  /** Stable id — used as React key and for future score persistence. */
  id: string;
  topic: ClaudeQuizTopic;
  type: ClaudeQuizType;
  statement: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  correct: number;
  explanation: string;
}

/** Display labels per topic. Keep in sync with the i18n keys `claudeQuiz.topic.*`. */
export const CLAUDE_QUIZ_TOPICS: Record<ClaudeQuizTopic, string> = {
  fuerzas: "Sistemas de fuerzas",
  vinculos: "Vínculos y GDL",
  cadenas: "Cadenas cinemáticas",
  reticulados: "Reticulados",
  inercia: "Inercia / superficies",
};

export const CLAUDE_QUIZ_QUESTIONS: ClaudeQuizQuestion[] = [
  // ── Sistemas de fuerzas ────────────────────────────────────────────────
  {
    id: "f1",
    topic: "fuerzas",
    type: "vf",
    statement:
      "El momento de una fuerza respecto de un punto es un vector perpendicular al plano que forman la fuerza y ese punto.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "El momento se define como M = r × F, producto vectorial cuyo resultado es perpendicular al plano determinado por r (posición) y F.",
  },
  {
    id: "f2",
    topic: "fuerzas",
    type: "vf",
    statement: "Una cupla puede equilibrarse mediante una única fuerza.",
    options: ["Verdadero", "Falso"],
    correct: 1,
    explanation:
      "Una cupla (par de fuerzas iguales, opuestas y no colineales) tiene resultante nula pero momento no nulo. Solo puede equilibrarse con otra cupla de igual módulo y sentido contrario; nunca con una sola fuerza.",
  },
  {
    id: "f3",
    topic: "fuerzas",
    type: "mc",
    statement:
      "Al trasladar una fuerza a un punto que NO está sobre su recta de acción, para conservar la equivalencia se debe agregar:",
    options: [
      "Una cupla (momento) de traslación",
      "Otra fuerza igual y opuesta",
      "Nada, la traslación es siempre libre",
      "Una reacción de vínculo",
    ],
    correct: 0,
    explanation:
      "Trasladar la fuerza fuera de su recta cambia el momento; para compensar se añade una cupla igual al momento de la fuerza respecto del nuevo punto. Es el fundamento de la reducción a un punto.",
  },
  {
    id: "f4",
    topic: "fuerzas",
    type: "vf",
    statement:
      "El momento de una cupla es independiente del punto respecto del cual se lo calcule.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "El momento de una cupla es un vector libre: vale F·d (fuerza por brazo) sea cual sea el punto elegido para tomar momentos.",
  },
  {
    id: "f5",
    topic: "fuerzas",
    type: "mc",
    statement: "Los invariantes de un sistema de fuerzas en el espacio son:",
    options: [
      "La resultante R y la proyección del momento sobre R (R·M)",
      "La resultante R y el punto de aplicación",
      "El momento respecto de cualquier punto, siempre igual",
      "La suma de los módulos de las fuerzas",
    ],
    correct: 0,
    explanation:
      "Invariante vectorial: la resultante R. Invariante escalar: el producto R·M (proyección del momento sobre la dirección de R), que no cambia al variar el centro de reducción.",
  },
  {
    id: "f6",
    topic: "fuerzas",
    type: "vf",
    statement:
      "El eje central de un sistema de fuerzas es el lugar geométrico de los puntos donde el momento resultante es mínimo (paralelo a la resultante).",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Sobre el eje central el momento tiene módulo mínimo y su dirección coincide con la de la resultante; el sistema queda reducido a un torsor (fuerza + cupla colineal).",
  },
  {
    id: "f7",
    topic: "fuerzas",
    type: "vf",
    statement:
      "Dos sistemas de fuerzas son equivalentes si tienen igual resultante e igual momento resultante respecto de un mismo punto.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Esa es justamente la definición de equivalencia: mismo vector resultante y mismo momento respecto de un punto (y por lo tanto respecto de cualquier punto).",
  },
  {
    id: "f8",
    topic: "fuerzas",
    type: "vf",
    statement:
      "El teorema de Varignon dice que el momento de la resultante respecto de un punto es igual a la suma de los momentos de cada fuerza componente respecto del mismo punto.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Válido para sistemas con resultante (fuerzas concurrentes o reducibles a una única fuerza). Es una herramienta central para ubicar la recta de acción de la resultante.",
  },
  {
    id: "f9",
    topic: "fuerzas",
    type: "vf",
    statement:
      "El principio de transmisibilidad permite deslizar una fuerza a lo largo de su recta de acción sin alterar su efecto sobre el cuerpo rígido.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "En el cuerpo rígido, correr la fuerza sobre su propia recta no cambia ni la resultante ni el momento. (Ojo: sí cambia el efecto interno/deformación en cuerpos deformables.)",
  },

  // ── Vínculos y grados de libertad ──────────────────────────────────────
  {
    id: "v1",
    topic: "vinculos",
    type: "vf",
    statement: "Una chapa rígida en el plano posee tres grados de libertad.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "En el plano: dos traslaciones (x, y) y una rotación → 3 GDL. En el espacio serían 6.",
  },
  {
    id: "v2",
    topic: "vinculos",
    type: "mc",
    statement:
      "Un apoyo móvil (vínculo de primera especie) en el plano restringe:",
    options: [
      "1 grado de libertad (una reacción)",
      "2 grados de libertad",
      "3 grados de libertad",
      "Ninguno",
    ],
    correct: 0,
    explanation:
      "El apoyo móvil impide el desplazamiento en una sola dirección → 1 reacción, 1 GDL restringido. Permite deslizar y rotar.",
  },
  {
    id: "v3",
    topic: "vinculos",
    type: "mc",
    statement: "Un apoyo fijo o articulación (segunda especie) restringe:",
    options: [
      "2 grados de libertad",
      "1 grado de libertad",
      "3 grados de libertad",
      "4 grados de libertad",
    ],
    correct: 0,
    explanation:
      "La articulación impide ambos desplazamientos (x e y) pero permite el giro → 2 reacciones, 2 GDL restringidos.",
  },
  {
    id: "v4",
    topic: "vinculos",
    type: "mc",
    statement: "Un empotramiento (tercera especie) restringe:",
    options: [
      "3 grados de libertad",
      "2 grados de libertad",
      "1 grado de libertad",
      "Depende de la carga",
    ],
    correct: 0,
    explanation:
      "El empotramiento impide las dos traslaciones y la rotación → 3 reacciones (2 fuerzas + 1 momento), 3 GDL restringidos.",
  },
  {
    id: "v5",
    topic: "vinculos",
    type: "vf",
    statement:
      "Para que una chapa esté isostáticamente sustentada en el plano se requieren exactamente 3 condiciones de vínculo, bien dispuestas.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "3 GDL de la chapa = 3 condiciones de vínculo. Si son menos → hipostático (móvil); si son más → hiperestático; si están mal dispuestas → vínculo aparente.",
  },
  {
    id: "v6",
    topic: "vinculos",
    type: "vf",
    statement:
      "Tres apoyos móviles cuyas direcciones (rectas de acción de las reacciones) concurren en un mismo punto sustentan isostáticamente a la chapa.",
    options: ["Verdadero", "Falso"],
    correct: 1,
    explanation:
      "Falso: es un vínculo aparente. Aunque hay 3 condiciones, la chapa puede rotar instantáneamente alrededor del punto de concurrencia. El sistema es inestable (críticamente hipostático).",
  },
  {
    id: "v7",
    topic: "vinculos",
    type: "vf",
    statement:
      "Tres bielas paralelas constituyen una sustentación isostática válida de una chapa.",
    options: ["Verdadero", "Falso"],
    correct: 1,
    explanation:
      "Falso: las reacciones paralelas concurren 'en el infinito', dejando libre el desplazamiento perpendicular a ellas. Es otro caso de vínculo aparente → sistema inestable.",
  },
  {
    id: "v8",
    topic: "vinculos",
    type: "mc",
    statement: "Se produce un vínculo aparente cuando:",
    options: [
      "El número de condiciones es suficiente pero están mal dispuestas y permiten un movimiento",
      "Faltan condiciones de vínculo",
      "Sobran condiciones de vínculo",
      "La carga es excesiva",
    ],
    correct: 0,
    explanation:
      "El conteo da bien (p. ej. 3 en el plano) pero la disposición geométrica (reacciones concurrentes o paralelas) deja un grado de libertad libre. Numéricamente parece isostático, cinemáticamente es inestable.",
  },
  {
    id: "v9",
    topic: "vinculos",
    type: "vf",
    statement:
      "En el plano se dispone de tres ecuaciones independientes de equilibrio de la estática.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "ΣFx = 0, ΣFy = 0 y ΣM = 0. Tres ecuaciones ⇒ se pueden despejar hasta tres incógnitas (reacciones) en un problema isostático plano.",
  },

  // ── Cadenas cinemáticas ────────────────────────────────────────────────
  {
    id: "c1",
    topic: "cadenas",
    type: "vf",
    statement:
      "Una articulación relativa (vínculo interno de segunda especie) entre dos chapas restringe dos grados de libertad.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "La articulación intermedia impide el desplazamiento relativo en x e y entre las chapas, pero permite el giro relativo → restringe 2 GDL.",
  },
  {
    id: "c2",
    topic: "cadenas",
    type: "mc",
    statement: "Una cadena cinemática abierta de dos chapas posee:",
    options: [
      "4 grados de libertad",
      "3 grados de libertad",
      "6 grados de libertad",
      "2 grados de libertad",
    ],
    correct: 0,
    explanation:
      "Dos chapas sueltas: 3 + 3 = 6 GDL. Una articulación relativa quita 2 → 6 − 2 = 4 GDL. Por eso hacen falta 4 condiciones de vínculo externas para fijarla.",
  },
  {
    id: "c3",
    topic: "cadenas",
    type: "vf",
    statement:
      "Para fijar a tierra una cadena abierta de dos chapas se necesitan cuatro condiciones de vínculo externas.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Como la cadena tiene 4 GDL, se requieren 4 condiciones externas bien dispuestas para lograr sustentación isostática.",
  },
  {
    id: "c4",
    topic: "cadenas",
    type: "mc",
    statement:
      "Los grados de libertad de una cadena abierta de n chapas articuladas en serie valen:",
    options: ["n + 2", "3n", "2n − 1", "n − 2"],
    correct: 0,
    explanation:
      "3n GDL de las chapas menos 2(n−1) por las (n−1) articulaciones: 3n − 2(n−1) = n + 2. Chequeo: n = 2 → 4 ✔.",
  },
  {
    id: "c5",
    topic: "cadenas",
    type: "vf",
    statement:
      "Una cadena cerrada de tres chapas con tres articulaciones relativas no alineadas equivale a una única chapa rígida.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "El triángulo articulado (tres chapas, tres articulaciones no colineales) es indeformable: se comporta como una sola chapa de 3 GDL. Es la base del reticulado triangulado.",
  },
  {
    id: "c6",
    topic: "cadenas",
    type: "vf",
    statement:
      "En las cadenas cinemáticas pueden aparecer vínculos aparentes internos, no solo externos.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Sí: por ejemplo, tres articulaciones relativas alineadas entre chapas dan un vínculo aparente interno que permite un movimiento (rotación instantánea) aunque el conteo cierre.",
  },

  // ── Reticulados ────────────────────────────────────────────────────────
  {
    id: "r1",
    topic: "reticulados",
    type: "vf",
    statement:
      "En un reticulado ideal las barras trabajan únicamente a esfuerzo axil (tracción o compresión).",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Hipótesis del reticulado ideal: nudos articulados sin rozamiento, barras rectas y cargas solo en nudos ⇒ no hay flexión ni corte, solo esfuerzo normal (axil).",
  },
  {
    id: "r2",
    topic: "reticulados",
    type: "vf",
    statement:
      "En el modelo ideal de reticulado las cargas exteriores se suponen aplicadas exclusivamente en los nudos.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Si una carga actuara sobre una barra entre nudos, esa barra sufriría flexión y se rompería la hipótesis de esfuerzo puramente axil.",
  },
  {
    id: "r3",
    topic: "reticulados",
    type: "mc",
    statement:
      "La condición de isostaticidad (interna + externa) de un reticulado plano es, con b barras, v reacciones y n nudos:",
    options: ["b + v = 2n", "b + v = 3n", "b = 2n − v²", "b + n = 2v"],
    correct: 0,
    explanation:
      "Cada nudo aporta 2 ecuaciones (2n en total). Las incógnitas son los esfuerzos en las b barras más las v reacciones. Isostático ⇒ b + v = 2n (sin vínculos aparentes).",
  },
  {
    id: "r4",
    topic: "reticulados",
    type: "mc",
    statement:
      "Si en un reticulado plano (sin vínculos aparentes) se cumple b + v > 2n, el reticulado es:",
    options: ["Hiperestático", "Isostático", "Hipostático", "Un mecanismo"],
    correct: 0,
    explanation:
      "Hay más incógnitas que ecuaciones: el grado de hiperestaticidad es GH = (b + v) − 2n. Requiere ecuaciones de compatibilidad además de las de equilibrio.",
  },
  {
    id: "r5",
    topic: "reticulados",
    type: "mc",
    statement: "Si b + v < 2n, el reticulado es:",
    options: [
      "Hipostático / inestable (mecanismo)",
      "Hiperestático",
      "Isostático",
      "Rígido",
    ],
    correct: 0,
    explanation:
      "Faltan barras o vínculos: hay más ecuaciones que incógnitas y la estructura tiene grados de libertad libres ⇒ se comporta como un mecanismo (colapsa).",
  },
  {
    id: "r6",
    topic: "reticulados",
    type: "vf",
    statement:
      "El método de los nudos plantea el equilibrio de un sistema de fuerzas concurrentes en cada nudo, aportando dos ecuaciones por nudo.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "En cada nudo concurren las barras y las cargas: ΣFx = 0 y ΣFy = 0 (dos ecuaciones). Conviene empezar por nudos con solo dos barras incógnita.",
  },
  {
    id: "r7",
    topic: "reticulados",
    type: "vf",
    statement:
      "El método de Ritter (secciones) permite hallar el esfuerzo de una barra cortando la estructura por a lo sumo tres barras no concurrentes, sin resolver todo el reticulado.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Se hace un corte que atraviese la barra buscada y como máximo tres barras no concurrentes; tomando momentos en el punto de cruce de las otras dos se despeja directamente el esfuerzo deseado.",
  },
  {
    id: "r8",
    topic: "reticulados",
    type: "mc",
    statement:
      "En un nudo donde concurren solo dos barras no colineales y NO hay fuerza exterior aplicada, los esfuerzos en ambas barras son:",
    options: [
      "Nulos (ambas barras son barras nulas)",
      "Iguales y de tracción",
      "Iguales y de compresión",
      "Imposibles de determinar",
    ],
    correct: 0,
    explanation:
      "Regla de barras nulas: dos barras no colineales sin carga en el nudo ⇒ el equilibrio exige que ambas tengan esfuerzo cero.",
  },
  {
    id: "r9",
    topic: "reticulados",
    type: "vf",
    statement:
      "En un nudo con tres barras, dos colineales entre sí y una tercera no colineal, sin carga exterior, la barra no colineal es una barra nula.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Proyectando en la dirección perpendicular a las dos colineales, la única componente proviene de la tercera barra; para equilibrar debe valer cero ⇒ barra nula.",
  },
  {
    id: "r10",
    topic: "reticulados",
    type: "vf",
    statement:
      "Un reticulado triangulado simple se genera a partir de un triángulo base agregando, cada vez, un nudo vinculado mediante dos nuevas barras no colineales.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Ese procedimiento generativo garantiza que el reticulado sea internamente isostático y rígido (se mantiene b = 2n − 3 para la parte interna).",
  },

  // ── Inercia / características geométricas de superficies ────────────────
  {
    id: "i1",
    topic: "inercia",
    type: "vf",
    statement:
      "El momento estático (de primer orden) de una superficie respecto de un eje baricéntrico es nulo.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Por definición del baricentro, Sx = ∫y dA = 0 cuando el eje pasa por el centro de gravedad. Esta propiedad se usa para ubicar el baricentro.",
  },
  {
    id: "i2",
    topic: "inercia",
    type: "mc",
    statement:
      "El teorema de Steiner (ejes paralelos) establece que el momento de inercia respecto de un eje cualquiera vale:",
    options: [
      "I = I_G + A·d²",
      "I = I_G − A·d²",
      "I = I_G + A·d",
      "I = I_G · d²",
    ],
    correct: 0,
    explanation:
      "I_G es el momento de inercia baricéntrico, A el área y d la distancia entre el eje considerado y el eje baricéntrico paralelo. El término A·d² siempre suma.",
  },
  {
    id: "i3",
    topic: "inercia",
    type: "vf",
    statement:
      "El momento de inercia de una superficie es siempre positivo, mientras que el producto de inercia puede ser positivo, negativo o nulo.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "I = ∫y²dA integra un cuadrado ⇒ siempre positivo. El producto Ixy = ∫xy dA depende de los signos de las coordenadas, por lo que puede tener cualquier signo o anularse.",
  },
  {
    id: "i4",
    topic: "inercia",
    type: "vf",
    statement:
      "El producto de inercia respecto de un par de ejes de los cuales al menos uno es eje de simetría de la figura es nulo.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "La simetría hace que a cada elemento dA con producto +xy le corresponda otro con −xy, cancelándose la integral ⇒ Ixy = 0. Por eso los ejes de simetría son ejes principales.",
  },
  {
    id: "i5",
    topic: "inercia",
    type: "mc",
    statement: "El radio de giro respecto de un eje se define como:",
    options: ["i = √(I / A)", "i = I / A", "i = I · A", "i = √(A / I)"],
    correct: 0,
    explanation:
      "i = √(I/A). Representa la distancia a la que habría que concentrar toda el área para obtener el mismo momento de inercia. Tiene unidades de longitud.",
  },
  {
    id: "i6",
    topic: "inercia",
    type: "vf",
    statement:
      "Los ejes principales de inercia son aquellos para los cuales el producto de inercia se anula y los momentos de inercia toman valores extremos (máximo y mínimo).",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Al rotar los ejes, existe una orientación donde Ixy = 0; para esos ejes principales I adopta su valor máximo y mínimo. Se visualiza con el círculo de Mohr de inercia.",
  },
  {
    id: "i7",
    topic: "inercia",
    type: "mc",
    statement:
      "Las unidades del momento de inercia de una superficie (segundo momento de área) son:",
    options: [
      "Longitud a la cuarta (p. ej. cm⁴)",
      "Longitud al cubo (cm³)",
      "Longitud al cuadrado (cm²)",
      "Fuerza por longitud",
    ],
    correct: 0,
    explanation:
      "I = ∫distancia²·dA = [longitud²]·[longitud²] = longitud⁴. El momento estático, en cambio, tiene unidades de longitud³.",
  },
  {
    id: "i8",
    topic: "inercia",
    type: "vf",
    statement:
      "El momento de inercia polar respecto de un punto es igual a la suma de los momentos de inercia respecto de dos ejes ortogonales que pasan por ese punto.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "Teorema de los ejes perpendiculares: Ip = Ix + Iy, ya que r² = x² + y² para cada elemento de área.",
  },
  {
    id: "i9",
    topic: "inercia",
    type: "vf",
    statement:
      "El baricentro de una superficie compuesta se obtiene como el promedio de los baricentros de las partes ponderado por sus áreas.",
    options: ["Verdadero", "Falso"],
    correct: 0,
    explanation:
      "x_G = Σ(Aᵢ·xᵢ)/ΣAᵢ y análogamente y_G. Las áreas de huecos se toman como negativas.",
  },
];
```
