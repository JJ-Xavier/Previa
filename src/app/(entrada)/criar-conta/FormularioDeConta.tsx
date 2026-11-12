"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo } from "@/components/Campo";
import { CampoDeSenha } from "@/components/CampoDeSenha";
import { criarConta } from "@/lib/armazenamento";
import { SENHA_MINIMA, validarConta, type CamposDaConta, type Erros } from "@/lib/entrada";

// Cadastro da conta. Depois dele vêm a escolha de perfil e o cadastro da empresa.
export function FormularioDeConta() {
  const router = useRouter();
  const [campos, setCampos] = useState<CamposDaConta>({ nome: "", email: "", senha: "", confirmacao: "" });
  const [tentou, setTentou] = useState(false);
  const [emailEmUso, setEmailEmUso] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  // Os erros aparecem depois da primeira tentativa; daí em diante, a cada tecla.
  const erros: Erros<CamposDaConta> = tentou ? validarConta(campos).erros : {};
  if (!erros.email && emailEmUso && campos.email.trim().toLowerCase() === emailEmUso) {
    erros.email = "Já existe uma conta com este e-mail neste computador. Entre com ela.";
  }

  const mudar = (campo: keyof CamposDaConta) => (texto: string) => setCampos({ ...campos, [campo]: texto });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setTentou(true);
    const { erros: encontrados, conta } = validarConta(campos);
    if (!conta) {
      document.getElementById(Object.keys(encontrados)[0])?.focus();
      return;
    }
    setCriando(true);
    if (await criarConta(conta.nome, conta.email, conta.senha)) {
      // O Painel vê que é o primeiro acesso e leva para a escolha de perfil.
      router.push("/");
      return;
    }
    setCriando(false);
    setEmailEmUso(conta.email);
    document.getElementById("email")?.focus();
  }

  return (
    <form noValidate onSubmit={enviar} aria-labelledby="conta-titulo" className="flex w-full max-w-[400px] flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 id="conta-titulo" className="font-display text-[34px] font-bold tracking-[-0.03em]">
          Criar conta
        </h2>
        <p className="text-[15px] text-texto-suave">Depois você cadastra a sua empresa ou os seus clientes.</p>
      </div>

      <Campo
        id="nome"
        rotulo="Seu nome"
        autoComplete="name"
        value={campos.nome}
        onChange={(e) => mudar("nome")(e.target.value)}
        erro={erros.nome}
      />
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
      <CampoDeSenha
        id="senha"
        rotulo="Senha"
        autoComplete="new-password"
        value={campos.senha}
        onChange={(e) => mudar("senha")(e.target.value)}
        erro={erros.senha}
        dica={erros.senha ? undefined : `Pelo menos ${SENHA_MINIMA} caracteres.`}
      />
      <CampoDeSenha
        id="confirmacao"
        rotulo="Repita a senha"
        autoComplete="new-password"
        value={campos.confirmacao}
        onChange={(e) => mudar("confirmacao")(e.target.value)}
        erro={erros.confirmacao}
      />

      <button type="submit" disabled={criando} className="botao disabled:opacity-70">
        {criando ? "Criando..." : "Criar conta"}
      </button>
      <p className="text-center text-[15px] text-texto-suave">
        Já tem conta?{" "}
        <Link href="/entrar/" className="font-semibold">
          Entrar
        </Link>
      </p>
    </form>
  );
}
