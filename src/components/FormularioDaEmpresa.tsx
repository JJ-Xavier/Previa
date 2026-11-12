"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { abrirEmpresa, novoId, salvarEmpresa } from "@/lib/armazenamento";
import { validarEmpresa, type CamposDaEmpresa, type Erros } from "@/lib/entrada";
import type { Empresa, Publico, Regime } from "@/lib/tipos";
import { Campo, Opcao } from "./Campo";

type Props = {
  /** Sem empresa, cria uma nova e a abre. Com empresa, edita os dados dela. */
  existente?: Empresa;
  /** Destino do "Voltar". Padrão: Vendas ao editar, Painel ao criar. */
  voltarPara?: string;
  /** Texto do botão. Padrão: "Salvar alterações" ao editar, "Continuar" ao criar. */
  rotuloDoBotao?: string;
};

const regimes: { valor: Regime; titulo: string; descricao: string }[] = [
  { valor: "mei", titulo: "MEI", descricao: "Até R$ 81 mil por ano" },
  { valor: "simples", titulo: "Simples Nacional", descricao: "O da maioria das pequenas" },
  { valor: "presumido", titulo: "Lucro Presumido", descricao: "Na dúvida, pergunte ao contador" },
  { valor: "real", titulo: "Lucro Real", descricao: "Empresas maiores" },
];

const publicos: { valor: Publico; titulo: string; descricao: string }[] = [
  { valor: "empresas", titulo: "Para outras empresas", descricao: "Condomínios, escritórios, lojas" },
  { valor: "consumidor", titulo: "Para o consumidor final", descricao: "Pessoas, no balcão ou na internet" },
];

// Duas colunas em tela larga: quem é a empresa à esquerda, como ela vende à direita.
export function FormularioDaEmpresa({ existente, voltarPara, rotuloDoBotao }: Props) {
  const router = useRouter();
  const [campos, setCampos] = useState<CamposDaEmpresa>({
    nome: existente?.nome ?? "",
    cnpj: existente?.cnpj ?? "",
    regime: existente?.regime ?? "simples",
    publico: existente?.publico ?? "empresas",
    prazoMedioDias: String(existente?.prazoMedioDias ?? 30),
  });
  const [tentouSalvar, setTentouSalvar] = useState(false);
  // Os erros só aparecem depois da primeira tentativa; daí em diante, a cada tecla.
  const erros: Erros<CamposDaEmpresa> = tentouSalvar ? validarEmpresa(campos).erros : {};

  const mudar = (campo: keyof CamposDaEmpresa) => (e: ChangeEvent<HTMLInputElement>) =>
    setCampos({ ...campos, [campo]: e.target.value });

  function salvar(e: FormEvent) {
    e.preventDefault();
    setTentouSalvar(true);
    const { erros: encontrados, dados } = validarEmpresa(campos);
    if (!dados) {
      document.getElementById(Object.keys(encontrados)[0])?.focus();
      return;
    }
    if (existente) {
      salvarEmpresa({ ...existente, ...dados });
    } else {
      const nova = { id: novoId(), ...dados, vendas: [] };
      salvarEmpresa(nova);
      abrirEmpresa(nova.id);
    }
    router.push("/vendas/");
  }

  return (
    <form
      noValidate
      onSubmit={salvar}
      aria-label="Dados da empresa"
      className="flex max-w-[1080px] flex-col gap-5 rounded-cartao bg-papel p-6 sm:px-8 sm:py-6"
    >
      <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="flex flex-col gap-5">
          <Campo
            id="nome"
            rotulo="Nome da empresa"
            autoComplete="organization"
            placeholder="Ex.: Distribuidora Boa Limpeza"
            value={campos.nome}
            onChange={mudar("nome")}
            erro={erros.nome}
          />
          <Campo
            id="cnpj"
            rotulo="CNPJ"
            placeholder="00.000.000/0000-00"
            value={campos.cnpj}
            onChange={mudar("cnpj")}
            erro={erros.cnpj}
          />
          <Campo
            id="prazoMedioDias"
            rotulo="Em média, quantos dias você leva para receber?"
            type="number"
            inputMode="numeric"
            min={0}
            max={365}
            sufixo="dias depois da venda"
            value={campos.prazoMedioDias}
            onChange={mudar("prazoMedioDias")}
            erro={erros.prazoMedioDias}
            dica="Preenche a data de recebimento das vendas a prazo. Use 0 se recebe na hora."
          />
        </div>

        <div className="flex flex-col gap-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Regime tributário</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {regimes.map(({ valor, titulo, descricao }) => (
                <Opcao
                  key={valor}
                  name="regime"
                  value={valor}
                  checked={campos.regime === valor}
                  onChange={() => setCampos({ ...campos, regime: valor })}
                  titulo={titulo}
                  descricao={descricao}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Para quem você vende mais?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {publicos.map(({ valor, titulo, descricao }) => (
                <Opcao
                  key={valor}
                  name="publico"
                  value={valor}
                  checked={campos.publico === valor}
                  onChange={() => setCampos({ ...campos, publico: valor })}
                  titulo={titulo}
                  descricao={descricao}
                />
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linha-suave pt-4">
        <Link href={voltarPara ?? (existente ? "/vendas/" : "/")} className="botao-texto">
          Voltar
        </Link>
        <button type="submit" className="botao px-8">
          {rotuloDoBotao ?? (existente ? "Salvar alterações" : "Continuar")}
        </button>
      </div>
    </form>
  );
}
