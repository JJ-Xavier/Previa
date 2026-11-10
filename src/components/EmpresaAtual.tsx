"use client";

import { abrirEmpresa, empresaAtiva, useDados } from "@/lib/armazenamento";

// Canto do topo: o nome da empresa aberta. Com duas ou mais (clientes do
// contador, ou a própria empresa e a de exemplo), vira um seletor para trocar.
export function EmpresaAtual() {
  const dados = useDados();
  const empresa = dados && empresaAtiva(dados);
  if (!dados || !empresa) return null;

  if (dados.empresas.length === 1) {
    return <span className="ml-auto text-sm text-nevoa">{empresa.nome}</span>;
  }

  return (
    <label className="relative ml-auto">
      <span className="sr-only">{dados.perfil === "contador" ? "Cliente aberto" : "Empresa aberta"}</span>
      <select
        value={empresa.id}
        onChange={(e) => abrirEmpresa(e.target.value)}
        className="min-h-10 max-w-64 cursor-pointer appearance-none truncate rounded-full bg-petroleo-medio pr-9 pl-4 text-sm text-mineral-claro hover:bg-petroleo-claro"
      >
        {dados.empresas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nome}
          </option>
        ))}
      </select>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-nevoa"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </label>
  );
}
