import { aliquota } from "./aliquotas";
import { limitar, mesDe, somarMeses } from "./datas";
import type { Centavos, Empresa, Mes, Regime, ResumoDoMes, Venda } from "./tipos";

/** Divide um valor recebido no `mes` entre o governo e a empresa. */
export function dividirValor(valor: Centavos, mes: Mes, regime: Regime) {
  const governo = Math.round(valor * aliquota(Number(mes.slice(0, 4)), regime));
  return { governo, ficaComVoce: valor - governo };
}

/**
 * Divide uma venda entre o governo e a empresa. O imposto é retido no dia do
 * recebimento, então vale a alíquota do ano em que o dinheiro cai na conta.
 */
export function dividirVenda(venda: Venda, regime: Regime) {
  return dividirValor(venda.valor, mesDe(venda.dataRecebimento), regime);
}

/** Primeiro e último mês em que entra dinheiro. Sem vendas, undefined. */
export function periodoComRecebimento(empresa: Empresa) {
  const meses = empresa.vendas.map((v) => mesDe(v.dataRecebimento)).sort();
  if (meses.length === 0) return undefined;
  return { primeiro: meses[0], ultimo: meses[meses.length - 1] };
}

export type Periodo = NonNullable<ReturnType<typeof periodoComRecebimento>>;

/**
 * Primeiro mês da janela de `meses` meses do Painel e da Projeção. Começa no
 * mês atual, mas nunca antes do primeiro recebimento. Se as vendas acabam
 * antes do fim da janela, ela volta no tempo para não sobrar mês vazio.
 */
export function inicioDaJanela(periodo: Periodo, mesAtual: Mes, meses: number): Mes {
  const ultimoInicio = somarMeses(periodo.ultimo, -(meses - 1));
  const limite = ultimoInicio > periodo.primeiro ? ultimoInicio : periodo.primeiro;
  return limitar(mesAtual, periodo.primeiro, limite);
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

/**
 * O que o Painel e a lista de clientes mostram de uma empresa: o mês em
 * destaque (o atual, ou o mais próximo com vendas), a janela de seis meses,
 * o mês de maior retenção e o capital de giro. Sem vendas, undefined.
 */
export function visaoGeral(empresa: Empresa, mesAtual: Mes) {
  const periodo = periodoComRecebimento(empresa);
  if (!periodo) return undefined;
  const mes = limitar(mesAtual, periodo.primeiro, periodo.ultimo);
  const inicio = inicioDaJanela(periodo, mesAtual, 6);
  const seisMeses = projecao(empresa, inicio, 6);
  return {
    periodo,
    mes,
    resumo: resumoDoMes(empresa, mes),
    inicio,
    seisMeses,
    maior: mesDeMaiorRetencao(seisMeses),
    capitalDeGiro: capitalDeGiroMedio(seisMeses),
  };
}

export type VisaoGeral = NonNullable<ReturnType<typeof visaoGeral>>;

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
