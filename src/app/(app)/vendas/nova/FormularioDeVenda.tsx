"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Campo, Opcao } from "@/components/Campo";
import { AvisoDeEstimativa } from "@/components/AvisoDeEstimativa";
import { EstadoVazio } from "@/components/EstadoVazio";
import { FaixaDividida } from "@/components/FaixaDividida";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import { empresaAtiva, novoId, salvarVenda, useDados } from "@/lib/armazenamento";
import { dividirValor } from "@/lib/calculo";
import { mesAtual, mesDe, somarDias } from "@/lib/datas";
import { CONSUMIDOR_FINAL, lerData, lerValor, validarVenda, type CamposDaVenda } from "@/lib/entrada";
import { dataCurta, reais, valorParaCampo } from "@/lib/formatar";
import type { Empresa, Venda } from "@/lib/tipos";

// /vendas/nova/ lança uma venda; /vendas/nova/?editar=<id> edita uma que já existe.
export function NovaVenda() {
  const dados = useDados();
  const editar = useSearchParams().get("editar");
  if (!dados) return null;

  const empresa = empresaAtiva(dados);
  if (!empresa) return <EstadoVazio titulo="Lançar venda" temEmpresa={false} />;

  const existente = empresa.vendas.find((v) => v.id === editar);
  return <FormularioDeVenda key={existente?.id ?? "nova"} empresa={empresa} existente={existente} />;
}

type Campos = Omit<CamposDaVenda, "dataRecebimento">;

const Opcional = () => <span className="font-normal text-texto-suave">(opcional)</span>;

function FormularioDeVenda({ empresa, existente }: { empresa: Empresa; existente?: Venda }) {
  const router = useRouter();
  const [campos, setCampos] = useState<Campos>({
    cliente: existente?.cliente ?? "",
    cnpjCliente: existente?.cnpjCliente ?? "",
    valor: existente ? valorParaCampo(existente.valor) : "",
    dataVenda: existente?.dataVenda ?? "",
  });
  // Quem vende ao consumidor final costuma receber na hora e nem sempre sabe o nome do cliente.
  const consumidor = empresa.publico === "consumidor";
  const [aVista, setAVista] = useState(
    existente ? existente.dataRecebimento === existente.dataVenda : consumidor,
  );
  // Enquanto a pessoa não mexe no recebimento, ele segue a data da venda mais o prazo médio.
  const [recebimentoDigitado, setRecebimentoDigitado] = useState<string | null>(
    existente?.dataRecebimento ?? null,
  );
  const [tentouSalvar, setTentouSalvar] = useState(false);

  const recebimentoPeloPrazo = lerData(campos.dataVenda)
    ? somarDias(campos.dataVenda, empresa.prazoMedioDias)
    : "";
  const dataRecebimento = aVista ? campos.dataVenda : (recebimentoDigitado ?? recebimentoPeloPrazo);
  const lida = validarVenda({ ...campos, dataRecebimento }, empresa.prazoMedioDias, empresa.publico);
  const erros = tentouSalvar ? lida.erros : {};

  const mudar = (campo: keyof Campos) => (e: { target: { value: string } }) =>
    setCampos({ ...campos, [campo]: e.target.value });

  function salvar(e: FormEvent) {
    e.preventDefault();
    setTentouSalvar(true);
    if (!lida.venda) {
      document.getElementById(Object.keys(lida.erros)[0])?.focus();
      return;
    }
    const id = existente?.id ?? novoId();
    salvarVenda(empresa.id, { id, ...lida.venda });
    router.push(`/vendas/?salva=${id}`);
  }

  return (
    <>
      <TopoDaPagina
        titulo={existente ? "Editar venda" : "Lançar venda"}
        voltar={{ href: "/vendas/", rotulo: "Vendas e recebimentos" }}
      />
      <main className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-6 px-4 pt-8 pb-12 sm:px-10">
        <form
          noValidate
          onSubmit={salvar}
          aria-label="Dados da venda"
          className="flex min-w-0 flex-[3_1_440px] flex-col gap-5 rounded-cartao bg-papel p-6 sm:px-8 sm:py-7"
        >
          <div className="flex flex-wrap gap-4">
            <Campo
              id="cliente"
              rotulo={consumidor ? <>Cliente <Opcional /></> : "Cliente"}
              placeholder={consumidor ? CONSUMIDOR_FINAL : "Ex.: Condomínio Jardim das Flores"}
              value={campos.cliente}
              onChange={mudar("cliente")}
              erro={erros.cliente}
              className="flex-[2_1_260px]"
            />
            {/* Consumidor final não tem CNPJ; a venda antiga que tiver um continua mostrando. */}
            {(!consumidor || campos.cnpjCliente) && (
              <Campo
                id="cnpjCliente"
                rotulo={<>CNPJ do cliente <Opcional /></>}
                placeholder="00.000.000/0000-00"
                value={campos.cnpjCliente}
                onChange={mudar("cnpjCliente")}
                erro={erros.cnpjCliente}
                className="flex-[1_1_180px]"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Campo
              id="valor"
              rotulo="Valor da venda"
              inputMode="decimal"
              placeholder="10.000,00"
              value={campos.valor}
              onChange={mudar("valor")}
              onBlur={() => {
                const valor = lerValor(campos.valor);
                if (valor) setCampos({ ...campos, valor: valorParaCampo(valor) });
              }}
              erro={erros.valor}
              className="flex-[1_1_200px]"
            />
            <Campo
              id="dataVenda"
              rotulo="Data da venda"
              type="date"
              value={campos.dataVenda}
              onChange={mudar("dataVenda")}
              erro={erros.dataVenda}
              className="flex-[1_1_200px]"
            />
          </div>

          <div className="flex flex-wrap items-start gap-4">
            <fieldset className="flex-[1_1_240px]">
              <legend className="mb-2 text-sm font-semibold">Como você vai receber?</legend>
              <div className="flex gap-2.5">
                <Opcao compacta name="forma" checked={aVista} onChange={() => setAVista(true)} titulo="À vista" />
                <Opcao compacta name="forma" checked={!aVista} onChange={() => setAVista(false)} titulo="A prazo" />
              </div>
            </fieldset>
            <Campo
              id="dataRecebimento"
              rotulo="Quando o dinheiro cai na conta?"
              type="date"
              disabled={aVista}
              value={dataRecebimento}
              onChange={(e) => setRecebimentoDigitado(e.target.value || null)}
              erro={erros.dataRecebimento}
              aria-describedby={`${erros.dataRecebimento ? "dataRecebimento-erro " : ""}recebimento-dica`}
              className="flex-[1_1_220px]"
            />
          </div>
          <p id="recebimento-dica" className="-mt-1 text-[13px] leading-normal text-texto-suave">
            {aVista
              ? "À vista, o dinheiro cai no dia da venda."
              : `O imposto é retido quando o cliente paga, não quando você vende: essa data é a que mais importa.${recebimentoDigitado === null && recebimentoPeloPrazo ? ` Preenchida com o seu prazo médio de ${empresa.prazoMedioDias} dias.` : ""}`}
          </p>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-linha-suave pt-5">
            <Link href="/vendas/" className="botao-texto">
              Cancelar
            </Link>
            <button type="submit" className="botao px-[30px]">
              {existente ? "Salvar alterações" : "Salvar venda"}
            </button>
          </div>
        </form>

        <PreviaDaVenda
          valor={lerValor(campos.valor)}
          recebimento={lerData(dataRecebimento)}
          empresa={empresa}
        />
      </main>
    </>
  );
}

type PreviaProps = { valor: number | null; recebimento: string | null; empresa: Empresa };

// Cartão escuro ao lado do formulário: a divisão da venda muda a cada tecla.
function PreviaDaVenda({ valor, recebimento, empresa }: PreviaProps) {
  const divisao = valor && dividirValor(valor, recebimento ? mesDe(recebimento) : mesAtual(), empresa.regime);

  return (
    <aside
      aria-labelledby="previa-titulo"
      className="faixa flex min-w-0 flex-[2_1_320px] flex-col gap-[18px] rounded-cartao bg-petroleo p-7 text-mineral-claro lg:sticky lg:top-6"
    >
      <h2 id="previa-titulo" className="font-display text-[22px] font-bold tracking-[-0.02em]">
        Prévia desta venda
      </h2>
      {valor && divisao ? (
        <>
          <p aria-live="polite" className="text-[15px] text-nevoa">
            Venda de {reais(valor)}
            {recebimento && `, recebida em ${dataCurta(recebimento)}`}
          </p>
          <FaixaDividida
            tamanho="media"
            ficaComVoce={divisao.ficaComVoce}
            governo={divisao.governo}
            descricao={`${reais(divisao.ficaComVoce)} ficam com você e ${reais(divisao.governo)} vão para o governo`}
          />
          <dl className="flex flex-col text-[15px] tabular-nums">
            <div className="flex justify-between gap-3 border-b border-petroleo-claro py-2.5">
              <dt className="text-nevoa">Valor da venda</dt>
              <dd>{reais(valor)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-petroleo-claro py-2.5">
              <dt className="text-nevoa">IBS e CBS retidos</dt>
              <dd className="text-ambar-claro">{reais(divisao.governo)}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5 font-semibold">
              <dt>Cai na sua conta</dt>
              <dd>{reais(divisao.ficaComVoce)}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="rounded-bloco border-[1.5px] border-dashed border-petroleo-claro p-5 text-[15px] leading-normal text-nevoa">
          Digite o valor da venda para ver quanto fica com você e quanto vai para o governo.
        </p>
      )}
      <AvisoDeEstimativa regime={empresa.regime} naFaixa />
    </aside>
  );
}
