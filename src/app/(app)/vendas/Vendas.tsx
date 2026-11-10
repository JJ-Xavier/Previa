"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { EstadoVazio } from "@/components/EstadoVazio";
import { SeloEmBreve } from "@/components/SeloEmBreve";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import {
  adicionarVendas,
  apagarTudo,
  carregarExemplo,
  empresaAtiva,
  novoId,
  removerVenda,
  useDados,
} from "@/lib/armazenamento";
import { dividirVenda } from "@/lib/calculo";
import { dataCurta, nomeDoRegime, reais } from "@/lib/formatar";
import { lerPlanilha, modeloDaPlanilha, textoDoArquivo } from "@/lib/planilha";
import type { Empresa } from "@/lib/tipos";

type Aviso = { tipo: "ok" | "erro"; texto: string; linhas?: string[] };

// /vendas/?salva=<id> chega do formulário: mostra o aviso e destaca a venda salva.
export function Vendas() {
  const dados = useDados();
  const salva = useSearchParams().get("salva");
  if (!dados) return null;

  const empresa = empresaAtiva(dados);
  if (!empresa) return <EstadoVazio titulo="Vendas e recebimentos" temEmpresa={false} />;

  return <VendasDaEmpresa key={empresa.id} empresa={empresa} salva={salva} />;
}

function VendasDaEmpresa({ empresa, salva }: { empresa: Empresa; salva: string | null }) {
  const [aviso, setAviso] = useState<Aviso | null>(
    salva ? { tipo: "ok", texto: "Venda salva. O Painel já mostra o novo valor." } : null,
  );

  async function importar(arquivo: File) {
    if (!arquivo.name.toLowerCase().endsWith(".csv")) {
      setAviso({
        tipo: "erro",
        texto: "A Prévia lê planilhas em CSV. No Excel, use Arquivo > Salvar como > CSV e envie esse arquivo.",
      });
      return;
    }
    const { vendas, erros } = lerPlanilha(textoDoArquivo(await arquivo.arrayBuffer()), empresa.prazoMedioDias);
    if (erros.length > 0) {
      setAviso({
        tipo: "erro",
        texto: `Nada foi importado. Corrija ${erros.length === 1 ? "a linha abaixo" : `as ${erros.length} linhas abaixo`} e envie a planilha de novo.`,
        linhas: erros,
      });
      return;
    }
    adicionarVendas(empresa.id, vendas.map((venda) => ({ id: novoId(), ...venda })));
    setAviso({
      tipo: "ok",
      texto: `${vendas.length === 1 ? "1 venda importada" : `${vendas.length} vendas importadas`}. O Painel já mostra os novos valores.`,
    });
  }

  return (
    <>
      <TopoDaPagina
        titulo="Vendas e recebimentos"
        descricao="A simulação usa o que você coloca aqui. Quanto mais vendas lançadas, mais perto da realidade fica a previsão do seu caixa."
      />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 pt-12 pb-[72px] sm:px-10">
        <div aria-live="polite" className="empty:hidden">
          {aviso && <CaixaDeAviso aviso={aviso} aoFechar={() => setAviso(null)} />}
        </div>
        <ComoColocar aoEscolherArquivo={importar} />
        <Conexoes />
        <ListaDeVendas
          empresa={empresa}
          destaque={salva}
          aoExcluir={() => setAviso({ tipo: "ok", texto: "Venda excluída. O Painel já foi atualizado." })}
        />
        <SuaEmpresa empresa={empresa} />
      </main>
    </>
  );
}

function CaixaDeAviso({ aviso, aoFechar }: { aviso: Aviso; aoFechar: () => void }) {
  const linhas = aviso.linhas ?? [];
  const cores = aviso.tipo === "ok" ? "bg-verde-fundo text-verde-escuro" : "bg-erro-fundo text-erro";

  return (
    <div className={`flex items-start justify-between gap-4 rounded-bloco px-6 py-5 ${cores}`}>
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold">{aviso.texto}</p>
        {linhas.length > 0 && (
          <ul className="flex flex-col gap-1 text-[15px] text-petroleo">
            {linhas.slice(0, 10).map((linha) => (
              <li key={linha}>{linha}</li>
            ))}
            {linhas.length > 10 && <li>E mais {linhas.length - 10} linhas com erro.</li>}
          </ul>
        )}
      </div>
      <button type="button" onClick={aoFechar} className="botao-texto min-h-0 shrink-0 text-sm text-current">
        Fechar
      </button>
    </div>
  );
}

function baixarModelo() {
  const endereco = URL.createObjectURL(new Blob([modeloDaPlanilha()], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = endereco;
  link.download = "previa-modelo-de-vendas.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(endereco), 1000);
}

function ComoColocar({ aoEscolherArquivo }: { aoEscolherArquivo: (arquivo: File) => void }) {
  const arquivo = useRef<HTMLInputElement>(null);

  function escolheu(e: ChangeEvent<HTMLInputElement>) {
    const escolhido = e.target.files?.[0];
    e.target.value = ""; // permite enviar o mesmo arquivo de novo depois de corrigir
    if (escolhido) aoEscolherArquivo(escolhido);
  }

  return (
    <section aria-labelledby="como-titulo" className="flex flex-col gap-4">
      <h2 id="como-titulo" className="font-display text-[26px] leading-tight font-bold tracking-[-0.02em]">
        Como colocar seus dados
      </h2>
      <div className="flex flex-wrap items-stretch gap-4">
        <div className="flex flex-[3_1_380px] flex-col gap-3 rounded-cartao bg-papel p-7">
          <h3 className="font-display text-2xl font-bold tracking-[-0.02em]">Lançar uma venda</h3>
          <p className="max-w-[34rem] text-[15px] leading-[1.55] text-texto-suave">
            Digite o cliente, o valor e quando o dinheiro cai na conta. A Prévia já mostra quanto fica com você.
          </p>
          <Link href="/vendas/nova/" className="botao mt-auto self-start">
            Lançar venda
          </Link>
        </div>
        <div className="flex flex-[2_1_300px] flex-col gap-4">
          <CartaoPequeno
            titulo="Enviar uma planilha"
            texto="Preencha o modelo no Excel e envie de volta. Sem a data de recebimento, a Prévia usa o seu prazo médio."
          >
            <button type="button" onClick={baixarModelo} className="botao-contorno">
              Baixar modelo
            </button>
            <button type="button" onClick={() => arquivo.current?.click()} className="botao-contorno">
              Enviar
            </button>
            <input ref={arquivo} type="file" accept=".csv,text/csv" onChange={escolheu} hidden />
          </CartaoPequeno>
          <CartaoPequeno
            titulo="Usar dados de exemplo"
            texto="Veja a Prévia funcionando antes de lançar as suas vendas."
          >
            <button type="button" onClick={carregarExemplo} className="botao-contorno">
              Carregar exemplo
            </button>
          </CartaoPequeno>
        </div>
      </div>
    </section>
  );
}

function CartaoPequeno({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="flex flex-auto flex-wrap items-center justify-between gap-3 rounded-bloco bg-papel px-[22px] py-5">
      <div className="flex flex-[1_1_180px] flex-col gap-1">
        <h3 className="text-[17px] font-semibold">{titulo}</h3>
        <p className="text-sm leading-normal text-texto-suave">{texto}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

const conexoes = [
  ["Notas fiscais (NF-e)", "Direto da SEFAZ ou pelo arquivo XML"],
  ["Banco (Open Finance)", "Recebimentos da conta da empresa, com sua autorização"],
  ["Sistema de gestão (ERP)", "As vendas do sistema que você já usa"],
];

function Conexoes() {
  return (
    <section
      aria-labelledby="conexoes-titulo"
      className="flex flex-col gap-1.5 rounded-cartao border-[1.5px] border-dashed border-tracejado px-7 py-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="conexoes-titulo" className="font-display text-[22px] font-bold tracking-[-0.02em]">
          Conexões automáticas
        </h2>
        <SeloEmBreve />
      </div>
      <p className="mb-1.5 text-[15px] text-texto-suave">Em breve seus dados vão entrar sozinhos, sem digitar nada.</p>
      {conexoes.map(([nome, detalhe]) => (
        <div
          key={nome}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-linha py-3.5 last:pb-1"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold">{nome}</span>
            <span className="text-sm text-texto-suave">{detalhe}</span>
          </div>
          <Link href="/em-breve/" className="inline-flex min-h-11 items-center text-[15px] font-semibold">
            Quero ser avisado
          </Link>
        </div>
      ))}
    </section>
  );
}

const QUANTAS_MOSTRAR = 8;
const celula = "px-[22px] py-4 border-b border-linha-suave";

type ListaProps = { empresa: Empresa; destaque: string | null; aoExcluir: () => void };

function ListaDeVendas({ empresa, destaque, aoExcluir }: ListaProps) {
  // A última lançada aparece primeiro.
  const vendas = [...empresa.vendas].reverse();
  const [verTodas, setVerTodas] = useState(
    () => destaque !== null && !vendas.slice(0, QUANTAS_MOSTRAR).some((v) => v.id === destaque),
  );
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const visiveis = verTodas ? vendas : vendas.slice(0, QUANTAS_MOSTRAR);

  return (
    <section aria-labelledby="ultimas-titulo" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="ultimas-titulo" className="font-display text-[26px] leading-tight font-bold tracking-[-0.02em]">
          Últimas vendas lançadas
        </h2>
        {vendas.length > QUANTAS_MOSTRAR && (
          <button
            type="button"
            onClick={() => setVerTodas(!verTodas)}
            className="cursor-pointer text-[15px] font-semibold text-verde-texto hover:text-verde-escuro"
          >
            {verTodas ? "Ver só as últimas" : `Ver todas (${vendas.length})`}
          </button>
        )}
      </div>

      {vendas.length === 0 ? (
        <p className="rounded-bloco bg-papel px-[22px] py-6 text-[15px] text-texto-suave">
          Nenhuma venda lançada ainda. Lance a primeira ou envie uma planilha.
        </p>
      ) : (
        <div role="region" aria-labelledby="ultimas-titulo" tabIndex={0} className="relative overflow-x-auto rounded-bloco bg-papel">
          <table className="w-full min-w-[820px] border-collapse text-[15px] tabular-nums">
            <thead>
              <tr className="text-[13px] text-texto-suave">
                <th scope="col" className="border-b border-linha px-[22px] py-4 text-left font-semibold">
                  Cliente
                </th>
                <th scope="col" className="border-b border-linha px-[22px] py-4 text-left font-semibold">
                  Recebimento
                </th>
                <th scope="col" className="border-b border-linha px-[22px] py-4 text-right font-semibold">
                  Venda
                </th>
                <th scope="col" className="border-b border-linha px-[22px] py-4 text-right font-semibold text-ambar-texto">
                  Governo
                </th>
                <th scope="col" className="border-b border-linha px-[22px] py-4 text-right font-semibold text-verde-texto">
                  Fica com você
                </th>
                <th scope="col" className="border-b border-linha px-[22px] py-4">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((venda) => {
                const { governo, ficaComVoce } = dividirVenda(venda, empresa.regime);
                const nome = `venda de ${venda.cliente} recebida em ${dataCurta(venda.dataRecebimento)}`;
                return (
                  <tr key={venda.id} className={`last:[&>td]:border-b-0 ${venda.id === destaque ? "bg-verde-fundo" : ""}`}>
                    <td className={`${celula} font-medium`}>{venda.cliente}</td>
                    <td className={`${celula} text-texto-suave`}>{dataCurta(venda.dataRecebimento)}</td>
                    <td className={`${celula} text-right`}>{reais(venda.valor)}</td>
                    <td className={`${celula} text-right text-ambar-texto`}>{reais(governo)}</td>
                    <td className={`${celula} text-right font-semibold text-verde-texto`}>{reais(ficaComVoce)}</td>
                    <td className={`${celula} text-right whitespace-nowrap`}>
                      {excluindo === venda.id ? (
                        <span className="inline-flex items-center gap-3">
                          <span className="text-texto-suave">Excluir?</span>
                          <button
                            type="button"
                            autoFocus
                            aria-label={`Confirmar exclusão da ${nome}`}
                            onClick={() => {
                              removerVenda(empresa.id, venda.id);
                              setExcluindo(null);
                              aoExcluir();
                            }}
                            className="cursor-pointer font-semibold text-erro hover:underline"
                          >
                            Excluir
                          </button>
                          <button
                            type="button"
                            onClick={() => setExcluindo(null)}
                            className="cursor-pointer font-semibold text-petroleo hover:underline"
                          >
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-4">
                          <Link href={`/vendas/nova/?editar=${venda.id}`} aria-label={`Editar ${nome}`} className="font-semibold">
                            Editar
                          </Link>
                          <button
                            type="button"
                            aria-label={`Excluir ${nome}`}
                            onClick={() => setExcluindo(venda.id)}
                            className="cursor-pointer font-semibold text-texto-suave hover:text-erro"
                          >
                            Excluir
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SuaEmpresa({ empresa }: { empresa: Empresa }) {
  const contador = useDados()?.perfil === "contador";
  const [confirmando, setConfirmando] = useState(false);
  const itens = [
    ["Nome", empresa.nome],
    ["CNPJ", empresa.cnpj],
    ["Regime", nomeDoRegime(empresa.regime)],
    ["Prazo médio", `${empresa.prazoMedioDias} dias`],
  ];

  return (
    <section
      aria-labelledby="empresa-titulo"
      className="flex flex-col gap-5 rounded-cartao border-[1.5px] border-linha px-7 py-6"
    >
      <h2 id="empresa-titulo" className="font-display text-[22px] font-bold tracking-[-0.02em]">
        {contador ? "Dados do cliente" : "Sua empresa"}
      </h2>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-x-8 gap-y-4">
        {itens.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-col gap-1">
            <dt className="text-[13px] text-texto-suave">{rotulo}</dt>
            <dd className="text-base font-semibold">{valor}</dd>
          </div>
        ))}
      </dl>

      {confirmando ? (
        <div role="alert" className="flex flex-col gap-3 rounded-bloco bg-erro-fundo px-5 py-4">
          <p className="text-[15px] font-semibold text-erro">
            Isso apaga todas as empresas e vendas guardadas neste computador. Não dá para desfazer.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={apagarTudo} className="botao min-h-11 bg-erro px-5 text-[15px] hover:bg-[#912018]">
              Apagar tudo
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className="botao-texto">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link href="/empresa/" className="botao-contorno">
            Editar dados
          </Link>
          <button type="button" onClick={() => setConfirmando(true)} className="botao-contorno">
            Apagar meus dados
          </button>
        </div>
      )}
      <p className="text-[13px] text-texto-suave">
        Os dados ficam só neste computador. Nada é enviado pela internet.
        {!contador && (
          <>
            {" "}
            Acompanha várias empresas, como contador?{" "}
            <Link href="/perfil/" className="font-semibold">
              Trocar de perfil
            </Link>
          </>
        )}
      </p>
    </section>
  );
}
