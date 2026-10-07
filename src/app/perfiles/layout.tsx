import type { Metadata } from "next";

const title = "Perfiles y tubos de acero (CIRSOC) | Frame Diagram Simulator";
const description =
  "Tablas CIRSOC de perfiles laminados IPN, IPB, IPE, IPBl, IPBv y UPN, y de tubos de acero circulares, cuadrados y rectangulares: búsqueda, filtros por mínimo de Ix, Sx y A, orden por columna, dibujo de la sección con cotas y copiado de valores.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
};

export default function PerfilesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
