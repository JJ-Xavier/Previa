import type { Metadata } from "next";
import { FormularioDaEmpresa } from "@/components/FormularioDaEmpresa";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Cadastro da empresa" };

export default function Cadastro() {
  return (
    <>
      <TopoDaPagina
        titulo="Conte um pouco sobre sua empresa"
        descricao="Com essas respostas a Prévia aplica as regras certas na sua simulação."
      />
      <main className="mx-auto max-w-[1200px] px-4 pt-8 pb-12 sm:px-10">
        <FormularioDaEmpresa />
      </main>
    </>
  );
}
