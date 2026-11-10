import { useSyncExternalStore } from "react";
import { criarEmpresaExemplo } from "./exemplo";
import type { Empresa, Venda } from "./tipos";

/**
 * Único lugar do app que lê e grava os dados, hoje no localStorage. As telas
 * usam só as funções daqui. Para trocar por um banco depois, mexe-se só neste
 * arquivo.
 */

/** Empresário acompanha a própria empresa; contador acompanha vários clientes. */
export type Perfil = "empresario" | "contador";

export type Dados = {
  empresas: Empresa[];
  /** Empresa que as telas mostram. Para o contador, é o cliente aberto. */
  ativaId: string | null;
  /** Escolhido no primeiro acesso. Dados antigos, sem perfil, contam como empresário. */
  perfil?: Perfil;
};

const CHAVE = "previa:dados";
const VAZIO: Dados = { empresas: [], ativaId: null };

let cache: Dados | null = null;
const ouvintes = new Set<() => void>();

function ler(): Dados {
  if (typeof localStorage === "undefined") return VAZIO;
  return (cache ??= lerDoComputador());
}

/** Dado salvo estragado ou de outro formato é tratado como vazio. */
function lerDoComputador(): Dados {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    return Array.isArray(salvo?.empresas) ? salvo : VAZIO;
  } catch {
    return VAZIO;
  }
}

function gravar(dados: Dados) {
  cache = dados;
  localStorage.setItem(CHAVE, JSON.stringify(dados));
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

/**
 * Dados salvos, para usar nas telas. A tela atualiza sozinha quando eles
 * mudam. Devolve null no primeiro render, antes de ler o computador: nesse
 * caso a tela não mostra nada, em vez de piscar o estado vazio.
 */
export function useDados(): Dados | null {
  return useSyncExternalStore(assinar, ler, () => null);
}

/** Os mesmos dados, fora de um componente. */
export function lerDados(): Dados {
  return ler();
}

export function empresaAtiva(dados: Dados): Empresa | null {
  return dados.empresas.find((e) => e.id === dados.ativaId) ?? null;
}

export function definirPerfil(perfil: Perfil) {
  gravar({ ...ler(), perfil });
}

export function novoId(): string {
  return crypto.randomUUID();
}

/** Cria ou atualiza a empresa (pelo id). Se nenhuma estiver ativa, ela passa a ser. */
export function salvarEmpresa(empresa: Empresa) {
  const dados = ler();
  const { empresas, ativaId } = dados;
  const existe = empresas.some((e) => e.id === empresa.id);
  gravar({
    ...dados,
    empresas: existe
      ? empresas.map((e) => (e.id === empresa.id ? empresa : e))
      : [...empresas, empresa],
    ativaId: ativaId ?? empresa.id,
  });
}

export function removerEmpresa(id: string) {
  const dados = ler();
  const restantes = dados.empresas.filter((e) => e.id !== id);
  const { ativaId } = dados;
  gravar({
    ...dados,
    empresas: restantes,
    ativaId: ativaId === id ? (restantes[0]?.id ?? null) : ativaId,
  });
}

/** Troca a empresa que as telas mostram. */
export function abrirEmpresa(id: string) {
  const dados = ler();
  if (dados.empresas.some((e) => e.id === id)) gravar({ ...dados, ativaId: id });
}

/** Cria ou atualiza uma venda (pelo id) dentro da empresa. */
export function salvarVenda(empresaId: string, venda: Venda) {
  alterarVendas(empresaId, (vendas) =>
    vendas.some((v) => v.id === venda.id)
      ? vendas.map((v) => (v.id === venda.id ? venda : v))
      : [...vendas, venda],
  );
}

/** Acrescenta várias vendas de uma vez, como as de uma planilha. */
export function adicionarVendas(empresaId: string, novas: Venda[]) {
  alterarVendas(empresaId, (vendas) => [...vendas, ...novas]);
}

export function removerVenda(empresaId: string, vendaId: string) {
  alterarVendas(empresaId, (vendas) => vendas.filter((v) => v.id !== vendaId));
}

function alterarVendas(empresaId: string, alterar: (vendas: Venda[]) => Venda[]) {
  const dados = ler();
  gravar({
    ...dados,
    empresas: dados.empresas.map((e) =>
      e.id === empresaId ? { ...e, vendas: alterar(e.vendas) } : e,
    ),
  });
}

/** Coloca (ou recoloca do zero) a empresa de exemplo e a deixa aberta. */
export function carregarExemplo() {
  const exemplo = criarEmpresaExemplo();
  salvarEmpresa(exemplo);
  abrirEmpresa(exemplo.id);
}

/** "Apagar meus dados": remove tudo o que a Prévia guardou neste computador. */
export function apagarTudo() {
  cache = VAZIO;
  localStorage.removeItem(CHAVE);
  ouvintes.forEach((avisar) => avisar());
}
