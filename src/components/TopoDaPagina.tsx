import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descricao?: string;
  /** Conteúdo extra dentro da faixa, como a faixa dividida do Painel. */
  children?: ReactNode;
};

// Continuação da faixa petróleo abaixo do menu, com o título da tela.
export function TopoDaPagina({ titulo, descricao, children }: Props) {
  return (
    <div className="faixa bg-petroleo text-mineral-claro">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2.5 px-4 pt-8 pb-11 sm:px-10">
        <h1 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.05] font-bold tracking-[-0.035em]">
          {titulo}
        </h1>
        {descricao && <p className="max-w-[42rem] text-base leading-relaxed text-nevoa">{descricao}</p>}
        {children}
      </div>
    </div>
  );
}
