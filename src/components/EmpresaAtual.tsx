"use client";

import { empresaAtiva, useDados } from "@/lib/armazenamento";

// Nome da empresa aberta, no canto do topo. Na etapa 5 vira o seletor de clientes.
export function EmpresaAtual() {
  const dados = useDados();
  const empresa = dados && empresaAtiva(dados);
  if (!empresa) return null;
  return <span className="ml-auto text-sm text-nevoa">{empresa.nome}</span>;
}
