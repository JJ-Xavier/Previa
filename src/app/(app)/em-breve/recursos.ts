/*
  O que aparece na tela "em breve", uma por recurso que ainda não existe no
  MVP. A tela é a mesma; só mudam os textos. O endereço é /em-breve/<chave>/.
*/
export type Recurso = {
  titulo: string;
  descricao: string;
  /** Completa "no dia em que ... estiver funcionando". */
  nome: string;
  beneficios: string[];
  enquanto: { texto: string; href: string; rotulo: string };
};

const lancarVendas = {
  texto: "Enquanto isso, lance as vendas à mão ou pela planilha.",
  href: "/vendas/",
  rotulo: "Ir para vendas",
};

export const recursos = {
  nfe: {
    titulo: "Importar notas fiscais automaticamente",
    descricao:
      "A Prévia vai buscar suas notas de venda direto da SEFAZ ou pelo arquivo XML, sem você precisar digitar nada.",
    nome: "a importação de notas",
    beneficios: [
      "Suas vendas entram sozinhas, assim que a nota é emitida.",
      "A simulação do caixa é refeita a cada nota nova.",
      "Menos chance de erro de digitação nos valores e nas datas.",
    ],
    enquanto: lancarVendas,
  },
  banco: {
    titulo: "Conectar a conta do banco",
    descricao:
      "Com a sua autorização, pelo Open Finance, a Prévia vai ler os recebimentos da conta da empresa.",
    nome: "a conexão com o banco",
    beneficios: [
      "Cada recebimento entra com o dia em que o dinheiro caiu de verdade.",
      "Dá para comparar o que a Prévia previu com o que entrou na conta.",
      "Você pode cancelar a autorização quando quiser.",
    ],
    enquanto: lancarVendas,
  },
  erp: {
    titulo: "Trazer as vendas do seu sistema de gestão",
    descricao: "A Prévia vai se conectar ao sistema que você já usa para controlar as vendas e trazer tudo de lá.",
    nome: "a conexão com sistemas de gestão",
    beneficios: [
      "Nada de digitar de novo o que já está no seu sistema.",
      "Clientes, valores e prazos chegam do jeito que estão lá.",
      "A simulação acompanha cada venda nova do sistema.",
    ],
    enquanto: lancarVendas,
  },
  credito: {
    titulo: "Planejar crédito antes de precisar",
    descricao:
      "Nos meses em que o split payment apertar o caixa, a Prévia vai mostrar opções de crédito, com o valor que falta já calculado.",
    nome: "o planejamento de crédito",
    beneficios: [
      "Você vê com antecedência os meses em que o dinheiro pode faltar.",
      "O valor sugerido sai da sua própria projeção de caixa.",
      "Dá para comparar as opções antes de pedir.",
    ],
    enquanto: {
      texto: "Enquanto isso, veja na projeção quais meses vão ser mais apertados.",
      href: "/projecao/",
      rotulo: "Ver projeção",
    },
  },
} satisfies Record<string, Recurso>;

export type ChaveDoRecurso = keyof typeof recursos;
