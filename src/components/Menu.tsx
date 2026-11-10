"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SeloEmBreve } from "./SeloEmBreve";

const itens = [
  { href: "/", rotulo: "Painel" },
  { href: "/projecao/", rotulo: "Projeção" },
  { href: "/vendas/", rotulo: "Vendas" },
  { href: "/transicao/", rotulo: "Transição" },
];

const semBarraFinal = (caminho: string) => caminho.replace(/\/+$/, "") || "/";

function estaAtivo(atual: string, href: string) {
  const a = semBarraFinal(atual);
  const h = semBarraFinal(href);
  return h === "/" ? a === "/" : a === h || a.startsWith(`${h}/`);
}

const base = "flex min-h-11 items-center gap-2 rounded-full px-3.5 text-[15px]";
const ativo = `${base} bg-petroleo-medio font-semibold text-white`;
const inativo = `${base} text-nevoa hover:text-mineral-claro`;

export function Menu() {
  const atual = usePathname();

  return (
    <nav aria-label="Menu principal" className="flex flex-1 flex-wrap gap-1 max-sm:order-last max-sm:basis-full">
      {itens.map(({ href, rotulo }) => {
        const marcado = estaAtivo(atual, href);
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
      <Link
        href="/em-breve/"
        aria-current={estaAtivo(atual, "/em-breve/") ? "page" : undefined}
        className={estaAtivo(atual, "/em-breve/") ? ativo : inativo}
      >
        Crédito <SeloEmBreve naFaixa />
      </Link>
    </nav>
  );
}
