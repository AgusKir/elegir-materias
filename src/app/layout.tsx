import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Elegir Materias - Optimizá tu carrera",
  description: "Descubrí qué materias te conviene cursar para recibirte en el menor tiempo posible.",
  authors: [{ name: "Agustín Kiryczun" }],
  keywords: ["materias", "correlativas", "universidad", "cuatrimestre", "inscripcion", "plan de estudios"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
