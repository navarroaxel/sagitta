import type { Metadata } from "next";
import { CLAUDE_QUIZ_QUESTIONS } from "@/lib/claudeQuizData";
import { ClaudeQuiz } from "@/components/claude-quiz/ClaudeQuiz";
import { ClaudeQuizHeader } from "@/components/claude-quiz/ClaudeQuizHeader";

const title =
  "Examen teórico de Estabilidad (V/F y multiple choice) — Ing. Eléctrica UTN FRBA";
const description =
  "Autoevaluación teórica de Estabilidad para Ingeniería Eléctrica (UTN FRBA): 43 preguntas de verdadero/falso y opción múltiple sobre sistemas de fuerzas, vínculos, cadenas cinemáticas, reticulados e inercia de superficies, con corrección inmediata y explicaciones.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "Estabilidad",
    "UTN FRBA",
    "Ingeniería Eléctrica",
    "sistemas de fuerzas",
    "vínculos",
    "cadenas cinemáticas",
    "reticulados",
    "momento de inercia",
  ],
  alternates: { canonical: "/claude-quiz" },
  openGraph: { title, description, url: "/claude-quiz" },
  twitter: { card: "summary", title, description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: title,
  description,
  inLanguage: "es",
  educationalLevel: "University",
  numberOfQuestions: CLAUDE_QUIZ_QUESTIONS.length,
};

export default function ClaudeQuizPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ClaudeQuizHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6">
        <h1 className="text-xl font-semibold tracking-tight text-stone-800 dark:text-stone-100">
          {title}
        </h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {description}
        </p>
      </main>
      <ClaudeQuiz />
    </div>
  );
}
