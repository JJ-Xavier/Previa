"use client";

import { sair } from "@/lib/armazenamento";

// Fecha a conta. A tela some e o ComAcesso leva para Entrar.
export function Sair() {
  return (
    <button
      type="button"
      onClick={sair}
      className="min-h-10 cursor-pointer rounded-full px-3 text-sm text-nevoa hover:bg-petroleo-medio hover:text-mineral-claro"
    >
      Sair
    </button>
  );
}
