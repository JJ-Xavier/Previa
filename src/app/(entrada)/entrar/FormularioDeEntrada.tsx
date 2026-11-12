"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import { CampoDeSenha } from "@/components/CampoDeSenha";
import { entrar } from "@/lib/armazenamento";
import { validarEntrada, type CamposDeEntrada, type Erros } from "@/lib/entrada";

// Login com e-mail e senha das contas criadas neste computador.
export function FormularioDeEntrada() {
  const router = useRouter();
  const [campos, setCampos] = useState<CamposDeEntrada>({ email: "", senha: "" });
  const [erros, setErros] = useState<Erros<CamposDeEntrada>>({});
  const [recusado, setRecusado] = useState(false);
  const [esqueceu, setEsqueceu] = useState(false);
  const [entrando, setEntrando] = useState(false);

  const mudar = (campo: keyof CamposDeEntrada) => (texto: string) => {
    setCampos({ ...campos, [campo]: texto });
    setErros({ ...erros, [campo]: undefined });
    setRecusado(false);
  };

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const lido = validarEntrada(campos);
    setErros(lido.erros);
    if (!lido.email) {
      document.getElementById(Object.keys(lido.erros)[0])?.focus();
      return;
    }
    setEntrando(true);
    if (await entrar(lido.email, lido.senha)) {
      router.push("/");
      return;
    }
    setEntrando(false);
    setRecusado(true);
    document.getElementById("senha")?.focus();
  }

  return (
    <form noValidate onSubmit={enviar} aria-labelledby="entrar-titulo" className="flex w-full max-w-[400px] flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 id="entrar-titulo" className="font-display text-[34px] font-bold tracking-[-0.03em]">
          Entrar
        </h2>
        <p className="text-[15px] text-texto-suave">Use o e-mail e a senha da sua conta.</p>
      </div>

      <div aria-live="polite" className="empty:hidden">
        {recusado && (
          <p className="rounded-campo bg-erro-fundo px-4 py-3 text-[15px] font-medium text-erro">
            E-mail ou senha não conferem. Confira os dois e tente de novo.
          </p>
        )}
      </div>

      <Campo
        id="email"
        rotulo="E-mail"
        type="email"
        autoComplete="email"
        placeholder="voce@suaempresa.com.br"
        value={campos.email}
        onChange={(e) => mudar("email")(e.target.value)}
        erro={erros.email}
      />
      <div className="flex flex-col gap-2">
        <CampoDeSenha
          id="senha"
          rotulo="Senha"
          autoComplete="current-password"
          value={campos.senha}
          onChange={(e) => mudar("senha")(e.target.value)}
          erro={erros.senha}
        />
        <button
          type="button"
          aria-expanded={esqueceu}
          onClick={() => setEsqueceu(!esqueceu)}
          className="cursor-pointer self-start text-sm font-semibold text-verde-texto hover:text-verde-escuro"
        >
          Esqueci minha senha
        </button>
        {esqueceu && (
          <p className="text-sm leading-normal text-texto-suave">
            A senha fica guardada só neste computador, por isso a Prévia não consegue enviar outra por e-mail.
            Se não lembrar, crie uma conta nova com outro e-mail.
          </p>
        )}
      </div>

      <button type="submit" disabled={entrando} className="botao disabled:opacity-70">
        {entrando ? "Entrando..." : "Entrar"}
      </button>
      <p className="text-center text-[15px] text-texto-suave">
        Ainda não tem conta?{" "}
        <Link href="/criar-conta/" className="font-semibold">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
