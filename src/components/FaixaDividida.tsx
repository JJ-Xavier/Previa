import { reais } from "@/lib/formatar";
import type { Centavos } from "@/lib/tipos";

type Props = {
  ficaComVoce: Centavos;
  governo: Centavos;
  /** Frase com os valores completos, lida no lugar do desenho por leitores de tela. */
  descricao: string;
  /** "grande" no topo do Painel; "media" na prévia de uma venda. */
  tamanho?: "grande" | "media";
  className?: string;
};

const tamanhos = {
  grande: {
    faixa: "h-[140px] gap-1.5",
    bloco: "rounded-bloco p-[clamp(12px,2vw,24px)]",
    rotulo: "text-[15px]",
    valorVerde: "text-[clamp(20px,3.6vw,48px)]",
    valorAmbar: "text-[clamp(20px,3.6vw,48px)]",
    governo: "Vai para o governo",
  },
  media: {
    faixa: "h-28 gap-[5px]",
    bloco: "rounded-2xl px-4 py-3.5",
    rotulo: "text-[13px]",
    valorVerde: "text-[30px]",
    valorAmbar: "text-xl",
    governo: "Governo",
  },
};

const valor = "font-display font-bold tracking-[-0.03em] whitespace-nowrap tabular-nums";

// A assinatura visual da Prévia: o que fica com você (verde) ao lado do que
// vai para o governo (âmbar), cada parte com a largura do seu valor. Como o
// valor não quebra linha, em espaço estreito o bloco nunca fica menor que ele.
export function FaixaDividida({ ficaComVoce, governo, descricao, tamanho = "grande", className = "" }: Props) {
  const t = tamanhos[tamanho];
  const bloco = `flex flex-col justify-between ${t.bloco}`;

  return (
    <div role="img" aria-label={descricao} className={`flex ${t.faixa} ${className}`}>
      <div className={`${bloco} bg-verde text-white`} style={{ flex: `${ficaComVoce} 1 0%` }}>
        <span className={`${t.rotulo} font-medium`}>Fica com você</span>
        <span className={`${valor} ${t.valorVerde}`}>{reais(ficaComVoce, { centavos: false })}</span>
      </div>
      <div className={`${bloco} bg-ambar text-petroleo`} style={{ flex: `${governo} 1 0%` }}>
        <span className={`${t.rotulo} font-semibold`}>{t.governo}</span>
        <span className={`${valor} ${t.valorAmbar}`}>{reais(governo, { centavos: false })}</span>
      </div>
    </div>
  );
}
