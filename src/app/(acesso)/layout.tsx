import type { ReactNode } from "react";
import { ComAcesso } from "@/components/ComAcesso";
import { Marca } from "@/components/Marca";
import { Sair } from "@/components/Sair";
import { PassosDoCadastro } from "./PassosDoCadastro";

// Escolha de perfil e cadastro: depois de criar a conta, antes das telas do app. Sem o menu.
export default function LayoutAcesso({ children }: { children: ReactNode }) {
  return (
    <ComAcesso>
      <div className="faixa bg-petroleo text-mineral-claro">
        <header className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-2 sm:px-10">
          <Marca />
          <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
            <PassosDoCadastro />
            <Sair />
          </div>
        </header>
      </div>
      {children}
    </ComAcesso>
  );
}
