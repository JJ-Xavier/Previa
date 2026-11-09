import type { Centavos, Mes } from "./tipos";

const comCentavos = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const semCentavos = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const mesPorExtenso = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** 4_800_000 vira "R$ 48.000,00". Com `centavos: false`, "R$ 48.000". */
export function reais(valor: Centavos, { centavos = true } = {}): string {
  return (centavos ? comCentavos : semCentavos).format(valor / 100);
}

/** "2027-03" vira "março de 2027". */
export function nomeDoMes(mes: Mes): string {
  return mesPorExtenso.format(new Date(`${mes}-01T00:00:00Z`));
}
