import { somarDias } from "./datas";
import type { Empresa, Venda } from "./tipos";

/**
 * Empresa fictícia do botão "Carregar exemplo", com recebimentos de janeiro a
 * junho de 2027. Os números são os mesmos do canvas: 44, 46, 48, 50, 52 e
 * 48 mil reais por mês, com maio como o mês de maior retenção.
 */

// Contratos que se repetem todo mês: cliente, dia do pagamento, valor em reais
// e prazo em dias entre a venda e o pagamento (0 = à vista). Somam R$ 36.500.
const CONTRATOS: [string, number, number, number][] = [
  ["Escritório Central", 5, 6_800, 30],
  ["Condomínio Parque Sul", 10, 3_500, 30],
  ["Condomínio Jardim das Flores", 15, 10_000, 30],
  ["Restaurante Sabor do Cerrado", 22, 4_200, 0],
  ["Clínica Vida Plena", 25, 12_000, 30],
];

// A loja compra conforme as obras, então o valor muda a cada mês. Paga no dia 28.
const LOJA = "Loja Casa & Obra";
const COMPRAS_DA_LOJA: Record<string, number> = {
  "2027-01": 7_500,
  "2027-02": 9_500,
  "2027-03": 11_500,
  "2027-04": 13_500,
  "2027-05": 15_500,
  "2027-06": 11_500,
};

export const ID_EMPRESA_EXEMPLO = "exemplo";

export function criarEmpresaExemplo(): Empresa {
  const vendas: Venda[] = [];

  function lancar(cliente: string, recebimento: string, reais: number, prazo: number) {
    vendas.push({
      id: `exemplo-${vendas.length + 1}`,
      cliente,
      valor: reais * 100,
      dataVenda: somarDias(recebimento, -prazo),
      dataRecebimento: recebimento,
    });
  }

  for (const [mes, compraDaLoja] of Object.entries(COMPRAS_DA_LOJA)) {
    for (const [cliente, dia, reais, prazo] of CONTRATOS) {
      lancar(cliente, `${mes}-${String(dia).padStart(2, "0")}`, reais, prazo);
    }
    lancar(LOJA, `${mes}-28`, compraDaLoja, 30);
  }

  return {
    id: ID_EMPRESA_EXEMPLO,
    nome: "Empresa exemplo",
    cnpj: "11.222.333/0001-81",
    regime: "simples",
    prazoMedioDias: 30,
    vendas,
  };
}
