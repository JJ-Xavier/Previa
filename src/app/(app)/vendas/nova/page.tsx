import type { Metadata } from "next";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Lançar venda" };

export default function NovaVenda() {
  return (
    <>
      <TopoDaPagina titulo="Lançar venda" />
      <EmConstrucao etapa={4} />
    </>
  );
}
