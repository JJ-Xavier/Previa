import { somarDias } from "./datas";
import type { Centavos, DataISO, Empresa, Publico, Regime, Venda } from "./tipos";

/*
  Leitura e validação do que a pessoa digita, no formulário ou na planilha.
  As mensagens servem para os dois lugares, por isso não começam com "Digite".
*/

/** "R$ 10.000,00", "10000", "10.000" e "10000.50" viram centavos. Inválido ou zero vira null. */
export function lerValor(texto: string): Centavos | null {
  let t = texto.replace(/R\$|\s/g, "");
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const centavos = Math.round(Number(t) * 100);
  return centavos > 0 ? centavos : null;
}

/** "15/03/2027", "15/03/27" e "2027-03-15" viram "2027-03-15". Data que não existe vira null. */
export function lerData(texto: string): DataISO | null {
  const t = texto.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})$/.exec(t);
  let ano: number, mes: number, dia: number;
  if (iso) [ano, mes, dia] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  else if (br) [dia, mes, ano] = [Number(br[1]), Number(br[2]), Number(br[3].length === 2 ? `20${br[3]}` : br[3])];
  else return null;

  if (ano < 2000 || ano > 2100) return null;
  const data = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  // Confere se o dia existe: 31/02 não pode virar 03/03.
  const conferida = new Date(`${data}T00:00:00Z`);
  return !isNaN(conferida.getTime()) && conferida.toISOString().startsWith(data) ? data : null;
}

/** Tira pontos, barra e traço, e põe letras em maiúsculas. */
export function limparCnpj(texto: string): string {
  return texto.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

/**
 * Confere os dígitos verificadores. Aceita também o CNPJ alfanumérico que a
 * Receita emite desde julho de 2026: cada caractere vale o código ASCII menos 48.
 */
export function cnpjValido(texto: string): boolean {
  const c = limparCnpj(texto);
  if (!/^[0-9A-Z]{12}\d{2}$/.test(c) || /^(.)\1+$/.test(c)) return false;

  const digito = (base: string) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += (base.charCodeAt(base.length - 1 - i) - 48) * (2 + (i % 8));
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const primeiro = digito(c.slice(0, 12));
  const segundo = digito(c.slice(0, 12) + primeiro);
  return c.endsWith(`${primeiro}${segundo}`);
}

/** "11222333000181" vira "11.222.333/0001-81". */
export function formatarCnpj(texto: string): string {
  const c = limparCnpj(texto);
  if (c.length !== 14) return texto.trim();
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
}

export type Erros<T> = Partial<Record<keyof T, string>>;

export type CamposDaVenda = {
  cliente: string;
  cnpjCliente: string;
  valor: string;
  dataVenda: string;
  /** Em branco, usa a data da venda mais o prazo médio da empresa. */
  dataRecebimento: string;
};

/** Quem vende ao consumidor final pode deixar o cliente em branco. */
export const CONSUMIDOR_FINAL = "Consumidor final";

export function validarVenda(campos: CamposDaVenda, prazoMedioDias: number, publico: Publico = "empresas") {
  const erros: Erros<CamposDaVenda> = {};

  const cliente = campos.cliente.trim() || (publico === "consumidor" ? CONSUMIDOR_FINAL : "");
  if (!cliente) erros.cliente = "Falta o nome do cliente.";

  const cnpj = campos.cnpjCliente.trim();
  if (cnpj && !cnpjValido(cnpj)) erros.cnpjCliente = "CNPJ do cliente inválido. Confira os 14 caracteres.";

  const valor = lerValor(campos.valor);
  if (valor === null) erros.valor = "O valor precisa ser maior que zero, como 10.000,00.";

  const dataVenda = lerData(campos.dataVenda);
  if (!dataVenda) {
    erros.dataVenda = campos.dataVenda.trim()
      ? "Data da venda inválida. Use dia/mês/ano."
      : "Falta a data da venda.";
  }

  const recebimentoDigitado = campos.dataRecebimento.trim();
  const dataRecebimento = recebimentoDigitado
    ? lerData(recebimentoDigitado)
    : dataVenda && somarDias(dataVenda, prazoMedioDias);
  if (recebimentoDigitado && !dataRecebimento) {
    erros.dataRecebimento = "Data do recebimento inválida. Use dia/mês/ano.";
  } else if (dataVenda && dataRecebimento && dataRecebimento < dataVenda) {
    erros.dataRecebimento = "O recebimento não pode ser antes da venda.";
  }

  if (Object.keys(erros).length > 0 || valor === null || !dataVenda || !dataRecebimento) {
    return { erros };
  }
  const venda: Omit<Venda, "id"> = {
    cliente,
    ...(cnpj && { cnpjCliente: formatarCnpj(cnpj) }),
    valor,
    dataVenda,
    dataRecebimento,
  };
  return { erros, venda };
}

export type CamposDaEmpresa = {
  nome: string;
  cnpj: string;
  regime: Regime;
  publico: Publico;
  prazoMedioDias: string;
};

export function validarEmpresa(campos: CamposDaEmpresa) {
  const erros: Erros<CamposDaEmpresa> = {};

  const nome = campos.nome.trim();
  if (!nome) erros.nome = "Falta o nome da empresa.";

  if (!campos.cnpj.trim()) erros.cnpj = "Falta o CNPJ da empresa.";
  else if (!cnpjValido(campos.cnpj)) erros.cnpj = "CNPJ inválido. Confira os 14 caracteres.";

  const prazo = Number(campos.prazoMedioDias);
  if (!campos.prazoMedioDias.trim() || !Number.isInteger(prazo) || prazo < 0 || prazo > 365) {
    erros.prazoMedioDias = "Use um número inteiro de dias, de 0 a 365.";
  }

  if (Object.keys(erros).length > 0) return { erros };
  const dados: Omit<Empresa, "id" | "vendas"> = {
    nome,
    cnpj: formatarCnpj(campos.cnpj),
    regime: campos.regime,
    publico: campos.publico,
    prazoMedioDias: prazo,
  };
  return { erros, dados };
}

/** E-mail sem espaços e em minúsculas, para comparar "Ana@x.com" com "ana@x.com". */
export function validarEmail(texto: string): { erro?: string; email?: string } {
  const email = texto.trim().toLowerCase();
  if (!email) return { erro: "Falta o e-mail." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { erro: "Escreva o e-mail completo, como voce@suaempresa.com.br." };
  }
  return { email };
}

export const SENHA_MINIMA = 8;

export type CamposDaConta = { nome: string; email: string; senha: string; confirmacao: string };

/**
 * Criar conta: nome, e-mail e uma senha de pelo menos 8 caracteres, digitada
 * duas vezes. Sem servidor não há como recuperar a senha, então um erro de
 * digitação aqui deixaria a pessoa fora da própria conta.
 */
export function validarConta(campos: CamposDaConta) {
  const erros: Erros<CamposDaConta> = {};
  const nome = campos.nome.trim();
  if (!nome) erros.nome = "Falta o seu nome.";
  const { erro, email } = validarEmail(campos.email);
  if (erro) erros.email = erro;
  if (campos.senha.length < SENHA_MINIMA) {
    erros.senha = campos.senha ? `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` : "Falta a senha.";
  } else if (!campos.confirmacao) {
    erros.confirmacao = "Repita a senha para conferir.";
  } else if (campos.confirmacao !== campos.senha) {
    erros.confirmacao = "As duas senhas não são iguais.";
  }
  if (Object.keys(erros).length > 0 || !email) return { erros };
  return { erros, conta: { nome, email, senha: campos.senha } };
}

export type CamposDeEntrada = { email: string; senha: string };

/** Entrar: só confere se veio algo; quem diz se a senha bate é o armazenamento. */
export function validarEntrada(campos: CamposDeEntrada) {
  const erros: Erros<CamposDeEntrada> = {};
  const { erro, email } = validarEmail(campos.email);
  if (erro) erros.email = erro;
  if (!campos.senha) erros.senha = "Falta a senha.";
  if (Object.keys(erros).length > 0 || !email) return { erros };
  return { erros, email, senha: campos.senha };
}
