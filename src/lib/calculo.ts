import { aliquota } from "./aliquotas";
import { mesDe, somarMeses } from "./datas";
import type { Centavos, Empresa, Mes, Regime, ResumoDoMes, Venda } from "./tipos";

/**
 * Divide uma venda entre o governo e a empresa. O imposto é retido no dia do
 * recebimento, então vale a alíquota do ano em que o dinheiro cai na conta.
 */
export function dividirVenda(venda: Venda, regime: Regime) {
  const ano = Number(venda.dataRecebimento.slice(0, 4));
  const governo = Math.round(venda.valor * aliquota(ano, regime));
  return { governo, ficaComVoce: venda.valor - governo };
}

/** Soma as vendas recebidas no mês. */
export function resumoDoMes(empresa: Empresa, mes: Mes): ResumoDoMes {
  let recebido = 0;
  let governo = 0;
  for (const venda of empresa.vendas) {
    if (mesDe(venda.dataRecebimento) !== mes) continue;
    recebido += venda.valor;
    governo += dividirVenda(venda, empresa.regime).governo;
  }
  return { mes, recebido, governo, ficaComVoce: recebido - governo };
}

/** Um resumo por mês, a partir de `inicio`. Mês sem recebimento aparece zerado. */
export function projecao(empresa: Empresa, inicio: Mes, meses: number): ResumoDoMes[] {
  return Array.from({ length: meses }, (_, i) => resumoDoMes(empresa, somarMeses(inicio, i)));
}

/** Soma de todos os meses, para a linha de total da tabela. */
export function totais(resumos: ResumoDoMes[]) {
  let recebido = 0;
  let governo = 0;
  for (const r of resumos) {
    recebido += r.recebido;
    governo += r.governo;
  }
  return { recebido, governo, ficaComVoce: recebido - governo };
}

/** O mês em que mais dinheiro fica retido. Em empate, o primeiro. Sem retenção, undefined. */
export function mesDeMaiorRetencao(resumos: ResumoDoMes[]): ResumoDoMes | undefined {
  let maior: ResumoDoMes | undefined;
  for (const r of resumos) {
    if (r.governo > (maior?.governo ?? 0)) maior = r;
  }
  return maior;
}

/**
 * Capital de giro que some: a média do que vai para o governo por mês. É o
 * dinheiro que hoje fica no caixa até a guia vencer. Meses sem recebimento
 * não entram na média, para a projeção de 12 meses não diluir o valor.
 */
export function capitalDeGiroMedio(resumos: ResumoDoMes[]): Centavos {
  const comRecebimento = resumos.filter((r) => r.recebido > 0);
  if (comRecebimento.length === 0) return 0;
  return Math.round(totais(comRecebimento).governo / comRecebimento.length);
}
