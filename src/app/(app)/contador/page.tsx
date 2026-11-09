import type { Metadata } from "next";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Clientes" };

export default function Contador() {
  return (
    <>
      <TopoDaPagina titulo="Seus clientes" />
      <EmConstrucao etapa={5} />
    </>
  );
}
