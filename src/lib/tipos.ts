/** Dinheiro sempre em centavos inteiros: R$ 48.000,00 = 4_800_000. Evita erro de arredondamento. */
export type Centavos = number;

/** Data no formato AAAA-MM-DD, o mesmo de um <input type="date">. */
export type DataISO = string;

/** Mês no formato AAAA-MM. */
export type Mes = string;

export type Regime = "mei" | "simples" | "presumido" | "real";

/** Para quem a empresa vende mais. Muda o formulário de venda, não a conta. */
export type Publico = "empresas" | "consumidor";

export type Venda = {
  id: string;
  cliente: string;
  cnpjCliente?: string;
  valor: Centavos;
  dataVenda: DataISO;
  /** Dia em que o dinheiro cai na conta. É nesse dia que o imposto é retido. */
  dataRecebimento: DataISO;
};

export type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
  regime: Regime;
  /** Empresas cadastradas antes da versão 1.0.2 não têm: contam como "empresas". */
  publico?: Publico;
  /** Dias, em média, entre a venda e o recebimento. */
  prazoMedioDias: number;
  vendas: Venda[];
};

/** Um mês da simulação: quanto entra, quanto vai para o governo e quanto fica. */
export type ResumoDoMes = {
  mes: Mes;
  recebido: Centavos;
  governo: Centavos;
  ficaComVoce: Centavos;
};
