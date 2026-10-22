import type { Metadata } from "next";

const title = "Carga axial excéntrica en perfiles | Frame Diagram Simulator";
const description =
  "Flexión compuesta oblicua en perfiles IPN e IPB: reducción de una carga axial excéntrica al baricentro, tensión en las esquinas de la sección, eje neutro y carga máxima para una tensión admisible.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function FlexionCompuestaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
