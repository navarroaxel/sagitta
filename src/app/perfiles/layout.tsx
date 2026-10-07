import type { Metadata } from "next";

const title = "Perfiles de acero IPN / IPB | Frame Diagram Simulator";
const description =
  "Tabla de perfiles IPN e IPB (CIRSOC) con búsqueda, filtros por mínimo de Ix, Sx y A, orden por columna y copiado de valores.";

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
