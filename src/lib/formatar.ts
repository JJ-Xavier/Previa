import type { Centavos, DataISO, Mes, Regime } from "./tipos";

const comCentavos = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const semCentavos = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const compacto = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const decimal = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const mesComAno = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
const mesSemAno = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" });
const mesAbreviado = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });

const primeiroDia = (mes: Mes) => new Date(`${mes}-01T00:00:00Z`);

/** 4_800_000 vira "R$ 48.000,00". Com `centavos: false`, "R$ 48.000". */
export function reais(valor: Centavos, { centavos = true } = {}): string {
  return (centavos ? comCentavos : semCentavos).format(valor / 100);
}

/** 1_000_000 vira "10.000,00", sem o "R$", para preencher a caixa de valor. */
export function valorParaCampo(valor: Centavos): string {
  return decimal.format(valor / 100);
}

/** 3_234_000 vira "32,3 mil", para rótulos curtos de gráfico. */
export function reaisCompacto(valor: Centavos): string {
  return compacto.format(valor / 100);
}

/** "2027-03" vira "março de 2027". Com `ano: false`, só "março". */
export function nomeDoMes(mes: Mes, { ano = true } = {}): string {
  return (ano ? mesComAno : mesSemAno).format(primeiroDia(mes));
}

/** "2027-03" vira "mar". */
export function mesCurto(mes: Mes): string {
  return mesAbreviado.format(primeiroDia(mes)).replace(".", "");
}

/** "2027-03-15" vira "15/03/2027". */
export function dataCurta(data: DataISO): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

/** "Janeiro a junho de 2027", ou "Julho de 2027 a junho de 2028" se mudar o ano. */
export function intervaloDeMeses(inicio: Mes, fim: Mes): string {
  const mesmoAno = inicio.slice(0, 4) === fim.slice(0, 4);
  return comMaiuscula(`${nomeDoMes(inicio, { ano: !mesmoAno })} a ${nomeDoMes(fim)}`);
}

const REGIMES: Record<Regime, string> = { simples: "Simples Nacional", presumido: "Lucro Presumido" };

/** "simples" vira "Simples Nacional". */
export function nomeDoRegime(regime: Regime): string {
  return REGIMES[regime];
}

export function comMaiuscula(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
