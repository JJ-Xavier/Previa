import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  rotulo: ReactNode;
  erro?: string;
  dica?: ReactNode;
  /** Texto ao lado da caixa, como "dias depois da venda". A caixa fica estreita. */
  sufixo?: string;
};

// Rótulo, caixa de texto, erro e dica, ligados para leitores de tela.
export function Campo({ id, rotulo, erro, dica, sufixo, className = "", ...input }: Props) {
  const descritoPor = [erro && `${id}-erro`, dica && `${id}-dica`].filter(Boolean).join(" ") || undefined;
  const caixa = (
    <input
      id={id}
      aria-invalid={erro ? true : undefined}
      aria-describedby={descritoPor}
      className={`campo ${sufixo ? "max-w-[120px]" : ""}`}
      {...input}
    />
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {rotulo}
      </label>
      {sufixo ? (
        <div className="flex items-center gap-3">
          {caixa}
          <span className="text-[15px] text-texto-suave">{sufixo}</span>
        </div>
      ) : (
        caixa
      )}
      {erro && (
        <p id={`${id}-erro`} className="text-[13px] font-medium text-erro">
          {erro}
        </p>
      )}
      {dica && (
        <p id={`${id}-dica`} className="text-[13px] leading-normal text-texto-suave">
          {dica}
        </p>
      )}
    </div>
  );
}

type OpcaoProps = InputHTMLAttributes<HTMLInputElement> & {
  titulo: ReactNode;
  descricao?: ReactNode;
  /** Opção que aparece mas ainda não pode ser escolhida no MVP. */
  emBreve?: boolean;
  /** Versão baixa, sem descrição, como "À vista" e "A prazo". */
  compacta?: boolean;
};

// Opção de escolha em forma de cartão. A borda escura marca a escolhida.
export function Opcao({ titulo, descricao, emBreve = false, compacta = false, className = "", ...radio }: OpcaoProps) {
  const forma = compacta
    ? "min-h-[50px] items-center rounded-campo px-4 text-[15px] has-checked:font-semibold"
    : "items-start rounded-2xl p-4";
  const estado = emBreve
    ? "border-[1.5px] border-dashed border-tracejado bg-mineral-claro"
    : "cursor-pointer border-[1.5px] border-campo bg-papel has-checked:border-2 has-checked:border-petroleo";

  return (
    <label className={`flex flex-1 gap-3 ${forma} ${estado} ${className}`}>
      <input
        type="radio"
        disabled={emBreve}
        className={`size-[18px] shrink-0 accent-petroleo ${compacta ? "" : "mt-0.5"}`}
        {...radio}
      />
      {compacta ? (
        titulo
      ) : (
        <span className="flex flex-col gap-1">
          <span className={`text-base font-semibold ${emBreve ? "text-texto-suave" : ""}`}>{titulo}</span>
          {descricao && <span className="text-[13px] leading-[1.45] text-texto-suave">{descricao}</span>}
        </span>
      )}
    </label>
  );
}
