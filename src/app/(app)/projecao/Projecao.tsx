"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AvisoDeEstimativa } from "@/components/AvisoDeEstimativa";
import { EstadoVazio } from "@/components/EstadoVazio";
import { SeloEmBreve } from "@/components/SeloEmBreve";
import { empresaAtiva, useDados } from "@/lib/armazenamento";
import {
  dividirValor,
  inicioDaJanela,
  mesDeMaiorRetencao,
  periodoComRecebimento,
  projecao,
  totais,
} from "@/lib/calculo";
import { mesAtual, somarMeses } from "@/lib/datas";
import { comMaiuscula, intervaloDeMeses, nomeDoMes, reais } from "@/lib/formatar";
import type { Centavos } from "@/lib/tipos";

const PERIODOS = [6, 12];

const opcao =
  "flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3.5 text-sm whitespace-nowrap disabled:cursor-not-allowed sm:px-[18px]";

export function Projecao() {
  const dados = useDados();
  const [meses, setMeses] = useState(6);
  if (!dados) return null;

  const empresa = empresaAtiva(dados);
  const periodo = empresa && periodoComRecebimento(empresa);
  if (!empresa || !periodo) return <EstadoVazio titulo="Projeção mensal" temEmpresa={!!empresa} />;

  const inicio = inicioDaJanela(periodo, mesAtual(), meses);
  const fim = somarMeses(inicio, meses - 1);
  const resumos = projecao(empresa, inicio, meses);
  const maior = mesDeMaiorRetencao(resumos);
  const total = totais(resumos);
  const variosAnos = inicio.slice(0, 4) !== fim.slice(0, 4);
  const exemplo = dividirValor(1_000_000, inicio, empresa.regime);

  return (
    <>
      <div className="faixa bg-petroleo text-mineral-claro">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-5 px-4 pt-5 pb-8 sm:px-10">
          <div className="flex flex-col gap-2">
            <p className="text-[15px] text-nevoa">{intervaloDeMeses(inicio, fim)}</p>
            <h1 className="font-display text-[clamp(28px,3.2vw,40px)] leading-[1.05] font-bold tracking-[-0.03em]">
              Projeção mensal
            </h1>
          </div>
          <div role="group" aria-label="Período da projeção" className="flex gap-1 rounded-full bg-petroleo-medio p-1">
            {PERIODOS.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={meses === n}
                onClick={() => setMeses(n)}
                className={`${opcao} ${meses === n ? "bg-mineral-claro font-semibold text-petroleo" : "text-nevoa hover:text-mineral-claro"}`}
              >
                {n} meses
              </button>
            ))}
            <Link
              href="/em-breve/projecao-2033/"
              className={`${opcao} text-nevoa no-underline hover:text-mineral-claro`}
            >
              Até 2033 <SeloEmBreve naFaixa />
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-x-8 gap-y-6 px-4 pt-8 pb-12 sm:px-10">
        <section aria-labelledby="tabela-titulo" className="flex min-w-0 flex-[3_1_560px] flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="tabela-titulo" className="font-display text-2xl leading-tight font-bold tracking-[-0.02em]">
              Mês a mês
            </h2>
            <p className="text-[15px] text-texto-suave">A retenção acompanha o dia em que cada cliente paga.</p>
          </div>
          <div
            role="region"
            aria-labelledby="tabela-titulo"
            tabIndex={0}
            className="overflow-x-auto rounded-bloco bg-papel"
          >
            <table className="w-full min-w-[640px] border-collapse text-[15px] tabular-nums">
              <thead>
                <tr className="text-[13px] text-texto-suave">
                  <th scope="col" className={`${celula} border-b border-linha text-left font-semibold`}>
                    Mês
                  </th>
                  <th scope="col" className={`${celula} border-b border-linha text-right font-semibold`}>
                    Você recebe
                  </th>
                  <th scope="col" className={`${celula} border-b border-linha text-right font-semibold text-ambar-texto`}>
                    Vai para o governo
                  </th>
                  <th scope="col" className={`${celula} border-b border-linha text-right font-semibold text-verde-texto`}>
                    Fica com você
                  </th>
                </tr>
              </thead>
              <tbody>
                {resumos.map((r, i) => {
                  const destaque = r.mes === maior?.mes;
                  const borda = `border-b ${i === resumos.length - 1 ? "border-linha" : "border-linha-suave"}`;
                  return (
                    <tr key={r.mes} className={destaque ? "bg-ambar-fundo" : undefined}>
                      <th
                        scope="row"
                        className={`${celula} ${borda} text-left whitespace-nowrap ${destaque ? "font-semibold" : "font-medium"}`}
                      >
                        {comMaiuscula(nomeDoMes(r.mes, { ano: variosAnos }))}
                        {destaque && (
                          <span className="ml-2 rounded-md bg-petroleo px-2 py-0.5 text-xs font-semibold text-white">
                            maior retenção
                          </span>
                        )}
                      </th>
                      <td className={`${celula} ${borda} text-right`}>{reais(r.recebido)}</td>
                      <td className={`${celula} ${borda} text-right text-ambar-texto ${destaque ? "font-semibold" : ""}`}>
                        {reais(r.governo)}
                      </td>
                      <td className={`${celula} ${borda} text-right font-semibold text-verde-texto`}>
                        {reais(r.ficaComVoce)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <th scope="row" className={`${rodape} text-left`}>
                    Total
                  </th>
                  <td className={`${rodape} text-right`}>{reais(total.recebido)}</td>
                  <td className={`${rodape} text-right text-ambar-texto`}>{reais(total.governo)}</td>
                  <td className={`${rodape} text-right text-verde-texto`}>{reais(total.ficaComVoce)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <AvisoDeEstimativa regime={empresa.regime} />
        </section>

        <Comparacao {...exemplo} />
      </main>
    </>
  );
}

const celula = "px-5 py-3";
const rodape = "px-5 py-3.5";

// Uma venda de R$ 10.000: hoje o imposto passa pelo caixa; com o split payment, não.
function Comparacao({ governo, ficaComVoce }: { governo: Centavos; ficaComVoce: Centavos }) {
  const fica = reais(ficaComVoce, { centavos: false });
  const imposto = reais(governo, { centavos: false });
  const parteVerde = { flex: `${ficaComVoce} 1 0%` };
  const parteAmbar = { flex: `${governo} 1 0%` };
  const valor = "flex min-w-0 items-center bg-verde px-4 font-display text-[22px] font-bold text-white tabular-nums";
  const nota = "flex min-w-0 items-center px-3 py-2 text-[13px] leading-[1.3] font-semibold";

  return (
    <section
      aria-labelledby="comparacao-titulo"
      className="flex min-w-0 flex-[2_1_320px] flex-col gap-5 rounded-cartao bg-papel p-6 lg:mt-11"
    >
      <h2 id="comparacao-titulo" className="font-display text-xl leading-tight font-bold tracking-[-0.02em]">
        Uma venda de R$ 10.000, hoje e com o split payment
      </h2>

      <Cenario titulo="Hoje" resumo="Entram R$ 10.000,00 no dia do pagamento">
        <div
          role="img"
          aria-label={`Hoje: entram R$ 10.000,00. ${reais(governo)} de imposto ficam no caixa até a guia vencer`}
          className="flex min-h-16"
        >
          <div className={`${valor} rounded-l-[14px]`} style={parteVerde}>
            {fica}
          </div>
          <div
            className={`${nota} rounded-r-[14px] border-2 border-l-0 border-dashed border-ambar bg-ambar-fundo text-ambar-texto`}
            style={parteAmbar}
          >
            {imposto} ficam no caixa até a guia
          </div>
        </div>
      </Cenario>

      <Cenario titulo="Com o split payment" resumo={`Entram ${reais(ficaComVoce)}. O imposto sai na hora.`}>
        <div
          role="img"
          aria-label={`Com o split payment: entram ${reais(ficaComVoce)} e ${reais(governo)} vão direto para o governo`}
          className="flex min-h-16 gap-4"
        >
          <div className={`${valor} rounded-[14px]`} style={parteVerde}>
            {fica}
          </div>
          <div className={`${nota} rounded-[14px] bg-ambar text-petroleo`} style={parteAmbar}>
            {imposto} vão direto para o governo
          </div>
        </div>
      </Cenario>
    </section>
  );
}

function Cenario({ titulo, resumo, children }: { titulo: string; resumo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-semibold">{titulo}</h3>
        <span className="text-sm text-texto-suave">{resumo}</span>
      </div>
      {children}
    </div>
  );
}
