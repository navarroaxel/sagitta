# Plan: Add a `/quiz` True/False exam to sagitta

## Objective

Add an interactive True/False self-assessment on statics (force-system
reduction, supports/constraints, kinematic chains, N/Q/M diagrams, trusses)
as a new `/quiz` route, following sagitta's existing conventions. It is a
sibling learning feature to `/learn`.

## Before writing any code

- Read `CLAUDE.md` and `AGENTS.md` in the repo and follow whatever they specify.
- Inspect how the current routes (`/` and `/learn`) declare page metadata/SEO
  and how the header link to `/learn` is wired, so you can replicate the exact
  same pattern for `/quiz`. The `/learn` link lives in the **header**.

## Constraints and style

- Next.js 16 App Router. The interactive surface is a client component
  (`'use client'`), TypeScript strict.
- Tailwind CSS v4, with dark mode handled the same way as the rest of the app.
- i18n via `LanguageContext` (`t()`, `TranslationKey`). UI chrome uses `t()`;
  each question's statement is stored bilingually (`en`/`es`) in the data.
- Persistence following the `PrefsContext` ("remember my work") pattern: store
  the user's answers and whether the exam was already graded, so they survive
  a reload when the preference is enabled.
- Respect `.prettierrc` and `eslint.config.mjs`.
- Do **not** touch the solver math or any file marked "do not edit math"
  (`lib/solver.ts`, `lib/sampling.ts`, etc.).

## Methodology — TDD

For all pure logic, write the failing test first, then the minimal
implementation to make it pass, then refactor. This applies especially to
`gradeQuiz`. Build the UI only after the pure logic is green; write the
component tests (jsdom) last.

## SEO

Because the page is a client component, `metadata` cannot be exported from the
same file that carries `'use client'`. Follow whatever pattern the repo already
uses — e.g. a per-route `layout.tsx` (server) that exports `metadata` and
renders the client component, or a thin server wrapper. Replicate that approach
for `/quiz`. Target metadata:

- `title`: `"Examen V/F — Estática | Frame Diagram Simulator"` (or match the
  root `title` template if one exists).
- `description`: `"Autoevaluación de verdadero/falso sobre reducción de sistemas de fuerzas, vínculos, cadenas cinemáticas, diagramas N/Q/M y reticulados."`
- Include `openGraph` (title/description) if the other routes do.

## Files to create

### 1. `src/lib/quiz.ts` — types + pure, testable logic

```ts
export type QuizQuestion = {
  id: number;
  statement: { en: string; es: string };
  answer: boolean;
  explanation: { en: string; es: string };
};

export type QuizAnswer = boolean | null;

export type GradeResult = {
  correct: number;
  total: number;
  perQuestion: ('correct' | 'incorrect' | 'unanswered')[];
};

export function gradeQuiz(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
): GradeResult;
```

`gradeQuiz` must be pure (no React). `perQuestion[i]` is `'unanswered'` when
`answers[i]` is `null`, `'correct'` when it equals `questions[i].answer`, else
`'incorrect'`. `correct` counts only `'correct'` entries; `total` is
`questions.length`.

### 2. `src/lib/quizData.ts` — the 20 questions

Export `const quizQuestions: QuizQuestion[]`. The statements below are in
**Spanish** and must be kept verbatim; translate each `en` field preserving the
technical meaning. The abbreviated source array (`es` + `answer` + `exp`) must
be expanded into the full `QuizQuestion` shape.

```ts
// Source content — expand each entry to the QuizQuestion type.
// `es` -> statement.es, `exp` -> explanation.es, translate to statement.en / explanation.en.
const source = [
  { id: 1,  answer: false, es: "En hipótesis de cuerpos rígidos, las cargas puntuales pueden considerarse vectores libres a efectos de resolver reacciones de vínculos.", exp: "Bajo rígido son vectores deslizantes, no libres; moverlas a una recta paralela cambia el momento." },
  { id: 2,  answer: true,  es: "La Resultante de Reducción de un Sistema de Fuerzas no depende del Centro de Reducción.", exp: "R = ΣF es el invariante vectorial; solo el momento de reducción depende del centro." },
  { id: 3,  answer: true,  es: "El Invariante Escalar de un Sistema de Fuerzas Plano es siempre nulo.", exp: "Es R·M; en el plano R está en el plano y M es perpendicular, así que R·M = 0." },
  { id: 4,  answer: false, es: "El Momento de Reducción de un Sistema de Fuerzas se denomina Invariante Vectorial.", exp: "El invariante vectorial es la Resultante; el momento depende del centro." },
  { id: 5,  answer: true,  es: "Para fijar un punto en el espacio es necesario restringir el desplazamiento en tres direcciones no coplanares.", exp: "Un punto en el espacio tiene 3 GL de traslación." },
  { id: 6,  answer: false, es: "Para fijar una chapa plana es condición necesaria y suficiente aplicar tres vínculos de primera especie.", exp: "Necesaria pero no suficiente: no deben ser concurrentes ni paralelos." },
  { id: 7,  answer: true,  es: "Cualquier cadena cinemática de dos chapas sustentada por dos apoyos fijos no alineados con la articulación será isostática.", exp: "Arco de tres articulaciones; isostático mientras las tres rótulas no estén alineadas." },
  { id: 8,  answer: false, es: "Cualquier cadena cinemática de dos chapas, una empotrada y sobre la otra un vínculo de primera especie, será siempre isostática.", exp: "El 'siempre' falla: si la recta del vínculo pasa por la articulación, la 2da chapa gira." },
  { id: 9,  answer: false, es: "Una cupla aplicada en el tramo de una carga distribuida generará un quiebre en el diagrama de Momento Flector.", exp: "Una cupla genera un salto, no un quiebre." },
  { id: 10, answer: true,  es: "Una fuerza puntual en el tramo de una carga distribuida generará un salto en el diagrama de Esfuerzo de Corte.", exp: "Toda fuerza puntual produce un salto en Q." },
  { id: 11, answer: false, es: "Si a un nudo con carga exterior convergen tres barras y una está alineada con la carga, las otras dos no trabajan.", exp: "No es general; si las otras dos son colineales toman esfuerzos iguales no nulos." },
  { id: 12, answer: true,  es: "Si a un nudo sin carga exterior convergen dos barras no alineadas, estas no toman esfuerzo.", exp: "El equilibrio en cada dirección obliga a que ambas sean nulas." },
  { id: 13, answer: true,  es: "Si a un nudo con carga exterior convergen dos barras y una está alineada con la carga, la otra barra no toma esfuerzo.", exp: "Nada equilibra la componente perpendicular, así que la otra es nula." },
  { id: 14, answer: false, es: "Una chapa en el espacio posee 9 grados de libertad.", exp: "Tiene 6 GL (3 traslaciones + 3 rotaciones)." },
  { id: 15, answer: true,  es: "Para fijar un punto a tierra en un sistema plano basta restringir la traslación en dos direcciones.", exp: "Un punto en el plano tiene 2 GL; no hay rotación que impedir." },
  { id: 16, answer: false, es: "El momento de una fuerza respecto de un punto no varía si se modifica la distancia entre la recta de acción y dicho punto.", exp: "M = F·d; si cambia d, cambia M." },
  { id: 17, answer: false, es: "Las barras de un reticulado deben tener extremos articulados, eje recto y las cargas aplicadas en la mitad de su luz.", exp: "Las cargas van en los nudos, no en la mitad de la luz." },
  { id: 18, answer: true,  es: "Con carga uniforme sobre una barra, el diagrama de esfuerzo de corte varía en forma lineal.", exp: "dV/dx = −q = cte → Q lineal, M parabólico." },
  { id: 19, answer: false, es: "Una fuerza puntual produce un salto en el diagrama de momento flexor en el punto de aplicación.", exp: "Produce un quiebre en M (y un salto en Q); el salto en M lo da una cupla." },
  { id: 20, answer: true,  es: "Si un pórtico plano está en equilibrio, se debe verificar el equilibrio interno de cada uno de sus nodos.", exp: "Todo cuerpo libre aislado, incluido cada nudo, debe estar en equilibrio." },
];
```

### 3. `src/app/quiz/page.tsx`

`'use client'`, hosts the exam. Keep server-side metadata in the sibling
`layout.tsx` (or wrapper) per the SEO section.

### 4. `src/components/quiz/`

- `QuizView.tsx` — orchestrates state (`answers`, `corrected`), the
  Corregir/Reiniciar buttons, and the score bar. Wires persistence through
  `PrefsContext`.
- `QuestionCard.tsx` — statement + True/False buttons. After grading, shows a
  status border and badge (green = correct, red = incorrect, amber =
  unanswered), reveals the correct answer, and shows the `explanation`. Reuse
  the color/dark-mode tokens already used elsewhere in the app.
- `ScoreBar.tsx` — renders `"Puntaje: X / 20"` (via `t()`).

## i18n

Add the new UI keys in both EN and ES, extending `TranslationKey`:
`quiz.title`, `quiz.check`, `quiz.reset`, `quiz.score`, `quiz.correct`,
`quiz.incorrect`, `quiz.unanswered`, `quiz.correctAnswer`, `quiz.true`,
`quiz.false`.

## Navigation

Add a `/quiz` link in the **header**, next to the existing `/learn` link, using
`t()` for the label.

## Tests (Jest — follow the existing two-project setup)

- `src/lib/__tests__/quiz.test.ts` — `gradeQuiz`: all correct, mixed,
  unanswered; assert `perQuestion` and the counts. (Write these first — TDD.)
- `src/components/__tests__/QuestionCard.test.tsx` (jsdom) — selecting True/False
  marks the option selected; after grading it shows correct/incorrect status and
  reveals the explanation.

## Acceptance criteria / commands

- `npm run lint` — no errors.
- `npm test` — green, including the new suites.
- `npm run build` — `/quiz` is statically prerendered (no API routes, no server
  state).
- Works in EN/ES and dark mode; score/answers survive a reload when
  "remember my work" is on.
- `/quiz` link visible in the header alongside `/learn`.

## Suggested order of work

1. `lib/quiz.ts` + `quiz.test.ts` (red → green → refactor).
2. `lib/quizData.ts` (fill the 20, translate `en`).
3. UI: `QuizView`, `QuestionCard`, `ScoreBar`, `app/quiz/page.tsx`.
4. SEO wrapper/layout + i18n keys + header link.
5. Component tests, then `lint` / `test` / `build`.
