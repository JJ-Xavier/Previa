import type { ReactNode } from "react";
import { Marca } from "@/components/Marca";

// Entrar e cadastro: antes de entrar no app, sem o menu.
export default function LayoutAcesso({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="faixa bg-petroleo text-mineral-claro">
        <header className="mx-auto flex min-h-[76px] max-w-[1200px] items-center px-4 sm:px-10">
          <Marca />
        </header>
      </div>
      {children}
    </>
  );
}
