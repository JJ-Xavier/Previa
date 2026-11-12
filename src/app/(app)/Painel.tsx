"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AvisoDeEstimativa } from "@/components/AvisoDeEstimativa";
import { EstadoVazio } from "@/components/EstadoVazio";
import { FaixaDividida } from "@/components/FaixaDividida";
import { SeloEmBreve } from "@/components/SeloEmBreve";
import { empresaAtiva, useDados } from "@/lib/armazenamento";
import { dividirValor, resumoDoMes, visaoGeral, type VisaoGeral } from "@/lib/calculo";
import { limitar, mesAtual, somarMeses } from "@/lib/datas";
import { comMaiuscula, nomeDoMes, reais } from "@/lib/formatar";
import type { Empresa, Mes } from "@/lib/tipos";
import { GraficoMeses } from "./GraficoMeses";

export function Painel() {
  const dados = useDados();
  const router = useRouter();

  // Primeiro acesso, sem perfil e sem empresa: a pessoa escolhe como vai usar a Prévia.
  const primeiroAcesso = dados !== null && !dados.perfil && dados.empresas.length === 0;
  useEffect(() => {
    if (primeiroAcesso) router.replace("/perfil/");
  }, [primeiroAcesso, router]);
  if (!dados || primeiroAcesso) return null;

  const empresa = empresaAtiva(dados);
  const visao = empresa && visaoGeral(empresa, mesAtual());
  if (!empresa || !visao) return <EstadoVazio titulo="Painel" temEmpresa={!!empresa} />;

  return <PainelDaEmpresa key={empresa.id} empresa={empresa} visao={visao} />;
}

function PainelDaEmpresa({ empresa, visao }: { empresa: Empresa; visao: VisaoGeral }) {
  const hoje = mesAtual();
  const { periodo, inicio, seisMeses, maior, capitalDeGiro } = visao;

  // Mês do topo: o atual, ou o mais próximo dele que tenha vendas. As setas trocam.
  const [escolhido, escolher] = useState<Mes | null>(null);
  const mes = limitar(escolhido ?? visao.mes, periodo.primeiro, periodo.ultimo);
  const resumo = resumoDoMes(empresa, mes);
  const deCadaCem = dividirValor(10_000, mes, empresa.regime).ficaComVoce;
  const nome = nomeDoMes(mes, { ano: false });

  return (
    <>
      <div className="faixa bg-petroleo text-mineral-claro">
        <section
          aria-labelledby="hero-titulo"
          className="mx-auto flex max-w-[1200px] flex-col px-4 pt-6 pb-10 sm:px-10"
        >
          <div className="flex items-center gap-1">
            <p aria-live="polite" className="mr-1 text-base text-nevoa">
              {comMaiuscula(nomeDoMes(mes))}
            </p>
            <BotaoDeMes
              rotulo="Mês anterior"
              desativado={mes <= periodo.primeiro}
              aoClicar={() => escolher(somarMeses(mes, -1))}
              seta="M15 18l-6-6 6-6"
            />
            <BotaoDeMes
              rotulo="Próximo mês"
              desativado={mes >= periodo.ultimo}
              aoClicar={() => escolher(somarMeses(mes, 1))}
              seta="M9 18l6-6-6-6"
            />
          </div>
          <h1
            id="hero-titulo"
            className="mt-2.5 max-w-[18ch] font-display text-[clamp(36px,5vw,60px)] leading-[1.02] font-bold tracking-[-0.035em]"
          >
            De cada R$ 100 que você recebe, {reais(deCadaCem)} ficam com você.
          </h1>

          {resumo.recebido > 0 ? (
            <>
              <FaixaDividida
                className="mt-10"
                ficaComVoce={resumo.ficaComVoce}
                governo={resumo.governo}
                descricao={`${comMaiuscula(nomeDoMes(mes))}: de ${reais(resumo.recebido)} recebidos, ${reais(resumo.ficaComVoce)} ficam com a empresa e ${reais(resumo.governo)} vão para o governo`}
              />
              <p className="mt-[18px] max-w-[46rem] text-base leading-[1.55] text-nevoa">
                Em {nome} você recebe {reais(resumo.recebido)}. A parte do governo, IBS e CBS, sai no
                mesmo dia em que o cliente paga.
              </p>
            </>
          ) : (
            <p className="mt-10 max-w-[46rem] text-base leading-[1.55] text-nevoa">
              Em {nome} não há recebimentos lançados. Use as setas para ver outro mês.
            </p>
          )}
        </section>
      </div>

      <main className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-10 px-4 pt-10 pb-12 sm:px-10">
        <section aria-labelledby="meses-titulo" className="flex min-w-0 flex-[3_1_560px] flex-col gap-2">
          <h2 id="meses-titulo" className="font-display text-[30px] leading-tight font-bold tracking-[-0.02em]">
            {inicio >= hoje ? "Os próximos seis meses" : "Seis meses de recebimentos"}
          </h2>
          {maior && (
            <p className="text-base leading-[1.55] text-texto-suave">
              {comMaiuscula(nomeDoMes(maior.mes, { ano: false }))} é o mês em que mais dinheiro fica
              retido: {reais(maior.governo)}.
            </p>
          )}
          <GraficoMeses resumos={seisMeses} destaque={maior?.mes} />
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
            <div className="flex flex-wrap gap-5 text-sm text-texto-suave">
              <Legenda cor="bg-verde">Fica com você</Legenda>
              <Legenda cor="bg-ambar">Vai para o governo</Legenda>
            </div>
            <Link href="/projecao/" className="text-[15px] font-semibold">
              Ver mês a mês
            </Link>
          </div>
        </section>

        <aside className="flex min-w-0 flex-[2_1_320px] flex-col gap-7">
          <section aria-labelledby="giro-titulo" className="flex flex-col gap-2 rounded-cartao bg-papel p-[26px]">
            <h2 id="giro-titulo" className="text-base font-semibold text-texto-suave">
              Capital de giro que some
            </h2>
            <p className="font-display text-[40px] leading-tight font-bold tracking-[-0.03em] tabular-nums">
              {reais(capitalDeGiro, { centavos: false })}
              <span className="text-xl font-semibold tracking-normal"> por mês</span>
            </p>
            <p className="text-[15px] leading-[1.55] text-texto-suave">
              É o dinheiro do imposto que hoje fica no seu caixa até a guia vencer.
            </p>
          </section>
          <OQueFazer />
        </aside>
        <AvisoDeEstimativa regime={empresa.regime} className="-mt-6 basis-full" />
      </main>
    </>
  );
}

type BotaoDeMesProps = { rotulo: string; desativado: boolean; aoClicar: () => void; seta: string };

function BotaoDeMes({ rotulo, desativado, aoClicar, seta }: BotaoDeMesProps) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      disabled={desativado}
      onClick={aoClicar}
      className="grid size-10 cursor-pointer place-items-center rounded-full text-nevoa hover:bg-petroleo-medio hover:text-mineral-claro disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={seta} />
      </svg>
    </button>
  );
}

function Legenda({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={`size-3 rounded ${cor}`} />
      {children}
    </span>
  );
}

const icone = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "mt-0.5 shrink-0 text-verde-texto",
} as const;

function OQueFazer() {
  return (
    <section aria-labelledby="fazer-titulo" className="flex flex-col">
      <h2 id="fazer-titulo" className="mb-1.5 font-display text-2xl font-bold tracking-[-0.02em]">
        O que dá para fazer agora
      </h2>
      <Acao
        titulo="Negociar prazos com fornecedores"
        icone={
          <svg {...icone}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        }
      >
        Se o dinheiro do imposto pagava fornecedores, peça prazos maiores antes de 2027.
      </Acao>
      <Acao
        titulo="Revisar preços"
        icone={
          <svg {...icone}>
            <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
            <circle cx="8" cy="8" r="1.5" />
          </svg>
        }
      >
        Veja na{" "}
        <Link href="/projecao/" className="font-semibold">
          projeção mensal
        </Link>{" "}
        quanto cada venda deixa de verdade no caixa.
      </Acao>
      <Acao
        ultima
        titulo={
          <>
            Planejar crédito antes de precisar <SeloEmBreve />
          </>
        }
        icone={
          <svg {...icone}>
            <path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18" />
          </svg>
        }
      >
        A Prévia vai mostrar opções de crédito para os meses mais apertados.{" "}
        <Link href="/em-breve/credito/" className="font-semibold">
          Quero ser avisado
        </Link>
      </Acao>
    </section>
  );
}

type AcaoProps = { titulo: ReactNode; icone: ReactNode; children: ReactNode; ultima?: boolean };

function Acao({ titulo, icone, children, ultima = false }: AcaoProps) {
  return (
    <div className={`flex gap-3.5 py-4 ${ultima ? "" : "border-b border-linha"}`}>
      {icone}
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold">{titulo}</span>
        <span className="text-sm leading-normal text-texto-suave">{children}</span>
      </div>
    </div>
  );
}
