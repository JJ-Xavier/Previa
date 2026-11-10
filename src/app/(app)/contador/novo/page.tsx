import type { Metadata } from "next";
import { FormularioDaEmpresa } from "@/components/FormularioDaEmpresa";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Novo cliente" };

// O contador cadastra um cliente com o mesmo formulário do cadastro da empresa.
export default function NovoCliente() {
  return (
    <>
      <TopoDaPagina
        titulo="Novo cliente"
        descricao="Com esses dados a Prévia aplica as regras certas na simulação do cliente."
        voltar={{ href: "/contador/", rotulo: "Seus clientes" }}
      />
      <main className="mx-auto max-w-[1200px] px-4 pt-10 pb-16 sm:px-10">
        <FormularioDaEmpresa voltarPara="/contador/" rotuloDoBotao="Salvar cliente" />
      </main>
    </>
  );
}
