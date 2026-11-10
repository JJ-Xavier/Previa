import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  titulo: string;
  descricao?: string;
  /** Link acima do título para a tela de onde a pessoa veio. */
  voltar?: { href: string; rotulo: string };
  /** Conteúdo extra dentro da faixa, abaixo do título. */
  children?: ReactNode;
};

// Continuação da faixa petróleo abaixo do menu, com o título da tela.
export function TopoDaPagina({ titulo, descricao, voltar, children }: Props) {
  return (
    <div className="faixa bg-petroleo text-mineral-claro">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2.5 px-4 pt-8 pb-11 sm:px-10">
        {voltar && (
          <Link
            href={voltar.href}
            className="-mt-1 inline-flex min-h-8 items-center gap-1.5 self-start text-sm font-medium text-nevoa no-underline hover:text-mineral-claro"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            {voltar.rotulo}
          </Link>
        )}
        <h1 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.05] font-bold tracking-[-0.035em]">
          {titulo}
        </h1>
        {descricao && <p className="max-w-[42rem] text-base leading-relaxed text-nevoa">{descricao}</p>}
        {children}
      </div>
    </div>
  );
}
