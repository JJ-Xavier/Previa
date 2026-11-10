"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import { entrar, useDados } from "@/lib/armazenamento";
import { validarEmail } from "@/lib/entrada";

// Acesso local: o primeiro e-mail cria o acesso neste computador; depois, só ele abre.
export function FormularioDeEntrada() {
  const dados = useDados();
  const router = useRouter();
  // null enquanto a pessoa não digita: aí vale o e-mail já salvo.
  const [digitado, setDigitado] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  if (!dados) return null;

  const salvo = dados.acesso?.email;
  const texto = digitado ?? salvo ?? "";

  function enviar(e: FormEvent) {
    e.preventDefault();
    const { erro: invalido, email } = validarEmail(texto);
    if (!email) {
      setErro(invalido);
    } else if (!entrar(email)) {
      setErro(`Este computador está com os dados de ${salvo}. Entre com esse e-mail.`);
    } else {
      router.push("/");
      return;
    }
    document.getElementById("email")?.focus();
  }

  return (
    <form noValidate onSubmit={enviar} aria-labelledby="entrar-titulo" className="flex w-full max-w-[400px] flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 id="entrar-titulo" className="font-display text-[34px] font-bold tracking-[-0.03em]">
          Entrar
        </h2>
        <p className="text-[15px] text-texto-suave">
          {salvo ? "Use o e-mail que você cadastrou neste computador." : "Digite seu e-mail para começar."}
        </p>
      </div>
      <Campo
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@suaempresa.com.br"
        value={texto}
        onChange={(e) => {
          setDigitado(e.target.value);
          setErro(undefined);
        }}
        erro={erro}
      />
      <button type="submit" className="botao">
        Entrar
      </button>
      <p className="text-center text-sm leading-normal text-texto-suave">
        Ainda não tem senha: seus dados ficam guardados só neste computador.
      </p>
    </form>
  );
}
