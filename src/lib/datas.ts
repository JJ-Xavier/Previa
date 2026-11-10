import type { DataISO, Mes } from "./tipos";

/** "2027-03-15" vira "2027-03". */
export function mesDe(data: DataISO): Mes {
  return data.slice(0, 7);
}

/** Soma dias a uma data (negativo subtrai). Usa UTC para o fuso não mudar o dia. */
export function somarDias(data: DataISO, dias: number): DataISO {
  const d = new Date(`${data}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Mês de hoje, no fuso do computador. */
export function mesAtual(): Mes {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

/** Prende o mês entre `primeiro` e `ultimo`. Meses AAAA-MM comparam como texto. */
export function limitar(mes: Mes, primeiro: Mes, ultimo: Mes): Mes {
  if (mes < primeiro) return primeiro;
  if (mes > ultimo) return ultimo;
  return mes;
}

/** "2027-12" mais 1 mês vira "2028-01". */
export function somarMeses(mes: Mes, meses: number): Mes {
  const [ano, numero] = mes.split("-").map(Number);
  const total = ano * 12 + (numero - 1) + meses;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
