import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import pageIcon from "../../public/assets/page-icon.webp";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Elegir Materias - Optimizá tu carrera",
  description: "Descubrí qué materias te conviene cursar para recibirte en el menor tiempo posible.",
  authors: [{ name: "Agustín Kiryczun" }],
  keywords: ["materias", "correlativas", "universidad", "cuatrimestre", "inscripcion", "plan de estudios"],
  icons: {
    icon: pageIcon.src,
  },
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
  const goatCounterCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE

  return (
    <html lang="es" className={`${outfit.variable}`}>
      <body>
        {children}
        {/* Privacy-friendly analytics via GoatCounter (zero cookies, GDPR compliant) */}
        {goatCounterCode && (
          <Script
            data-goatcounter={`https://${goatCounterCode}.goatcounter.com/count`}
            async
            src="//gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
