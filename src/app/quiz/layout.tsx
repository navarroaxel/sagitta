import type { Metadata } from "next";

const title = "Examen V/F — Estática | Frame Diagram Simulator";
const description =
  "Autoevaluación de verdadero/falso sobre reducción de sistemas de fuerzas, vínculos, cadenas cinemáticas, diagramas N/Q/M y reticulados.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function QuizLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
