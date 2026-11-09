import type { Metadata } from "next";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Transição 2026–2033" };

export default function Transicao() {
  return (
    <>
      <TopoDaPagina
        titulo="A reforma, ano a ano"
        descricao="As regras mudam aos poucos até 2033. A cada etapa, a Prévia atualiza a sua simulação sem você refazer as contas."
      />
      <EmConstrucao etapa={6} />
    </>
  );
}
