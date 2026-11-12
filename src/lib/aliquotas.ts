import type { Regime } from "./tipos";

/**
 * Alíquota de IBS + CBS usada na simulação, por ano e por regime.
 *
 * PROVISÓRIO: 26,5% é a alíquota de referência estimada para a reforma, e
 * vale para todos os regimes até o time definir os valores oficiais (ver
 * "A definir" em docs/02-escopo.txt). Basta trocar os números desta tabela.
 * MEI e Simples Nacional são os que mais devem mudar: eles pagam IBS e CBS
 * por regras próprias, bem abaixo da alíquota cheia.
 */
const REFERENCIA = 0.265;
const todosOsRegimes = { mei: REFERENCIA, simples: REFERENCIA, presumido: REFERENCIA, real: REFERENCIA };

const TABELA: Record<number, Record<Regime, number>> = {
  2027: todosOsRegimes,
  2028: todosOsRegimes,
  2029: todosOsRegimes,
  2030: todosOsRegimes,
  2031: todosOsRegimes,
  2032: todosOsRegimes,
  2033: todosOsRegimes,
};

const PRIMEIRO_ANO = 2027;
const ULTIMO_ANO = 2033;

/** Ano fora da tabela usa o ano mais próximo dela. */
export function aliquota(ano: number, regime: Regime): number {
  const anoNaTabela = Math.min(Math.max(ano, PRIMEIRO_ANO), ULTIMO_ANO);
  return TABELA[anoNaTabela][regime];
}
