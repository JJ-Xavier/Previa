"use client";

import Link from "next/link";
import { carregarExemplo, useDados } from "@/lib/armazenamento";
import { TopoDaPagina } from "./TopoDaPagina";

type Props = {
  titulo: string;
  /** Sem empresa cadastrada, "Lançar venda" leva antes ao cadastro. */
  temEmpresa: boolean;
};

// O que Painel e Projeção mostram enquanto não há nenhuma venda lançada.
export function EstadoVazio({ titulo, temEmpresa }: Props) {
  // O contador sem nenhum cliente começa cadastrando um.
  const contador = useDados()?.perfil === "contador";
  const contadorSemCliente = !temEmpresa && contador;
  const acao = temEmpresa
    ? { href: "/vendas/nova/", rotulo: "Lançar venda" }
    : contadorSemCliente
      ? { href: "/contador/novo/", rotulo: "Adicionar cliente" }
      : { href: "/cadastro/", rotulo: "Lançar venda" };

  return (
    <>
      <TopoDaPagina
        titulo={titulo}
        descricao="A Prévia mostra quanto de cada venda fica com você e quanto vai para o governo com o split payment."
      />
      <main className="mx-auto max-w-[1200px] px-4 pt-8 pb-12 sm:px-10">
        <section
          aria-labelledby="vazio-titulo"
          className="flex max-w-2xl flex-col gap-3 rounded-cartao bg-papel p-6 sm:p-8"
        >
          <h2 id="vazio-titulo" className="font-display text-[26px] font-bold tracking-[-0.02em]">
            Comece pelas suas vendas
          </h2>
          <p className="text-base leading-[1.55] text-texto-suave">
            Lance uma venda com o valor e o dia em que o cliente paga. Para ver a Prévia funcionando
            antes, carregue uma empresa de exemplo com seis meses de vendas.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Link href={acao.href} className="botao">
              {acao.rotulo}
            </Link>
            <button type="button" onClick={carregarExemplo} className="botao-contorno">
              Carregar exemplo
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
