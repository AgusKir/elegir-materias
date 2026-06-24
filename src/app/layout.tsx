import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Elegir Materias - Calculadora de inscripción",
  description: "Una aplicación web diseñada para ayudar a estudiantes universitarios a gestionar e inscribirse a materias de forma óptima, basado en correlativas y cuatrimestres restantes.",
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
      <head>
        <link rel="icon" type="image/webp" href="/assets/page-icon.webp" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
