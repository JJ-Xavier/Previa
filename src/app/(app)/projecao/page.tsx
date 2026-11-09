import type { Metadata } from "next";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Projeção mensal" };

export default function Projecao() {
  return (
    <>
      <TopoDaPagina titulo="Projeção mensal" />
      <EmConstrucao etapa={3} />
    </>
  );
}
