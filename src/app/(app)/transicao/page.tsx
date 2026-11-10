import type { Metadata } from "next";
import Link from "next/link";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import { aliquota } from "@/lib/aliquotas";
import { anosDaFase, fases } from "./fases";
import { LinhaDoTempo } from "./LinhaDoTempo";

export const metadata: Metadata = { title: "Transição 2026–2033" };

// Selos na mesma ordem das fases: quanto mais escuro, mais perto da regra final.
const selos = [
  "bg-linha-suave text-selo-texto",
  "bg-verde-fundo text-verde-escuro",
  "bg-ambar-fundo text-ambar-texto",
  "bg-petroleo text-white",
];

const referencia = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(
  aliquota(2027, "simples"),
);

export default function Transicao() {
  return (
    <>
      <TopoDaPagina
        titulo="A reforma, ano a ano"
        descricao="As regras mudam aos poucos até 2033. A cada etapa, a Prévia atualiza a sua simulação sem você refazer as contas."
      >
        <LinhaDoTempo />
      </TopoDaPagina>

      <main className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pt-12 pb-[72px] sm:px-10">
        <h2 className="font-display text-[26px] leading-tight font-bold tracking-[-0.02em]">
          O que muda no seu caixa em cada fase
        </h2>

        <div className="rounded-cartao bg-papel px-6 py-2 sm:px-7">
          {fases.map((fase, i) => (
            <section
              key={fase.de}
              aria-labelledby={`fase-${fase.de}`}
              className="flex flex-wrap gap-x-8 gap-y-2 border-b border-linha-suave py-[22px] last:border-b-0"
            >
              <div className="flex flex-[0_0_170px] flex-col gap-1.5">
                <span className="font-display text-[26px] font-bold">{anosDaFase(fase)}</span>
                <span className={`self-start rounded-md px-2.5 py-[3px] text-xs font-semibold ${selos[i]}`}>
                  {fase.selo}
                </span>
              </div>
              <div className="flex flex-[1_1_360px] flex-col gap-1.5">
                <h3 id={`fase-${fase.de}`} className="text-lg font-semibold">
                  {fase.titulo}
                </h3>
                <p className="max-w-[46rem] text-[15px] leading-relaxed text-texto-suave">{fase.texto}</p>
              </div>
            </section>
          ))}
        </div>

        <section
          aria-labelledby="conta-titulo"
          className="mt-4 flex max-w-[760px] flex-col gap-2 rounded-cartao border-[1.5px] border-dashed border-tracejado px-6 py-6 sm:px-7"
        >
          <h2 id="conta-titulo" className="font-display text-[22px] font-bold tracking-[-0.02em]">
            Como a Prévia faz a conta hoje
          </h2>
          <p className="text-[15px] leading-relaxed text-texto-suave">
            As alíquotas de IBS e CBS de cada ano e de cada regime ainda vão ser definidas. Até lá, a Prévia usa uma
            alíquota de referência de {referencia} em todos os anos. Por isso os números do{" "}
            <Link href="/" className="font-semibold">
              Painel
            </Link>{" "}
            e da{" "}
            <Link href="/projecao/" className="font-semibold">
              Projeção
            </Link>{" "}
            são uma estimativa para planejamento, não o valor exato da guia.
          </p>
        </section>

        <p className="text-[13px] leading-normal text-texto-suave">
          Base legal: Emenda Constitucional 132/2023, Lei Complementar 214/2025 e Lei Complementar 227/2026.
        </p>
      </main>
    </>
  );
}
