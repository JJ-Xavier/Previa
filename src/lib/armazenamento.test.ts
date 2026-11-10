import { beforeEach, describe, expect, it, vi } from "vitest";
import { resumoDoMes } from "./calculo";
import { criarEmpresaExemplo } from "./exemplo";
import type { Empresa, Venda } from "./tipos";

/** localStorage de mentira: os testes rodam no Node, que não tem navegador. */
function localStorageFalso() {
  const itens = new Map<string, string>();
  return {
    getItem: (chave: string) => itens.get(chave) ?? null,
    setItem: (chave: string, valor: string) => {
      itens.set(chave, valor);
    },
    removeItem: (chave: string) => {
      itens.delete(chave);
    },
  };
}

/** Simula fechar e abrir o app: o módulo esquece o que tinha em memória. */
async function abrirApp() {
  vi.resetModules();
  return import("./armazenamento");
}

let app: Awaited<ReturnType<typeof abrirApp>>;

beforeEach(async () => {
  vi.stubGlobal("localStorage", localStorageFalso());
  app = await abrirApp();
});

function empresa(id: string, nome: string): Empresa {
  return { id, nome, cnpj: "", regime: "simples", prazoMedioDias: 30, vendas: [] };
}

const vendaDeMarco: Venda = {
  id: "nova",
  cliente: "Padaria Pão Quente",
  valor: 1_000_000,
  dataVenda: "2027-03-10",
  dataRecebimento: "2027-03-10",
};

describe("armazenamento", () => {
  it("começa vazio", () => {
    expect(app.lerDados()).toEqual({ empresas: [], ativaId: null });
  });

  it("carregar exemplo deixa a empresa exemplo aberta", () => {
    app.carregarExemplo();
    const ativa = app.empresaAtiva(app.lerDados());
    expect(ativa?.nome).toBe("Empresa exemplo");
    expect(ativa?.vendas).toHaveLength(36);
  });

  it("os dados continuam lá depois de fechar e abrir o app", async () => {
    app.carregarExemplo();
    const reaberto = await abrirApp();
    expect(reaberto.empresaAtiva(reaberto.lerDados())?.nome).toBe("Empresa exemplo");
  });

  it("uma venda lançada muda o mês na hora, e excluir desfaz", () => {
    app.carregarExemplo();
    const marco = () => resumoDoMes(app.empresaAtiva(app.lerDados())!, "2027-03").recebido;

    app.salvarVenda("exemplo", vendaDeMarco);
    expect(marco()).toBe(5_800_000);

    app.removerVenda("exemplo", "nova");
    expect(marco()).toBe(4_800_000);
  });

  it("salvar uma venda que já existe edita, sem duplicar", () => {
    app.carregarExemplo();
    app.salvarVenda("exemplo", vendaDeMarco);
    app.salvarVenda("exemplo", { ...vendaDeMarco, valor: 500_000 });
    const vendas = app.empresaAtiva(app.lerDados())!.vendas.filter((v) => v.id === "nova");
    expect(vendas).toEqual([{ ...vendaDeMarco, valor: 500_000 }]);
  });

  it("carregar exemplo de novo volta as vendas do exemplo ao original", () => {
    app.carregarExemplo();
    app.salvarVenda("exemplo", vendaDeMarco);
    app.carregarExemplo();
    expect(app.lerDados().empresas).toEqual([criarEmpresaExemplo()]);
  });

  it("o contador troca de cliente e cada um tem suas vendas", () => {
    app.salvarEmpresa(empresa("a", "Cliente A"));
    app.salvarEmpresa(empresa("b", "Cliente B"));
    expect(app.lerDados().ativaId).toBe("a");

    app.abrirEmpresa("b");
    app.salvarVenda("b", vendaDeMarco);
    const [a, b] = app.lerDados().empresas;
    expect(a.vendas).toHaveLength(0);
    expect(b.vendas).toHaveLength(1);
    expect(app.empresaAtiva(app.lerDados())?.nome).toBe("Cliente B");
  });

  it("remover o cliente aberto abre o próximo", () => {
    app.salvarEmpresa(empresa("a", "Cliente A"));
    app.salvarEmpresa(empresa("b", "Cliente B"));
    app.removerEmpresa("a");
    expect(app.lerDados().ativaId).toBe("b");
    app.removerEmpresa("b");
    expect(app.lerDados()).toEqual({ empresas: [], ativaId: null });
  });

  it("o perfil escolhido continua depois de salvar e remover empresas", async () => {
    app.definirPerfil("contador");
    app.salvarEmpresa(empresa("a", "Cliente A"));
    app.salvarEmpresa(empresa("b", "Cliente B"));
    app.removerEmpresa("a");
    app.carregarExemplo();
    const reaberto = await abrirApp();
    expect(reaberto.lerDados().perfil).toBe("contador");
  });

  it("apagar meus dados limpa o computador, inclusive o perfil", async () => {
    app.definirPerfil("contador");
    app.carregarExemplo();
    app.apagarTudo();
    expect(app.lerDados()).toEqual({ empresas: [], ativaId: null });
    const reaberto = await abrirApp();
    expect(reaberto.lerDados().empresas).toHaveLength(0);
  });

  it("dado estragado no computador é tratado como vazio", async () => {
    localStorage.setItem("previa:dados", "{isso não é json");
    const reaberto = await abrirApp();
    expect(reaberto.lerDados()).toEqual({ empresas: [], ativaId: null });
  });
});
