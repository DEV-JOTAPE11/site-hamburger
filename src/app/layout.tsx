import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Lilita_One, Poppins } from "next/font/google";

import Header from "@/components/Header";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE } from "@/data/site";

import "./globals.css";

/* Títulos: a display arredondada e pesada do "Taste the Difference". */
const display = Lilita_One({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-display" });

/* Contraponto em serifa itálica — o "bebidas" / "no meio da rotina" do vídeo. */
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", display: "swap", variable: "--font-serif" });

/* Texto corrido. */
const body = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-body" });

const TITLE = "Brasa Burger — Smash na chapa em Pinheiros";
const DESCRIPTION =
  "Brasa Burger: hambúrguer smash na chapa de ferro, pão brioche e carne moída no dia. Salão, retirada e delivery em Pinheiros, São Paulo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: TITLE, template: `%s · ${SITE.name}` },
  description: DESCRIPTION,
  applicationName: SITE.name,
  openGraph: { type: "website", locale: "pt_BR", url: "/", siteName: SITE.name, title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d9822b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${serif.variable} ${body.variable}`}>
      <body suppressHydrationWarning>
        <SmoothScroll />
        <Header />
        {children}
      </body>
    </html>
  );
}
