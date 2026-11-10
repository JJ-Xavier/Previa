"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { carregarExemplo, definirPerfil, useDados, type Perfil } from "@/lib/armazenamento";

const icone = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function EscolhaDePerfil() {
  const dados = useDados();
  const router = useRouter();
  const atual = dados?.perfil;

  function escolher(perfil: Perfil) {
    definirPerfil(perfil);
    if (perfil === "contador") router.push("/contador/");
    else router.push(dados?.empresas.length ? "/" : "/cadastro/");
  }

  function verExemplo() {
    carregarExemplo();
    router.push("/");
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 pt-10 pb-16 sm:px-10">
      <div className="grid max-w-[880px] gap-4 sm:grid-cols-2">
        <CartaoDePerfil
          titulo="Para a minha empresa"
          texto="Veja quanto de cada venda fica com você e quanto vai para o governo, mês a mês."
          atual={atual === "empresario"}
          aoEscolher={() => escolher("empresario")}
          icone={
            <svg {...icone}>
              <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
            </svg>
          }
        />
        <CartaoDePerfil
          titulo="Para os meus clientes"
          texto="Para contadores: acompanhe várias empresas e veja quanto o split payment retém no caixa de cada uma."
          atual={atual === "contador"}
          aoEscolher={() => escolher("contador")}
          icone={
            <svg {...icone}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
      </div>
      <p className="mt-8 text-[15px] text-texto-suave">
        Quer conhecer antes de escolher?{" "}
        <button
          type="button"
          onClick={verExemplo}
          className="cursor-pointer font-semibold text-verde-texto hover:text-verde-escuro hover:underline"
        >
          Abrir uma empresa de exemplo
        </button>
      </p>
    </main>
  );
}

type CartaoProps = { titulo: string; texto: string; atual: boolean; aoEscolher: () => void; icone: ReactNode };

function CartaoDePerfil({ titulo, texto, atual, aoEscolher, icone }: CartaoProps) {
  return (
    <button
      type="button"
      onClick={aoEscolher}
      className={`flex cursor-pointer flex-col items-start gap-3 rounded-cartao border-2 bg-papel p-7 text-left hover:border-petroleo ${atual ? "border-petroleo" : "border-transparent"}`}
    >
      <span className="text-verde-texto">{icone}</span>
      <span className="flex flex-wrap items-center gap-2 font-display text-2xl font-bold tracking-[-0.02em]">
        {titulo}
        {atual && (
          <span className="rounded-md bg-petroleo px-2 py-0.5 font-sans text-xs font-semibold tracking-normal text-white">
            perfil atual
          </span>
        )}
      </span>
      <span className="text-[15px] leading-[1.55] text-texto-suave">{texto}</span>
    </button>
  );
}
