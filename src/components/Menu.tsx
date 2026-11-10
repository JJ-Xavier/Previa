"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useDados } from "@/lib/armazenamento";
import { SeloEmBreve } from "./SeloEmBreve";

type Item = { href: string; rotulo: ReactNode; /** Outras telas em que o item fica marcado. */ tambem?: string[] };

const itens: Item[] = [
  { href: "/", rotulo: "Painel" },
  { href: "/projecao/", rotulo: "Projeção" },
  // As conexões "em breve" saem da tela de Vendas.
  { href: "/vendas/", rotulo: "Vendas", tambem: ["/empresa/", "/em-breve/nfe/", "/em-breve/banco/", "/em-breve/erp/"] },
  { href: "/transicao/", rotulo: "Transição" },
  {
    href: "/em-breve/credito/",
    rotulo: (
      <>
        Crédito <SeloEmBreve naFaixa />
      </>
    ),
  },
];

const semBarraFinal = (caminho: string) => caminho.replace(/\/+$/, "") || "/";

function estaEm(atual: string, href: string) {
  const a = semBarraFinal(atual);
  const h = semBarraFinal(href);
  return h === "/" ? a === "/" : a === h || a.startsWith(`${h}/`);
}

const base = "flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[15px]";
const ativo = `${base} bg-petroleo-medio font-semibold text-white`;
const inativo = `${base} text-nevoa hover:text-mineral-claro`;

export function Menu() {
  const atual = usePathname();
  // O contador ganha a lista de clientes como primeiro item.
  const contador = useDados()?.perfil === "contador";
  const visiveis = contador ? [{ href: "/contador/", rotulo: "Clientes" }, ...itens] : itens;

  return (
    <nav aria-label="Menu principal" className="flex flex-1 flex-wrap gap-1 max-sm:order-last max-sm:basis-full">
      {visiveis.map(({ href, rotulo, tambem = [] }: Item) => {
        const marcado = [href, ...tambem].some((h) => estaEm(atual, h));
        return (
          <Link
            key={href}
            href={href}
            aria-current={marcado ? "page" : undefined}
            className={marcado ? ativo : inativo}
          >
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
