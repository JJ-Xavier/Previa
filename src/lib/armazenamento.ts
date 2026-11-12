import { useSyncExternalStore } from "react";
import { criarEmpresaExemplo } from "./exemplo";
import type { Empresa, Venda } from "./tipos";

/**
 * Único lugar do app que lê e grava os dados, hoje no localStorage. As telas
 * usam só as funções daqui. Para trocar por um servidor depois, mexe-se só
 * neste arquivo.
 *
 * Cada conta tem os próprios dados. No computador ficam:
 * - previa:contas, a lista de contas, com a senha cifrada;
 * - previa:sessao, o id da conta aberta (some ao sair);
 * - previa:dados:<id da conta>, as empresas, o perfil e os avisos da conta.
 */

/** Empresário acompanha a própria empresa; contador acompanha vários clientes. */
export type Perfil = "empresario" | "contador";

export type Dados = {
  empresas: Empresa[];
  /** Empresa que as telas mostram. Para o contador, é o cliente aberto. */
  ativaId: string | null;
  /** Escolhido no primeiro acesso. Dados antigos, sem perfil, contam como empresário. */
  perfil?: Perfil;
  /** "Quero ser avisado": o e-mail deixado em cada recurso que ainda não existe. */
  avisos?: Record<string, string>;
};

/** O que as telas sabem da conta aberta. A senha nunca sai deste arquivo. */
export type Conta = { id: string; nome: string; email: string };

type ContaGuardada = Conta & { sal: string; senha: string };

type Estado = { contas: ContaGuardada[]; conta: Conta | null; dados: Dados };

const CONTAS = "previa:contas";
const SESSAO = "previa:sessao";
const dadosDa = (contaId: string) => `previa:dados:${contaId}`;
/** Onde a versão sem contas (até a 0.1.0) guardava tudo. */
const ANTIGO = "previa:dados";

const VAZIO: Dados = { empresas: [], ativaId: null };
const SEM_COMPUTADOR: Estado = { contas: [], conta: null, dados: VAZIO };

let estado: Estado | null = null;
const ouvintes = new Set<() => void>();

function carregar(): Estado {
  if (typeof localStorage === "undefined") return SEM_COMPUTADOR;
  if (estado) return estado;
  const contas = lerJson<ContaGuardada[]>(CONTAS, [], Array.isArray);
  const aberta = contas.find((c) => c.id === localStorage.getItem(SESSAO));
  estado = {
    contas,
    conta: aberta ? { id: aberta.id, nome: aberta.nome, email: aberta.email } : null,
    dados: aberta ? lerJson(dadosDa(aberta.id), VAZIO, temEmpresas) : VAZIO,
  };
  return estado;
}

/** Dado salvo estragado ou de outro formato vira o padrão. */
function lerJson<T>(chave: string, padrao: T, valido: (salvo: unknown) => boolean): T {
  try {
    const salvo = JSON.parse(localStorage.getItem(chave) ?? "null");
    if (valido(salvo)) return salvo as T;
  } catch {}
  return padrao;
}

const temEmpresas = (salvo: unknown) => Array.isArray((salvo as Dados | null)?.empresas);

/** Depois de mexer no computador: lê de novo e avisa as telas. */
function recarregar() {
  estado = null;
  ouvintes.forEach((avisar) => avisar());
}

function gravar(dados: Dados) {
  const { conta } = carregar();
  if (!conta) throw new Error("Nenhuma conta aberta para gravar os dados.");
  localStorage.setItem(dadosDa(conta.id), JSON.stringify(dados));
  estado = { ...carregar(), dados };
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

/**
 * Dados da conta aberta, para usar nas telas. A tela atualiza sozinha quando
 * eles mudam. Devolve null no primeiro render, antes de ler o computador:
 * nesse caso a tela não mostra nada, em vez de piscar o estado vazio.
 */
export function useDados(): Dados | null {
  return useSyncExternalStore(assinar, () => carregar().dados, () => null);
}

/** A conta aberta. undefined antes de ler o computador; null sem ninguém dentro. */
export function useConta(): Conta | null | undefined {
  return useSyncExternalStore(assinar, () => carregar().conta, () => undefined);
}

/** Os mesmos dados, fora de um componente. */
export function lerDados(): Dados {
  return carregar().dados;
}

export function lerConta(): Conta | null {
  return carregar().conta;
}

// ---------- Contas ----------

/**
 * Cria a conta e já entra nela. Devolve false se o e-mail já tiver conta
 * neste computador. Nome, e-mail e senha chegam validados.
 */
export async function criarConta(nome: string, email: string, senha: string): Promise<boolean> {
  if (carregar().contas.some((c) => c.email === email)) return false;
  const sal = aleatorio();
  const nova: ContaGuardada = { id: novoId(), nome, email, sal, senha: await cifrar(senha, sal) };

  const { contas } = carregar();
  localStorage.setItem(CONTAS, JSON.stringify([...contas, nova]));
  // A primeira conta fica com o que a versão sem contas tinha guardado.
  if (contas.length === 0) trazerDadosAntigos(nova.id);
  localStorage.setItem(SESSAO, nova.id);
  recarregar();
  return true;
}

/** Entra se o e-mail e a senha conferem. Devolve false sem dizer qual dos dois errou. */
export async function entrar(email: string, senha: string): Promise<boolean> {
  const conta = carregar().contas.find((c) => c.email === email);
  if (!conta || (await cifrar(senha, conta.sal)) !== conta.senha) return false;
  localStorage.setItem(SESSAO, conta.id);
  recarregar();
  return true;
}

/** Fecha a conta sem apagar nada. */
export function sair() {
  localStorage.removeItem(SESSAO);
  recarregar();
}

/** "Apagar meus dados": apaga a conta aberta e tudo dela. As outras contas ficam. */
export function apagarConta() {
  const { contas, conta } = carregar();
  if (!conta) return;
  localStorage.removeItem(dadosDa(conta.id));
  localStorage.setItem(CONTAS, JSON.stringify(contas.filter((c) => c.id !== conta.id)));
  localStorage.removeItem(SESSAO);
  recarregar();
}

function trazerDadosAntigos(contaId: string) {
  const antigos: Dados & { acesso?: unknown } = lerJson(ANTIGO, VAZIO, temEmpresas);
  if (antigos.empresas.length > 0 || antigos.perfil) {
    // O acesso antigo era só um e-mail, sem senha: a conta nova toma o lugar dele.
    const dados = { ...antigos };
    delete dados.acesso;
    localStorage.setItem(dadosDa(contaId), JSON.stringify(dados));
  }
  localStorage.removeItem(ANTIGO);
}

/**
 * A senha nunca é guardada: só o resultado do PBKDF2 com um sal por conta.
 * Sem servidor, quem mexe no computador ainda pode ler os dados; a senha
 * separa as contas, não protege contra isso.
 */
async function cifrar(senha: string, sal: string): Promise<string> {
  const texto = new TextEncoder();
  const chave = await crypto.subtle.importKey("raw", texto.encode(senha), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: texto.encode(sal), iterations: 100_000 },
    chave,
    256,
  );
  return emHexa(new Uint8Array(bits));
}

const aleatorio = () => emHexa(crypto.getRandomValues(new Uint8Array(16)));
const emHexa = (bytes: Uint8Array) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

export function novoId(): string {
  return crypto.randomUUID();
}

// ---------- Dados da conta aberta ----------

export function empresaAtiva(dados: Dados): Empresa | null {
  return dados.empresas.find((e) => e.id === dados.ativaId) ?? null;
}

export function definirPerfil(perfil: Perfil) {
  gravar({ ...lerDados(), perfil });
}

/** Guarda o e-mail na lista de espera de um recurso "em breve". */
export function pedirAviso(recurso: string, email: string) {
  const dados = lerDados();
  gravar({ ...dados, avisos: { ...dados.avisos, [recurso]: email } });
}

/** Cria ou atualiza a empresa (pelo id). Se nenhuma estiver ativa, ela passa a ser. */
export function salvarEmpresa(empresa: Empresa) {
  const dados = lerDados();
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
  const dados = lerDados();
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
  const dados = lerDados();
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
  const dados = lerDados();
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
