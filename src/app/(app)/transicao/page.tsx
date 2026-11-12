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

      <main className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 pt-8 pb-12 sm:px-10">
        <h2 className="font-display text-2xl leading-tight font-bold tracking-[-0.02em]">
          O que muda no seu caixa em cada fase
        </h2>

        {/* Uma coluna por fase, na mesma ordem da linha do tempo acima. */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fases.map((fase, i) => (
            <section
              key={fase.de}
              aria-labelledby={`fase-${fase.de}`}
              className="flex flex-col gap-2 rounded-bloco bg-papel px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-[22px] font-bold">{anosDaFase(fase)}</span>
                <span className={`rounded-md px-2.5 py-[3px] text-xs font-semibold ${selos[i]}`}>{fase.selo}</span>
              </div>
              <h3 id={`fase-${fase.de}`} className="text-base font-semibold">
                {fase.titulo}
              </h3>
              <p className="text-sm leading-relaxed text-texto-suave">{fase.texto}</p>
            </section>
          ))}
        </div>

        <section
          aria-labelledby="conta-titulo"
          className="mt-2 flex flex-col gap-1.5 rounded-bloco border-[1.5px] border-dashed border-tracejado px-5 py-4"
        >
          <h2 id="conta-titulo" className="text-base font-semibold">
            Como a Prévia faz a conta hoje
          </h2>
          <p className="max-w-[70rem] text-sm leading-relaxed text-texto-suave">
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
