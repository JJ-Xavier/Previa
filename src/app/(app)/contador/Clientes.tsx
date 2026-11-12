"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AvisoDeEstimativa } from "@/components/AvisoDeEstimativa";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import { abrirEmpresa, carregarExemplo, removerEmpresa, useDados } from "@/lib/armazenamento";
import { visaoGeral } from "@/lib/calculo";
import { mesAtual } from "@/lib/datas";
import { nomeDoMes, nomeDoRegime, reais } from "@/lib/formatar";

const cabecalho = "border-b border-linha px-[22px] py-4 font-semibold";
const celula = "border-b border-linha-suave px-[22px] py-4";

// Painel do contador: um resumo por cliente, com a mesma conta do Painel de cada um.
export function Clientes() {
  const dados = useDados();
  const router = useRouter();
  const [removendo, setRemovendo] = useState<string | null>(null);
  if (!dados) return null;

  const hoje = mesAtual();
  const clientes = dados.empresas.map((empresa) => ({ empresa, visao: visaoGeral(empresa, hoje) }));
  const giroTotal = clientes.reduce((soma, { visao }) => soma + (visao?.capitalDeGiro ?? 0), 0);

  function abrir(id: string) {
    abrirEmpresa(id);
    router.push("/");
  }

  return (
    <>
      <TopoDaPagina
        titulo="Seus clientes"
        descricao="Quanto o split payment retém no caixa de cada empresa que você acompanha."
      >
        {giroTotal > 0 && (
          <p className="max-w-[42rem] text-base leading-relaxed text-nevoa">
            Somando os clientes,{" "}
            <strong className="font-semibold text-white">{reais(giroTotal, { centavos: false })} por mês</strong>{" "}
            deixam de ficar no caixa até a guia vencer.
          </p>
        )}
      </TopoDaPagina>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pt-8 pb-12 sm:px-10">
        {clientes.length === 0 ? (
          <section
            aria-labelledby="sem-clientes"
            className="flex max-w-2xl flex-col gap-3 rounded-cartao bg-papel p-6 sm:p-8"
          >
            <h2 id="sem-clientes" className="font-display text-[26px] font-bold tracking-[-0.02em]">
              Cadastre o primeiro cliente
            </h2>
            <p className="text-base leading-[1.55] text-texto-suave">
              Para cada empresa que você acompanha, lance as vendas à mão ou por planilha. A Prévia mostra
              quanto cada uma vai reter com o split payment.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href="/contador/novo/" className="botao">
                Adicionar cliente
              </Link>
              <button type="button" onClick={carregarExemplo} className="botao-contorno">
                Carregar exemplo
              </button>
            </div>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-[26px] leading-tight font-bold tracking-[-0.02em]">
                {clientes.length === 1 ? "1 cliente" : `${clientes.length} clientes`}
              </h2>
              <Link href="/contador/novo/" className="botao">
                Adicionar cliente
              </Link>
            </div>

            <div role="region" aria-label="Lista de clientes" tabIndex={0} className="relative overflow-x-auto rounded-bloco bg-papel">
              <table className="w-full min-w-[880px] border-collapse text-[15px] tabular-nums">
                <thead>
                  <tr className="text-[13px] text-texto-suave">
                    <th scope="col" className={`${cabecalho} text-left`}>
                      Cliente
                    </th>
                    <th scope="col" className={`${cabecalho} text-left`}>
                      Regime
                    </th>
                    <th scope="col" className={`${cabecalho} text-right text-ambar-texto`}>
                      Retido no mês
                    </th>
                    <th scope="col" className={`${cabecalho} text-right`}>
                      Capital de giro
                    </th>
                    <th scope="col" className={`${cabecalho} text-right`}>
                      Vendas
                    </th>
                    <th scope="col" className={cabecalho}>
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(({ empresa, visao }) => {
                    const aberto = empresa.id === dados.ativaId;
                    return (
                      <tr key={empresa.id} className="last:[&>td]:border-b-0">
                        <td className={celula}>
                          <div className="flex flex-col gap-0.5">
                            <span className="flex flex-wrap items-center gap-2 font-semibold">
                              {empresa.nome}
                              {aberto && (
                                <span className="rounded-md bg-petroleo px-2 py-0.5 text-xs font-semibold text-white">
                                  aberto
                                </span>
                              )}
                            </span>
                            <span className="text-[13px] text-texto-suave">{empresa.cnpj}</span>
                          </div>
                        </td>
                        <td className={`${celula} text-texto-suave`}>{nomeDoRegime(empresa.regime)}</td>
                        {visao ? (
                          <>
                            <td className={`${celula} text-right`}>
                              <span className="block font-semibold text-ambar-texto">{reais(visao.resumo.governo)}</span>
                              <span className="block text-[13px] text-texto-suave">em {nomeDoMes(visao.mes)}</span>
                            </td>
                            <td className={`${celula} text-right font-semibold`}>
                              {reais(visao.capitalDeGiro, { centavos: false })}
                              <span className="font-normal text-texto-suave"> por mês</span>
                            </td>
                          </>
                        ) : (
                          <td colSpan={2} className={`${celula} text-right text-texto-suave`}>
                            Sem vendas lançadas
                          </td>
                        )}
                        <td className={`${celula} text-right`}>{empresa.vendas.length}</td>
                        <td className={`${celula} text-right whitespace-nowrap`}>
                          {removendo === empresa.id ? (
                            <span className="inline-flex items-center gap-3">
                              <span className="text-texto-suave">Remover com as vendas?</span>
                              <button
                                type="button"
                                autoFocus
                                aria-label={`Confirmar remoção de ${empresa.nome}`}
                                onClick={() => {
                                  removerEmpresa(empresa.id);
                                  setRemovendo(null);
                                }}
                                className="cursor-pointer font-semibold text-erro hover:underline"
                              >
                                Remover
                              </button>
                              <button
                                type="button"
                                onClick={() => setRemovendo(null)}
                                className="cursor-pointer font-semibold hover:underline"
                              >
                                Cancelar
                              </button>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-4">
                              <button
                                type="button"
                                aria-label={`Abrir ${empresa.nome}`}
                                onClick={() => abrir(empresa.id)}
                                className="cursor-pointer font-semibold text-verde-texto hover:text-verde-escuro"
                              >
                                Abrir
                              </button>
                              <button
                                type="button"
                                aria-label={`Remover ${empresa.nome}`}
                                onClick={() => setRemovendo(empresa.id)}
                                className="cursor-pointer font-semibold text-texto-suave hover:text-erro"
                              >
                                Remover
                              </button>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex max-w-[46rem] flex-col gap-1">
              <p className="text-[13px] leading-normal text-texto-suave">
                Retido no mês é o que vai para o governo no mês que o Painel do cliente mostra. Capital de giro é a
                média de imposto por mês nos seis meses do Painel.
              </p>
              <AvisoDeEstimativa />
            </div>
          </>
        )}

        <p className="text-[15px] text-texto-suave">
          Acompanha só a sua empresa? <Link href="/perfil/" className="font-semibold">Trocar de perfil</Link>
        </p>
      </main>
    </>
  );
}
