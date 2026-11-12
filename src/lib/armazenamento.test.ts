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
    /** Tudo o que está guardado, para conferir o que nunca pode aparecer. */
    tudo: () => [...itens.values()].join("\n"),
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
  await app.criarConta("Ana", "ana@padaria.com.br", "senha-da-ana");
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

describe("dados da conta aberta", () => {
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
    expect(reaberto.lerConta()?.nome).toBe("Ana");
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

  it("pedir aviso guarda o e-mail de cada recurso sem mexer nas empresas", () => {
    app.carregarExemplo();
    app.pedirAviso("nfe", "ana@padaria.com.br");
    app.pedirAviso("credito", "financeiro@padaria.com.br");
    const dados = app.lerDados();
    expect(dados.empresas).toHaveLength(1);
    expect(dados.avisos).toEqual({ nfe: "ana@padaria.com.br", credito: "financeiro@padaria.com.br" });
  });

  it("dado estragado no computador é tratado como vazio", async () => {
    const id = app.lerConta()!.id;
    localStorage.setItem(`previa:dados:${id}`, "{isso não é json");
    const reaberto = await abrirApp();
    expect(reaberto.lerDados()).toEqual({ empresas: [], ativaId: null });
  });
});

describe("contas", () => {
  it("entrar confere e-mail e senha", async () => {
    app.sair();
    expect(app.lerConta()).toBeNull();
    expect(await app.entrar("ana@padaria.com.br", "senha-errada")).toBe(false);
    expect(await app.entrar("outra@padaria.com.br", "senha-da-ana")).toBe(false);
    expect(app.lerConta()).toBeNull();
    expect(await app.entrar("ana@padaria.com.br", "senha-da-ana")).toBe(true);
    expect(app.lerConta()).toMatchObject({ nome: "Ana", email: "ana@padaria.com.br" });
  });

  it("a senha nunca fica guardada como texto", () => {
    expect((localStorage as unknown as { tudo: () => string }).tudo()).not.toContain("senha-da-ana");
  });

  it("um e-mail só tem uma conta", async () => {
    app.sair();
    expect(await app.criarConta("Outra Ana", "ana@padaria.com.br", "outra-senha")).toBe(false);
  });

  it("cada conta vê só os próprios dados", async () => {
    app.carregarExemplo();
    app.sair();
    await app.criarConta("Bruno", "bruno@mercado.com.br", "senha-do-bruno");
    expect(app.lerDados().empresas).toHaveLength(0);

    app.sair();
    await app.entrar("ana@padaria.com.br", "senha-da-ana");
    expect(app.empresaAtiva(app.lerDados())?.nome).toBe("Empresa exemplo");
  });

  it("sair fecha a conta sem apagar nada, e sem conta não há o que gravar", async () => {
    app.carregarExemplo();
    app.sair();
    expect(app.lerDados()).toEqual({ empresas: [], ativaId: null });
    expect(() => app.carregarExemplo()).toThrow();
    await app.entrar("ana@padaria.com.br", "senha-da-ana");
    expect(app.lerDados().empresas).toHaveLength(1);
  });

  it("apagar meus dados apaga a conta aberta e mantém as outras", async () => {
    app.sair();
    await app.criarConta("Bruno", "bruno@mercado.com.br", "senha-do-bruno");
    app.definirPerfil("contador");
    app.apagarConta();

    expect(app.lerConta()).toBeNull();
    expect(await app.entrar("bruno@mercado.com.br", "senha-do-bruno")).toBe(false);
    expect(await app.entrar("ana@padaria.com.br", "senha-da-ana")).toBe(true);
    // O e-mail volta a ficar livre para uma conta nova.
    app.sair();
    expect(await app.criarConta("Bruno", "bruno@mercado.com.br", "nova-senha")).toBe(true);
    expect(app.lerDados()).toEqual({ empresas: [], ativaId: null });
  });

  it("a primeira conta fica com os dados da versão sem contas", async () => {
    vi.stubGlobal("localStorage", localStorageFalso());
    localStorage.setItem(
      "previa:dados",
      JSON.stringify({ empresas: [criarEmpresaExemplo()], ativaId: "exemplo", perfil: "contador", acesso: { email: "x@y.com", aberto: true } }),
    );
    const novo = await abrirApp();
    await novo.criarConta("Ana", "ana@padaria.com.br", "senha-da-ana");
    expect(novo.lerDados()).toEqual({ empresas: [criarEmpresaExemplo()], ativaId: "exemplo", perfil: "contador" });
    expect(localStorage.getItem("previa:dados")).toBeNull();

    // A segunda conta começa vazia.
    novo.sair();
    await novo.criarConta("Bruno", "bruno@mercado.com.br", "senha-do-bruno");
    expect(novo.lerDados().empresas).toHaveLength(0);
  });
});
