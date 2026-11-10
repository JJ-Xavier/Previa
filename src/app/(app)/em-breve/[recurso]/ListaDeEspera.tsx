"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import { pedirAviso, useDados } from "@/lib/armazenamento";
import { validarEmail } from "@/lib/entrada";

type Props = { recurso: string; nome: string };

// "Quero ser avisado": guarda o e-mail neste computador, na lista de espera do recurso.
export function ListaDeEspera({ recurso, nome }: Props) {
  const dados = useDados();
  const [trocando, setTrocando] = useState(false);
  const [digitado, setDigitado] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  const [acabouDeSalvar, setAcabouDeSalvar] = useState(false);
  const confirmacao = useRef<HTMLParagraphElement>(null);

  // Depois de salvar, o formulário some: o foco vai para a confirmação.
  useEffect(() => {
    if (acabouDeSalvar) confirmacao.current?.focus();
  }, [acabouDeSalvar]);

  const salvo = dados?.avisos?.[recurso];
  // Começa com o e-mail de Entrar, que quase sempre é o mesmo.
  const texto = digitado ?? salvo ?? dados?.acesso?.email ?? "";

  function enviar(e: FormEvent) {
    e.preventDefault();
    const { erro: invalido, email } = validarEmail(texto);
    if (!email) {
      setErro(invalido);
      document.getElementById("email-aviso")?.focus();
      return;
    }
    pedirAviso(recurso, email);
    setTrocando(false);
    setDigitado(null);
    setAcabouDeSalvar(true);
  }

  return (
    <section
      aria-labelledby="aviso-titulo"
      className="flex min-w-0 flex-[2_1_320px] flex-col gap-3.5 rounded-cartao bg-ambar-fundo p-6 sm:p-7"
    >
      <h2 id="aviso-titulo" className="font-display text-2xl font-bold tracking-[-0.02em]">
        Quer saber quando lançar?
      </h2>
      {dados && salvo && !trocando ? (
        <>
          <p ref={confirmacao} tabIndex={-1} className="text-base leading-normal outline-none">
            Pronto. Vamos avisar em <strong className="font-semibold break-all">{salvo}</strong> no dia em que {nome}{" "}
            estiver funcionando.
          </p>
          <button
            type="button"
            onClick={() => setTrocando(true)}
            className="botao-contorno self-start text-[15px]"
          >
            Usar outro e-mail
          </button>
        </>
      ) : (
        <form noValidate onSubmit={enviar} className="flex flex-col gap-3.5">
          <p className="text-[15px] leading-normal text-ambar-tinta">
            A gente avisa por e-mail no dia em que {nome} estiver funcionando.
          </p>
          <Campo
            id="email-aviso"
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
            className="[&_.campo:not([aria-invalid=true])]:border-ambar-borda"
          />
          <button type="submit" className="botao">
            Quero ser avisado
          </button>
          <p className="text-[13px] text-ambar-tinta">Usamos seu e-mail só para este aviso.</p>
        </form>
      )}
    </section>
  );
}
