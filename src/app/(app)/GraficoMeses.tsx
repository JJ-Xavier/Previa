import { comMaiuscula, intervaloDeMeses, mesCurto, nomeDoMes, reaisCompacto } from "@/lib/formatar";
import type { Mes, ResumoDoMes } from "@/lib/tipos";

/** Altura, em px, da coluna do mês que mais recebe. As outras são proporcionais. */
const ALTURA_MAXIMA = 220;

type Props = {
  resumos: ResumoDoMes[];
  /** Mês de maior retenção, que aparece com as cores cheias. */
  destaque?: Mes;
};

// Colunas empilhadas: governo (âmbar) em cima, o que fica com você (verde) embaixo.
export function GraficoMeses({ resumos, destaque }: Props) {
  const maiorRecebido = Math.max(1, ...resumos.map((r) => r.recebido));
  const descricao = [
    `Colunas: ${intervaloDeMeses(resumos[0].mes, resumos[resumos.length - 1].mes)}.`,
    `Fica com você: ${resumos.map((r) => `${nomeDoMes(r.mes, { ano: false })} ${reaisCompacto(r.ficaComVoce)}`).join(", ")} reais.`,
    destaque ? `${comMaiuscula(nomeDoMes(destaque, { ano: false }))} tem a maior retenção.` : "",
  ].join(" ");

  return (
    <>
      <div
        role="img"
        aria-label={descricao}
        className="mt-6 flex h-[300px] items-end gap-2 border-b-2 border-petroleo sm:gap-4"
      >
        {resumos.map((r) => {
          const ehDestaque = r.mes === destaque;
          const altura = (r.recebido / maiorRecebido) * ALTURA_MAXIMA;
          const alturaGoverno = r.recebido ? altura * (r.governo / r.recebido) : 0;

          return (
            <div key={r.mes} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              {ehDestaque && (
                <span className="rounded-md bg-petroleo px-2 py-1 text-xs font-semibold whitespace-nowrap text-white max-sm:hidden">
                  Maior retenção
                </span>
              )}
              {r.recebido > 0 && (
                <>
                  <span
                    className={`text-xs whitespace-nowrap tabular-nums sm:text-[13px] ${ehDestaque ? "font-semibold text-petroleo" : "text-texto-suave"}`}
                  >
                    {reaisCompacto(r.ficaComVoce)}
                  </span>
                  <div className="flex w-full max-w-16 flex-col gap-[3px]">
                    <div
                      className={`rounded-t-lg rounded-b-[3px] ${ehDestaque ? "bg-ambar" : "bg-ambar-claro"}`}
                      style={{ height: alturaGoverno }}
                    />
                    <div
                      className={`rounded-t-[3px] ${ehDestaque ? "bg-verde" : "bg-verde-claro"}`}
                      style={{ height: altura - alturaGoverno }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div aria-hidden="true" className="flex gap-2 pt-2.5 text-sm text-texto-suave sm:gap-4">
        {resumos.map((r) => (
          <span
            key={r.mes}
            className={`min-w-0 flex-1 text-center ${r.mes === destaque ? "font-semibold text-petroleo" : ""}`}
          >
            {mesCurto(r.mes)}
          </span>
        ))}
      </div>
    </>
  );
}
