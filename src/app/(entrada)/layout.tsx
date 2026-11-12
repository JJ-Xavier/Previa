import type { ReactNode } from "react";
import { FaixaDividida } from "@/components/FaixaDividida";
import { Marca } from "@/components/Marca";
import { dividirValor } from "@/lib/calculo";
import { reais } from "@/lib/formatar";

// Uma venda de R$ 10.000 dividida pelo mesmo cálculo do Painel.
const VENDA = 1_000_000;
const exemplo = dividirValor(VENDA, "2027-01", "simples");

// Entrar e Criar conta: a faixa escura explica a Prévia, o formulário fica ao lado.
export default function LayoutEntrada({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <section
        aria-label="Sobre a Prévia"
        className="faixa flex flex-[1_1_460px] flex-col gap-8 bg-petroleo px-6 pt-8 pb-10 text-mineral-claro sm:px-12"
      >
        <Marca />
        <div className="mt-auto flex flex-col gap-4">
          <h1 className="max-w-[14ch] font-display text-[clamp(34px,4.2vw,52px)] leading-[1.02] font-bold tracking-[-0.035em]">
            Saiba quanto de cada venda fica com você.
          </h1>
          <p className="max-w-[34rem] text-[17px] leading-relaxed text-nevoa">
            Com o split payment, o imposto sai na hora do pagamento. A Prévia mostra o que entra de verdade no
            seu caixa, mês a mês.
          </p>
        </div>
        <figure className="mb-auto flex flex-col gap-2.5">
          <FaixaDividida
            tamanho="media"
            ficaComVoce={exemplo.ficaComVoce}
            governo={exemplo.governo}
            descricao={`Exemplo: numa venda de ${reais(VENDA)}, ${reais(exemplo.ficaComVoce)} ficam com você e ${reais(exemplo.governo)} vão para o governo`}
          />
          <figcaption className="text-sm text-nevoa">Uma venda de {reais(VENDA)} com o split payment</figcaption>
        </figure>
      </section>

      <main className="flex flex-[1_1_420px] items-center justify-center px-4 py-10 sm:px-8">{children}</main>
    </div>
  );
}
