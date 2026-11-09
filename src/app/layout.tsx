import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";

// next/font baixa as fontes no build e as embute no app: funcionam sem internet.
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: { default: "Prévia", template: "%s | Prévia" },
  description: "Quanto de cada venda fica com você depois do split payment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${bricolage.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
