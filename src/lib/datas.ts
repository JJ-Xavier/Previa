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

/** "2027-12" mais 1 mês vira "2028-01". */
export function somarMeses(mes: Mes, meses: number): Mes {
  const [ano, numero] = mes.split("-").map(Number);
  const total = ano * 12 + (numero - 1) + meses;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}
