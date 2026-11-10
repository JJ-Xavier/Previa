"use client";

import { usePathname } from "next/navigation";

const passos = ["Sua empresa", "Suas vendas", "Sua simulação"];

// Os três passos do primeiro uso, no topo do cadastro. O cadastro é o passo 1.
export function PassosDoCadastro() {
  if (!usePathname().startsWith("/cadastro")) return null;

  return (
    <ol aria-label="Etapas do cadastro" className="flex flex-wrap gap-1.5 text-sm">
      {passos.map((passo, i) => {
        const atual = i === 0;
        return (
          <li
            key={passo}
            aria-current={atual ? "step" : undefined}
            className={`flex min-h-10 items-center gap-2 rounded-full py-0 pr-3.5 pl-1.5 ${atual ? "bg-petroleo-medio font-semibold text-white" : "text-nevoa"}`}
          >
            <span
              className={`grid place-items-center rounded-full text-[13px] ${atual ? "size-7 bg-ambar font-bold text-petroleo" : "size-[26px] border-[1.5px] border-[#4c6a6e]"}`}
            >
              {i + 1}
            </span>
            {passo}
          </li>
        );
      })}
    </ol>
  );
}
