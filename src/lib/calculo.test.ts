import { describe, expect, it } from "vitest";
import { aliquota } from "./aliquotas";
import {
  capitalDeGiroMedio,
  dividirValor,
  dividirVenda,
  inicioDaJanela,
  mesDeMaiorRetencao,
  periodoComRecebimento,
  projecao,
  resumoDoMes,
  totais,
} from "./calculo";
import { somarDias, somarMeses } from "./datas";
import { criarEmpresaExemplo } from "./exemplo";
import { intervaloDeMeses, mesCurto, nomeDoMes, reais, reaisCompacto } from "./formatar";
import type { Venda } from "./tipos";

const exemplo = criarEmpresaExemplo();

/** Converte para reais, para comparar com os números do canvas. */
const emReais = (r: { recebido: number; governo: number; ficaComVoce: number }) => [
  r.recebido / 100,
  r.governo / 100,
  r.ficaComVoce / 100,
];

function venda(valorEmReais: number, dataRecebimento: string): Venda {
  return {
    id: "v",
    cliente: "Cliente",
    valor: valorEmReais * 100,
    dataVenda: dataRecebimento,
    dataRecebimento,
  };
}

describe("dividirVenda", () => {
  it("separa R$ 10.000 em R$ 2.650 para o governo e R$ 7.350 com você", () => {
    expect(dividirVenda(venda(10_000, "2027-03-15"), "simples")).toEqual({
      governo: 265_000,
      ficaComVoce: 735_000,
    });
  });

  it("mantém os centavos: R$ 3.500 retém R$ 927,50", () => {
    expect(dividirVenda(venda(3_500, "2027-04-10"), "simples").governo).toBe(92_750);
  });
});

describe("com os dados de exemplo", () => {
  it("março mostra R$ 48.000 recebidos, R$ 12.720 para o governo e R$ 35.280 com a empresa", () => {
    expect(emReais(resumoDoMes(exemplo, "2027-03"))).toEqual([48_000, 12_720, 35_280]);
  });

  it("bate com a tabela mês a mês do canvas", () => {
    const resumos = projecao(exemplo, "2027-01", 6);
    expect(resumos.map((r) => [r.mes, ...emReais(r)])).toEqual([
      ["2027-01", 44_000, 11_660, 32_340],
      ["2027-02", 46_000, 12_190, 33_810],
      ["2027-03", 48_000, 12_720, 35_280],
      ["2027-04", 50_000, 13_250, 36_750],
      ["2027-05", 52_000, 13_780, 38_220],
      ["2027-06", 48_000, 12_720, 35_280],
    ]);
    expect(emReais(totais(resumos))).toEqual([288_000, 76_320, 211_680]);
  });

  it("maio é o mês de maior retenção, com R$ 13.780", () => {
    const maior = mesDeMaiorRetencao(projecao(exemplo, "2027-01", 6));
    expect(maior?.mes).toBe("2027-05");
    expect(maior?.governo).toBe(1_378_000);
  });

  it("o capital de giro que some é R$ 12.720 por mês", () => {
    expect(capitalDeGiroMedio(projecao(exemplo, "2027-01", 6))).toBe(1_272_000);
  });

  it("na projeção de 12 meses, os meses sem venda não diluem o capital de giro", () => {
    const resumos = projecao(exemplo, "2027-01", 12);
    expect(resumos).toHaveLength(12);
    expect(resumos[11]).toEqual({ mes: "2027-12", recebido: 0, governo: 0, ficaComVoce: 0 });
    expect(capitalDeGiroMedio(resumos)).toBe(1_272_000);
  });

  it("a data da venda é o recebimento menos o prazo do cliente", () => {
    const jardim = exemplo.vendas.find((v) => v.dataRecebimento === "2027-03-15");
    expect(jardim?.cliente).toBe("Condomínio Jardim das Flores");
    expect(jardim?.dataVenda).toBe("2027-02-13");
    const restaurante = exemplo.vendas.find((v) => v.dataRecebimento === "2027-03-22");
    expect(restaurante?.dataVenda).toBe("2027-03-22");
  });
});

describe("janela do Painel e da Projeção", () => {
  const periodo = periodoComRecebimento(exemplo)!;

  it("o exemplo recebe de janeiro a junho de 2027", () => {
    expect(periodo).toEqual({ primeiro: "2027-01", ultimo: "2027-06" });
  });

  it("antes das vendas, a janela começa no primeiro recebimento", () => {
    expect(inicioDaJanela(periodo, "2026-11", 6)).toBe("2027-01");
    expect(inicioDaJanela(periodo, "2026-11", 12)).toBe("2027-01");
  });

  it("no meio das vendas, a janela começa no mês atual", () => {
    const longo = { primeiro: "2027-01", ultimo: "2027-12" };
    expect(inicioDaJanela(longo, "2027-04", 6)).toBe("2027-04");
  });

  it("perto do fim das vendas, a janela volta para não sobrar mês vazio", () => {
    expect(inicioDaJanela(periodo, "2027-05", 6)).toBe("2027-01");
    expect(inicioDaJanela({ primeiro: "2026-01", ultimo: "2026-06" }, "2026-11", 6)).toBe("2026-01");
  });

  it("dividirValor dá os R$ 73,50 de cada R$ 100", () => {
    expect(dividirValor(10_000, "2027-03", "simples")).toEqual({ governo: 2_650, ficaComVoce: 7_350 });
  });
});

describe("sem vendas", () => {
  const vazia = { ...exemplo, vendas: [] };

  it("não tem período, mês de maior retenção nem capital de giro", () => {
    expect(periodoComRecebimento(vazia)).toBeUndefined();
    const resumos = projecao(vazia, "2027-01", 6);
    expect(mesDeMaiorRetencao(resumos)).toBeUndefined();
    expect(capitalDeGiroMedio(resumos)).toBe(0);
    expect(capitalDeGiroMedio([])).toBe(0);
  });
});

describe("alíquota", () => {
  it("usa 26,5% provisório nos dois regimes", () => {
    expect(aliquota(2027, "simples")).toBe(0.265);
    expect(aliquota(2030, "presumido")).toBe(0.265);
  });

  it("ano fora da tabela usa o ano mais próximo", () => {
    expect(aliquota(2026, "simples")).toBe(aliquota(2027, "simples"));
    expect(aliquota(2040, "simples")).toBe(aliquota(2033, "simples"));
  });
});

describe("datas", () => {
  it("soma dias atravessando o ano", () => {
    expect(somarDias("2027-01-05", -30)).toBe("2026-12-06");
    expect(somarDias("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("soma meses atravessando o ano", () => {
    expect(somarMeses("2027-12", 1)).toBe("2028-01");
    expect(somarMeses("2027-01", 11)).toBe("2027-12");
  });
});

describe("formatar", () => {
  // O Intl usa espaço não separável depois do "R$"; aqui ele vira espaço comum.
  const texto = (s: string) => s.replace(/\s/g, " ");

  it("mostra reais com e sem centavos", () => {
    expect(texto(reais(4_800_000))).toBe("R$ 48.000,00");
    expect(texto(reais(92_750))).toBe("R$ 927,50");
    expect(texto(reais(3_528_000, { centavos: false }))).toBe("R$ 35.280");
  });

  it("escreve o mês por extenso", () => {
    expect(nomeDoMes("2027-03")).toBe("março de 2027");
    expect(nomeDoMes("2027-03", { ano: false })).toBe("março");
    expect(mesCurto("2027-03")).toBe("mar");
  });

  it("escreve o intervalo da projeção", () => {
    expect(intervaloDeMeses("2027-01", "2027-06")).toBe("Janeiro a junho de 2027");
    expect(intervaloDeMeses("2027-07", "2028-06")).toBe("Julho de 2027 a junho de 2028");
  });

  it("encurta valores para o gráfico", () => {
    expect(texto(reaisCompacto(3_234_000))).toBe("32,3 mil");
    expect(texto(reaisCompacto(3_528_000))).toBe("35,3 mil");
  });
});
