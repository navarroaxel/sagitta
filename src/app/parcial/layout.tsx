import type { Metadata } from "next";

const title = "Parcial V/F — Estabilidad | Frame Diagram Simulator";
const description =
  "Autoevaluación de verdadero/falso para el parcial de Estabilidad: sistemas de fuerzas, invariantes, grados de libertad, vínculos, cadenas cinemáticas, diagramas N/Q/M y reticulados.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function ParcialLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
