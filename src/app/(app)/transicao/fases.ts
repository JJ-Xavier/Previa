/*
  Fases da reforma tributária, de 2026 a 2033. Conteúdo fixo: conferir na
  Lei Complementar 214/2025 e na Lei Complementar 227/2026 antes de cada versão.
*/
export type Fase = {
  de: number;
  ate: number;
  /** Nome curto, na linha do tempo do topo. */
  curto: string;
  titulo: string;
  texto: string;
  selo: string;
};

export const fases: Fase[] = [
  {
    de: 2026,
    ate: 2026,
    curto: "Teste",
    titulo: "Ano de teste",
    texto:
      "IBS e CBS começam a aparecer nas notas fiscais, com alíquotas de teste. É o momento de entender o impacto e se planejar.",
    selo: "Nada muda ainda",
  },
  {
    de: 2027,
    ate: 2028,
    curto: "Split payment começa",
    titulo: "Começa o split payment",
    texto:
      "A CBS passa a valer no lugar de PIS e Cofins. O split payment começa de forma facultativa, primeiro nas vendas entre empresas: o imposto passa a ser retido na hora do pagamento.",
    selo: "Começa a mudar",
  },
  {
    de: 2029,
    ate: 2032,
    curto: "Troca gradual dos impostos",
    titulo: "Troca gradual",
    texto:
      "ICMS e ISS diminuem um pouco a cada ano e o IBS aumenta na mesma medida. Como as alíquotas mudam todo ano, a retenção também muda.",
    selo: "Muda todo ano",
  },
  {
    de: 2033,
    ate: 2033,
    curto: "Sistema completo",
    titulo: "Sistema novo completo",
    texto: "ICMS e ISS deixam de existir. IBS e CBS passam a valer por completo.",
    selo: "Regra final",
  },
];

export const anosDaFase = ({ de, ate }: Fase) => (de === ate ? String(de) : `${de}–${ate}`);
