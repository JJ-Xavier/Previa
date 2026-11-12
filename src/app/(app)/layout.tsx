import Link from "next/link";
import type { ReactNode } from "react";
import { ComAcesso } from "@/components/ComAcesso";
import { EmpresaAtual } from "@/components/EmpresaAtual";
import { Marca } from "@/components/Marca";
import { Menu } from "@/components/Menu";
import { Sair } from "@/components/Sair";

// Telas do app: faixa petróleo com a marca e o menu no topo. Só com uma conta aberta.
export default function LayoutApp({ children }: { children: ReactNode }) {
  return (
    <ComAcesso>
      <div className="faixa bg-petroleo text-mineral-claro">
        <header className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2 sm:px-10">
          <Link href="/" aria-label="Prévia, ir para o Painel">
            <Marca />
          </Link>
          <Menu />
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <EmpresaAtual />
            <Sair />
          </div>
        </header>
      </div>
      {children}
    </ComAcesso>
  );
}
