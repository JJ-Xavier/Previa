import { validarVenda } from "./entrada";
import type { Venda } from "./tipos";

/*
  Planilha de vendas em CSV. Usa ponto e vírgula, que é o que o Excel em
  português espera. As colunas são lidas pela posição; a linha 1 é o cabeçalho.
*/

const CABECALHO = [
  "Cliente",
  "CNPJ do cliente (opcional)",
  "Valor",
  "Data da venda",
  "Data do recebimento (opcional)",
];

/** Conteúdo do arquivo "Baixar modelo". O ﻿ avisa ao Excel que o texto é UTF-8. */
export function modeloDaPlanilha(): string {
  return `﻿${CABECALHO.join(";")}\r\n`;
}

/** O Excel salva em UTF-8 ou em Windows-1252, conforme a opção escolhida. Aceita os dois. */
export function textoDoArquivo(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

/**
 * Lê as vendas da planilha. Se alguma linha tiver erro, `erros` lista cada
 * uma, e a tela não importa nada: assim corrigir e enviar de novo não duplica.
 */
export function lerPlanilha(texto: string, prazoMedioDias: number) {
  const linhas = texto.replace(/^﻿/, "").split(/\r?\n/);
  const separador = linhas[0].includes(";") ? ";" : ",";
  const vendas: Omit<Venda, "id">[] = [];
  const erros: string[] = [];

  linhas.forEach((linha, i) => {
    // Pula o cabeçalho e as linhas vazias (o Excel às vezes deixa ";;;;").
    if (i === 0 || /^[;,\s]*$/.test(linha)) return;
    const [cliente = "", cnpjCliente = "", valor = "", dataVenda = "", dataRecebimento = ""] =
      dividirLinha(linha, separador);
    const lida = validarVenda({ cliente, cnpjCliente, valor, dataVenda, dataRecebimento }, prazoMedioDias);
    if (lida.venda) vendas.push(lida.venda);
    else erros.push(`Linha ${i + 1}: ${Object.values(lida.erros).join(" ")}`);
  });

  if (vendas.length === 0 && erros.length === 0) {
    erros.push("A planilha não tem nenhuma venda. Preencha a partir da linha 2.");
  }
  return { vendas, erros };
}

/** Separa os campos de uma linha, respeitando aspas: "10.000,00" pode ter o separador dentro. */
function dividirLinha(linha: string, separador: string): string[] {
  const campos: string[] = [];
  let atual = "";
  let entreAspas = false;

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (entreAspas) {
      if (c === '"' && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else if (c === '"') entreAspas = false;
      else atual += c;
    } else if (c === '"') entreAspas = true;
    else if (c === separador) {
      campos.push(atual);
      atual = "";
    } else atual += c;
  }
  campos.push(atual);
  return campos.map((campo) => campo.trim());
}
