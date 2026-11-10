import Link from "next/link";
import { nomeDoRegime } from "@/lib/formatar";
import type { Regime } from "@/lib/tipos";

type Props = {
  /** Regime da empresa aberta. Sem ele (lista de clientes), vale "de cada regime". */
  regime?: Regime;
  /** Sobre o fundo petróleo, como na prévia da venda. */
  naFaixa?: boolean;
  className?: string;
};

// Vai embaixo de toda tela com números: as alíquotas de cada ano ainda não saíram.
export function AvisoDeEstimativa({ regime, naFaixa = false, className = "" }: Props) {
  const de = regime ? `do ${nomeDoRegime(regime)}` : "de cada regime";
  const cor = naFaixa ? "text-nevoa" : "text-texto-suave";
  const link = naFaixa ? "text-mineral-claro hover:text-white" : "";

  return (
    <p className={`text-[13px] leading-normal ${cor} ${className}`}>
      Estimativa para planejamento, feita com a alíquota de referência {de}.{" "}
      <Link href="/transicao/" className={`font-semibold ${link}`}>
        Como a conta muda até 2033
      </Link>
    </p>
  );
}
