import type { Metadata } from "next";
import Link from "next/link";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Cadastro da empresa" };

export default function Cadastro() {
  return (
    <>
      <TopoDaPagina
        titulo="Conte um pouco sobre sua empresa"
        descricao="Com essas respostas a Prévia aplica as regras certas na sua simulação."
      />
      <EmConstrucao etapa={4} />
      <p className="mx-auto max-w-[1200px] px-4 sm:px-10">
        <Link href="/" className="font-semibold">
          Ir para o Painel
        </Link>
      </p>
    </>
  );
}
