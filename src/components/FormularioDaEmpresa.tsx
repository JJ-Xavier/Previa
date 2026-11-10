"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { abrirEmpresa, novoId, salvarEmpresa } from "@/lib/armazenamento";
import { validarEmpresa, type CamposDaEmpresa, type Erros } from "@/lib/entrada";
import type { Empresa } from "@/lib/tipos";
import { Campo, Opcao } from "./Campo";
import { SeloEmBreve } from "./SeloEmBreve";

type Props = {
  /** Sem empresa, cria uma nova e a abre. Com empresa, edita os dados dela. */
  existente?: Empresa;
  /** Destino do "Voltar". Padrão: Vendas ao editar, Painel ao criar. */
  voltarPara?: string;
  /** Texto do botão. Padrão: "Salvar alterações" ao editar, "Continuar" ao criar. */
  rotuloDoBotao?: string;
};

export function FormularioDaEmpresa({ existente, voltarPara, rotuloDoBotao }: Props) {
  const router = useRouter();
  const [campos, setCampos] = useState<CamposDaEmpresa>({
    nome: existente?.nome ?? "",
    cnpj: existente?.cnpj ?? "",
    regime: existente?.regime ?? "simples",
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
      className="flex max-w-[760px] flex-col gap-[30px] rounded-cartao bg-papel p-6 sm:p-8"
    >
      <div className="flex flex-wrap gap-5">
        <Campo
          id="nome"
          rotulo="Nome da empresa"
          autoComplete="organization"
          placeholder="Ex.: Distribuidora Boa Limpeza"
          value={campos.nome}
          onChange={mudar("nome")}
          erro={erros.nome}
          className="flex-[2_1_300px]"
        />
        <Campo
          id="cnpj"
          rotulo="CNPJ"
          placeholder="00.000.000/0000-00"
          value={campos.cnpj}
          onChange={mudar("cnpj")}
          erro={erros.cnpj}
          className="flex-[1_1_200px]"
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Regime tributário</legend>
        <div className="flex flex-wrap gap-2.5">
          <Opcao
            name="regime"
            value="simples"
            checked={campos.regime === "simples"}
            onChange={() => setCampos({ ...campos, regime: "simples" })}
            titulo="Simples Nacional"
            descricao="A maioria das pequenas empresas"
            className="basis-[190px]"
          />
          <Opcao
            name="regime"
            value="presumido"
            checked={campos.regime === "presumido"}
            onChange={() => setCampos({ ...campos, regime: "presumido" })}
            titulo="Lucro Presumido"
            descricao="Se não souber, pergunte ao seu contador"
            className="basis-[190px]"
          />
          <Opcao
            name="regime"
            value="outro"
            emBreve
            titulo="MEI ou Lucro Real"
            descricao={<SeloEmBreve />}
            className="basis-[190px]"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Para quem você vende mais?</legend>
        <div className="flex flex-wrap gap-2.5">
          <Opcao
            name="publico"
            value="empresas"
            defaultChecked
            titulo="Para outras empresas"
            descricao="Condomínios, escritórios, restaurantes, lojas"
            className="basis-[260px]"
          />
          <Opcao
            name="publico"
            value="consumidor"
            emBreve
            titulo="Para o consumidor final"
            descricao="O split payment começa pelas vendas entre empresas. Esse caso entra numa próxima versão."
            className="basis-[260px]"
          />
        </div>
      </fieldset>

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
        dica="Usado para preencher a data de recebimento das vendas a prazo."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
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
