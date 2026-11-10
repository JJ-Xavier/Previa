import { describe, expect, it } from "vitest";
import { cnpjValido, formatarCnpj, lerData, lerValor, validarEmail, validarEmpresa, validarVenda } from "./entrada";
import { lerPlanilha, modeloDaPlanilha, textoDoArquivo } from "./planilha";

describe("lerValor", () => {
  it("entende os jeitos comuns de escrever dinheiro", () => {
    expect(lerValor("10.000,00")).toBe(1_000_000);
    expect(lerValor("R$ 10.000,00")).toBe(1_000_000);
    expect(lerValor("10000")).toBe(1_000_000);
    expect(lerValor("10.000")).toBe(1_000_000);
    expect(lerValor("3500,5")).toBe(350_050);
    expect(lerValor("927.50")).toBe(92_750);
  });

  it("recusa texto, zero e negativo", () => {
    expect(lerValor("")).toBeNull();
    expect(lerValor("abc")).toBeNull();
    expect(lerValor("0")).toBeNull();
    expect(lerValor("-10")).toBeNull();
    expect(lerValor("10,999")).toBeNull();
  });
});

describe("lerData", () => {
  it("entende dia/mês/ano e o formato do campo de data", () => {
    expect(lerData("15/03/2027")).toBe("2027-03-15");
    expect(lerData("5/3/27")).toBe("2027-03-05");
    expect(lerData("2027-03-15")).toBe("2027-03-15");
    expect(lerData("29/02/2028")).toBe("2028-02-29");
  });

  it("recusa data que não existe", () => {
    expect(lerData("31/02/2027")).toBeNull();
    expect(lerData("15/13/2027")).toBeNull();
    expect(lerData("ontem")).toBeNull();
  });
});

describe("CNPJ", () => {
  it("confere os dígitos verificadores", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
    expect(cnpjValido("11222333000181")).toBe(true);
    expect(cnpjValido("11.222.333/0001-82")).toBe(false);
    expect(cnpjValido("11.111.111/1111-11")).toBe(false);
    expect(cnpjValido("123")).toBe(false);
  });

  it("aceita o CNPJ alfanumérico (exemplo da Receita)", () => {
    expect(cnpjValido("12.ABC.345/01DE-35")).toBe(true);
    expect(cnpjValido("12.abc.345/01de-35")).toBe(true);
  });

  it("formata com pontos, barra e traço", () => {
    expect(formatarCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });
});

const venda = {
  cliente: "Condomínio Jardim das Flores",
  cnpjCliente: "",
  valor: "10.000,00",
  dataVenda: "2027-02-13",
  dataRecebimento: "2027-03-15",
};

describe("validarVenda", () => {
  it("devolve a venda pronta para salvar", () => {
    expect(validarVenda(venda, 30)).toEqual({
      erros: {},
      venda: {
        cliente: "Condomínio Jardim das Flores",
        valor: 1_000_000,
        dataVenda: "2027-02-13",
        dataRecebimento: "2027-03-15",
      },
    });
  });

  it("recebimento em branco usa o prazo médio da empresa", () => {
    expect(validarVenda({ ...venda, dataRecebimento: "" }, 30).venda?.dataRecebimento).toBe("2027-03-15");
  });

  it("aponta cada campo com problema", () => {
    const { erros, venda: salva } = validarVenda(
      { cliente: " ", cnpjCliente: "123", valor: "0", dataVenda: "", dataRecebimento: "" },
      30,
    );
    expect(salva).toBeUndefined();
    expect(Object.keys(erros).sort()).toEqual(["cliente", "cnpjCliente", "dataVenda", "valor"]);
  });

  it("não deixa receber antes de vender", () => {
    const { erros } = validarVenda({ ...venda, dataRecebimento: "2027-02-01" }, 30);
    expect(erros.dataRecebimento).toBe("O recebimento não pode ser antes da venda.");
  });
});

describe("validarEmpresa", () => {
  const empresa = { nome: "Empresa exemplo", cnpj: "11222333000181", regime: "simples" as const, prazoMedioDias: "30" };

  it("devolve os dados com o CNPJ formatado", () => {
    expect(validarEmpresa(empresa).dados).toEqual({
      nome: "Empresa exemplo",
      cnpj: "11.222.333/0001-81",
      regime: "simples",
      prazoMedioDias: 30,
    });
  });

  it("recusa prazo fora de 0 a 365 dias", () => {
    expect(validarEmpresa({ ...empresa, prazoMedioDias: "400" }).erros.prazoMedioDias).toBeDefined();
    expect(validarEmpresa({ ...empresa, prazoMedioDias: "2,5" }).erros.prazoMedioDias).toBeDefined();
    expect(validarEmpresa({ ...empresa, prazoMedioDias: "0" }).dados?.prazoMedioDias).toBe(0);
  });
});

describe("planilha", () => {
  const modelo = modeloDaPlanilha();

  it("o modelo tem só o cabeçalho, com ponto e vírgula", () => {
    expect(modelo).toBe(
      "﻿Cliente;CNPJ do cliente (opcional);Valor;Data da venda;Data do recebimento (opcional)\r\n",
    );
  });

  it("lê as vendas do modelo preenchido", () => {
    const texto = `${modelo}Escritório Central;;6.800,00;06/03/2027;05/04/2027\r\nRestaurante Sabor do Cerrado;11.222.333/0001-81;4200;22/03/2027;\r\n;;;;\r\n`;
    expect(lerPlanilha(texto, 0)).toEqual({
      erros: [],
      vendas: [
        { cliente: "Escritório Central", valor: 680_000, dataVenda: "2027-03-06", dataRecebimento: "2027-04-05" },
        {
          cliente: "Restaurante Sabor do Cerrado",
          cnpjCliente: "11.222.333/0001-81",
          valor: 420_000,
          dataVenda: "2027-03-22",
          dataRecebimento: "2027-03-22",
        },
      ],
    });
  });

  it("aceita vírgula como separador, com o valor entre aspas", () => {
    const { vendas } = lerPlanilha('Cliente,CNPJ,Valor,Venda,Recebimento\n"Loja Casa & Obra",,"11.500,00",2027-02-26,2027-03-28', 30);
    expect(vendas[0].valor).toBe(1_150_000);
  });

  it("aponta o número da linha de cada erro", () => {
    const texto = `${modelo}Escritório Central;;6.800,00;06/03/2027;\r\n;;abc;31/02/2027;\r\n`;
    expect(lerPlanilha(texto, 30).erros).toEqual([
      "Linha 3: Falta o nome do cliente. O valor precisa ser maior que zero, como 10.000,00. Data da venda inválida. Use dia/mês/ano.",
    ]);
  });

  it("avisa quando a planilha está vazia", () => {
    expect(lerPlanilha(modelo, 30).erros).toEqual([
      "A planilha não tem nenhuma venda. Preencha a partir da linha 2.",
    ]);
  });

  it("lê arquivo salvo pelo Excel em Windows-1252", () => {
    const bytes = new Uint8Array([0x45, 0x73, 0x63, 0x72, 0x69, 0x74, 0xf3, 0x72, 0x69, 0x6f]); // "Escritório"
    expect(textoDoArquivo(bytes.buffer)).toBe("Escritório");
    expect(textoDoArquivo(new TextEncoder().encode("Escritório").buffer)).toBe("Escritório");
  });
});

describe("validarEmail", () => {
  it("tira espaços e passa para minúsculas", () => {
    expect(validarEmail("  Ana@Padaria.com.BR ")).toEqual({ email: "ana@padaria.com.br" });
  });

  it("recusa vazio e e-mail incompleto", () => {
    expect(validarEmail(" ").erro).toBe("Falta o e-mail.");
    expect(validarEmail("ana@padaria").erro).toBeDefined();
    expect(validarEmail("ana padaria@x.com").erro).toBeDefined();
  });
});
