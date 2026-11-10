import type { Metadata } from "next";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import { EscolhaDePerfil } from "./EscolhaDePerfil";

export const metadata: Metadata = { title: "Como você vai usar a Prévia" };

export default function PaginaPerfil() {
  return (
    <>
      <TopoDaPagina titulo="Como você vai usar a Prévia?" descricao="Você pode trocar depois." />
      <EscolhaDePerfil />
    </>
  );
}
