import type { ReactNode } from "react";
import { Marca } from "@/components/Marca";
import { PassosDoCadastro } from "./PassosDoCadastro";

// Escolha de perfil e cadastro: depois de entrar, antes das telas do app. Sem o menu.
export default function LayoutAcesso({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="faixa bg-petroleo text-mineral-claro">
        <header className="mx-auto flex min-h-[76px] max-w-[1200px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-2 sm:px-10">
          <Marca />
          <PassosDoCadastro />
        </header>
      </div>
      {children}
    </>
  );
}
