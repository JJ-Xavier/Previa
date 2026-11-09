import Link from "next/link";
import type { ReactNode } from "react";
import { Marca } from "@/components/Marca";
import { Menu } from "@/components/Menu";

// Telas do app: faixa petróleo com a marca e o menu no topo.
export default function LayoutApp({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="faixa bg-petroleo text-mineral-claro">
        <header className="mx-auto flex min-h-[76px] max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2 sm:px-10">
          <Link href="/" aria-label="Prévia, ir para o Painel">
            <Marca />
          </Link>
          <Menu />
        </header>
      </div>
      {children}
    </>
  );
}
