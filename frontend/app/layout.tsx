import type { Metadata } from "next";
import { Hind, Montserrat } from "next/font/google";
import { getLang } from "@/lib/lang";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "700"],
  variable: "--font-montserrat",
});
const hind = Hind({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-hind" });

export const metadata: Metadata = {
  title: { default: "Testr - Sinyalizasyon Sistemleri", template: "%s – Testr – Sinyalizasyon Sistemleri" },
  description: "Raylı sistemlerde; güvenliği, teknolojiyi ve sürdürülebilirliği bir araya getiren mühendislik.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} className={`${montserrat.variable} ${hind.variable}`}>
      <body>{children}</body>
    </html>
  );
}
