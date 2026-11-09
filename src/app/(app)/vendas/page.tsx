import type { Metadata } from "next";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Vendas e recebimentos" };

export default function Vendas() {
  return (
    <>
      <TopoDaPagina
        titulo="Vendas e recebimentos"
        descricao="A simulação usa o que você coloca aqui. Quanto mais vendas lançadas, mais perto da realidade fica a previsão do seu caixa."
      />
      <EmConstrucao etapa={4} />
    </>
  );
}
