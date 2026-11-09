import type { Metadata } from "next";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Em breve" };

export default function EmBreve() {
  return (
    <>
      <TopoDaPagina titulo="Em breve" />
      <EmConstrucao etapa={6} />
    </>
  );
}
