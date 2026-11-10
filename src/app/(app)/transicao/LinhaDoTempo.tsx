"use client";

import { mesAtual } from "@/lib/datas";
import { anosDaFase, fases } from "./fases";

// Cada fase tem a largura dos anos que dura. As cores seguem a ordem da reforma:
// teste, começo do split payment, troca gradual dos impostos e regra final.
const estilos = [
  { cor: "bg-petroleo-claro text-white", selo: "bg-mineral-claro text-petroleo", base: "130px" },
  { cor: "bg-verde text-white", selo: "bg-mineral-claro text-petroleo", base: "200px" },
  { cor: "bg-ambar text-petroleo", selo: "bg-petroleo text-white", base: "280px" },
  { cor: "bg-mineral-claro text-petroleo", selo: "bg-petroleo text-white", base: "130px" },
];

// A fase de hoje ganha o "Você está aqui", calculado no computador da pessoa.
export function LinhaDoTempo() {
  const ano = Number(mesAtual().slice(0, 4));
  const atual = ano < fases[0].de ? -1 : fases.findLastIndex((f) => f.de <= ano);

  return (
    <ol aria-label="Fases da transição" className="mt-7 flex flex-wrap gap-1.5">
      {fases.map((fase, i) => (
        <li
          key={fase.de}
          aria-current={i === atual ? "step" : undefined}
          style={{ flex: `${fase.ate - fase.de + 1} 1 ${estilos[i].base}` }}
          className={`flex min-h-[104px] flex-col justify-end gap-2 rounded-[18px] px-4 py-3.5 ${estilos[i].cor}`}
        >
          {i === atual && (
            <span className={`mb-auto self-start rounded-md px-2 py-0.5 text-xs font-semibold ${estilos[i].selo}`}>
              Você está aqui
            </span>
          )}
          <span className="flex flex-col">
            <span className="font-display text-2xl font-bold">{anosDaFase(fase)}</span>
            <span className="text-sm font-medium">{fase.curto}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
