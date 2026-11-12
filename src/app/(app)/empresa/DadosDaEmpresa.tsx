"use client";

import { EstadoVazio } from "@/components/EstadoVazio";
import { FormularioDaEmpresa } from "@/components/FormularioDaEmpresa";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import { empresaAtiva, useDados } from "@/lib/armazenamento";

// Editar a empresa aberta: mudar regime ou prazo refaz a simulação na hora.
export function DadosDaEmpresa() {
  const dados = useDados();
  if (!dados) return null;

  const empresa = empresaAtiva(dados);
  if (!empresa) return <EstadoVazio titulo="Dados da empresa" temEmpresa={false} />;

  return (
    <>
      <TopoDaPagina
        titulo="Dados da empresa"
        descricao="Mudar o regime ou o prazo médio atualiza a simulação na hora."
        voltar={{ href: "/vendas/", rotulo: "Vendas e recebimentos" }}
      />
      <main className="mx-auto max-w-[1200px] px-4 pt-8 pb-12 sm:px-10">
        <FormularioDaEmpresa key={empresa.id} existente={empresa} />
      </main>
    </>
  );
}
