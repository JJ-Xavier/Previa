"use client";

import { useState, type ComponentProps } from "react";
import { Campo } from "./Campo";

// Caixa de senha com "Mostrar", para conferir o que foi digitado sem um segundo campo.
export function CampoDeSenha(props: Omit<ComponentProps<typeof Campo>, "type" | "acao">) {
  const [visivel, setVisivel] = useState(false);

  return (
    <Campo
      {...props}
      type={visivel ? "text" : "password"}
      acao={
        <button
          type="button"
          onClick={() => setVisivel(!visivel)}
          aria-controls={props.id}
          aria-label={visivel ? "Esconder a senha" : "Mostrar a senha"}
          className="min-h-9 cursor-pointer rounded-full px-3 text-sm font-semibold text-verde-texto hover:bg-mineral hover:text-verde-escuro"
        >
          {visivel ? "Esconder" : "Mostrar"}
        </button>
      }
    />
  );
}
