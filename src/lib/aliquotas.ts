import type { Regime } from "./tipos";

/**
 * Alíquota de IBS + CBS usada na simulação, por ano e por regime.
 *
 * PROVISÓRIO: 26,5% é a alíquota de referência estimada para a reforma.
 * Quando o time definir os valores oficiais, basta trocar os números desta
 * tabela (ver "A definir" em docs/02-escopo.txt).
 */
const TABELA: Record<number, Record<Regime, number>> = {
  2027: { simples: 0.265, presumido: 0.265 },
  2028: { simples: 0.265, presumido: 0.265 },
  2029: { simples: 0.265, presumido: 0.265 },
  2030: { simples: 0.265, presumido: 0.265 },
  2031: { simples: 0.265, presumido: 0.265 },
  2032: { simples: 0.265, presumido: 0.265 },
  2033: { simples: 0.265, presumido: 0.265 },
};

const PRIMEIRO_ANO = 2027;
const ULTIMO_ANO = 2033;

/** Ano fora da tabela usa o ano mais próximo dela. */
export function aliquota(ano: number, regime: Regime): number {
  const anoNaTabela = Math.min(Math.max(ano, PRIMEIRO_ANO), ULTIMO_ANO);
  return TABELA[anoNaTabela][regime];
}
