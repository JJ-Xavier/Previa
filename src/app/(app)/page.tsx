import type { Metadata } from "next";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Painel" };

export default function Painel() {
  return (
    <>
      <TopoDaPagina titulo="Painel" />
      <EmConstrucao etapa={3} />
    </>
  );
}
