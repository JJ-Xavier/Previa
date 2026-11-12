"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { EstadoVazio } from "@/components/EstadoVazio";
import { SeloEmBreve } from "@/components/SeloEmBreve";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import {
  adicionarVendas,
  apagarConta,
  carregarExemplo,
  empresaAtiva,
  novoId,
  removerVenda,
  useDados,
} from "@/lib/armazenamento";
import { dividirVenda } from "@/lib/calculo";
import { dataCurta, nomeDoPublico, nomeDoRegime, reais } from "@/lib/formatar";
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

// A lista ocupa a coluna larga; as outras formas de colocar dados ficam na estreita,
// para a tela caber na janela sem rolar à toa.
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
    const texto = textoDoArquivo(await arquivo.arrayBuffer());
    const { vendas, erros } = lerPlanilha(texto, empresa.prazoMedioDias, empresa.publico);
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
        descricao="A simulação usa as vendas que você coloca aqui. Quanto mais vendas, mais perto da realidade."
      />
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-8 pb-12 sm:px-10">
        <div aria-live="polite" className="empty:hidden">
          {aviso && <CaixaDeAviso aviso={aviso} aoFechar={() => setAviso(null)} />}
        </div>
        <div className="flex flex-wrap items-start gap-x-6 gap-y-6">
          <div className="flex min-w-0 flex-[1_1_600px] flex-col gap-6">
            <ListaDeVendas
              empresa={empresa}
              destaque={salva}
              aoExcluir={() => setAviso({ tipo: "ok", texto: "Venda excluída. O Painel já foi atualizado." })}
            />
            <SuaEmpresa empresa={empresa} />
          </div>
          <aside aria-label="Outras formas de colocar seus dados" className="flex min-w-0 flex-[0_1_264px] flex-col gap-4">
            <OutrasFormas aoEscolherArquivo={importar} />
            <Conexoes />
          </aside>
        </div>
      </main>
    </>
  );
}

function CaixaDeAviso({ aviso, aoFechar }: { aviso: Aviso; aoFechar: () => void }) {
  const linhas = aviso.linhas ?? [];
  const cores = aviso.tipo === "ok" ? "bg-verde-fundo text-verde-escuro" : "bg-erro-fundo text-erro";

  return (
    <div className={`flex items-start justify-between gap-4 rounded-bloco px-6 py-4 ${cores}`}>
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

function OutrasFormas({ aoEscolherArquivo }: { aoEscolherArquivo: (arquivo: File) => void }) {
  const arquivo = useRef<HTMLInputElement>(null);

  function escolheu(e: ChangeEvent<HTMLInputElement>) {
    const escolhido = e.target.files?.[0];
    e.target.value = ""; // permite enviar o mesmo arquivo de novo depois de corrigir
    if (escolhido) aoEscolherArquivo(escolhido);
  }

  return (
    <section aria-labelledby="formas-titulo" className="flex flex-col rounded-bloco bg-papel px-5 py-4">
      <h2 id="formas-titulo" className="sr-only">
        Outras formas de colocar seus dados
      </h2>
      <Forma
        titulo="Enviar uma planilha"
        texto="Preencha o modelo no Excel e envie de volta. Sem a data de recebimento, vale o seu prazo médio."
      >
        <button type="button" onClick={baixarModelo} className="botao-contorno">
          Baixar modelo
        </button>
        <button type="button" onClick={() => arquivo.current?.click()} className="botao-contorno">
          Enviar planilha
        </button>
        <input ref={arquivo} type="file" accept=".csv,text/csv" onChange={escolheu} hidden />
      </Forma>
      <Forma titulo="Usar dados de exemplo" texto="Seis meses de vendas para ver a Prévia funcionando.">
        <button type="button" onClick={carregarExemplo} className="botao-contorno">
          Carregar exemplo
        </button>
      </Forma>
    </section>
  );
}

function Forma({ titulo, texto, children }: { titulo: string; texto: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-linha-suave py-3 last:border-b-0">
      <h3 className="text-base font-semibold">{titulo}</h3>
      <p className="text-sm leading-normal text-texto-suave">{texto}</p>
      <div className="mt-1 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

const conexoes = [
  ["Notas fiscais (NF-e)", "/em-breve/nfe/"],
  ["Banco (Open Finance)", "/em-breve/banco/"],
  ["Sistema de gestão (ERP)", "/em-breve/erp/"],
];

function Conexoes() {
  return (
    <section
      aria-labelledby="conexoes-titulo"
      className="flex flex-col rounded-bloco border-[1.5px] border-dashed border-tracejado px-5 py-4"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 id="conexoes-titulo" className="text-base font-semibold">
          Conexões automáticas
        </h2>
        <SeloEmBreve />
      </div>
      <p className="mt-1 mb-1 text-sm text-texto-suave">Seus dados vão entrar sozinhos, sem digitar nada.</p>
      {conexoes.map(([nome, href]) => (
        <div key={nome} className="flex flex-wrap items-center justify-between gap-x-3 border-t border-linha py-1.5">
          <span className="text-[15px] font-medium">{nome}</span>
          <Link
            href={href}
            aria-label={`Quero ser avisado: ${nome}`}
            className="inline-flex min-h-10 items-center text-sm font-semibold"
          >
            Quero ser avisado
          </Link>
        </div>
      ))}
    </section>
  );
}

const QUANTAS_MOSTRAR = 6;
const cabecalho = "border-b border-linha px-3 py-3 font-semibold whitespace-nowrap";
const celula = "border-b border-linha-suave px-3 py-3 whitespace-nowrap";

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
    <section aria-labelledby="ultimas-titulo" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 id="ultimas-titulo" className="font-display text-2xl leading-tight font-bold tracking-[-0.02em]">
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
        <Link href="/vendas/nova/" className="botao min-h-11 px-6 text-[15px]">
          Lançar venda
        </Link>
      </div>

      {vendas.length === 0 ? (
        <p className="rounded-bloco bg-papel px-5 py-6 text-[15px] text-texto-suave">
          Nenhuma venda lançada ainda. Lance a primeira, envie uma planilha ou carregue o exemplo.
        </p>
      ) : (
        <div role="region" aria-labelledby="ultimas-titulo" tabIndex={0} className="relative overflow-x-auto rounded-bloco bg-papel">
          <table className="w-full border-collapse text-[15px] tabular-nums">
            <thead>
              <tr className="text-[13px] text-texto-suave">
                <th scope="col" className={`${cabecalho} text-left`}>
                  Cliente
                </th>
                <th scope="col" className={`${cabecalho} text-left`}>
                  Recebimento
                </th>
                <th scope="col" className={`${cabecalho} text-right`}>
                  Venda
                </th>
                <th scope="col" className={`${cabecalho} text-right text-ambar-texto`}>
                  Governo
                </th>
                <th scope="col" className={`${cabecalho} text-right text-verde-texto`}>
                  Fica com você
                </th>
                <th scope="col" className={cabecalho}>
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
                    <td className={`${celula} font-medium`}>
                      {/* Nome comprido termina em "..."; o nome inteiro aparece ao passar o mouse. */}
                      <span className="block max-w-52 truncate min-[1400px]:max-w-80" title={venda.cliente}>
                        {venda.cliente}
                      </span>
                    </td>
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
    ["CNPJ", empresa.cnpj],
    ["Regime", nomeDoRegime(empresa.regime)],
    ["Vende para", nomeDoPublico(empresa.publico)],
    ["Prazo médio", `${empresa.prazoMedioDias} dias`],
  ];

  return (
    <section aria-labelledby="empresa-titulo" className="flex flex-col gap-4 rounded-bloco border-[1.5px] border-linha px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="empresa-titulo" className="text-base font-semibold">
          {contador ? "Dados do cliente" : "Sua empresa"}: {empresa.nome}
        </h2>
        {!confirmando && (
          <div className="flex flex-wrap gap-2">
            <Link href="/empresa/" className="botao-contorno">
              Editar dados
            </Link>
            <button type="button" onClick={() => setConfirmando(true)} className="botao-contorno">
              Apagar meus dados
            </button>
          </div>
        )}
      </div>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-3">
        {itens.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-col gap-0.5">
            <dt className="text-[13px] text-texto-suave">{rotulo}</dt>
            <dd className="text-[15px] font-semibold">{valor}</dd>
          </div>
        ))}
      </dl>

      {confirmando && (
        <div role="alert" className="flex flex-col gap-3 rounded-bloco bg-erro-fundo px-5 py-4">
          <p className="text-[15px] font-semibold text-erro">
            Isso apaga a sua conta e todas as empresas e vendas dela neste computador. Não dá para desfazer.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={apagarConta} className="botao min-h-11 bg-erro px-5 text-[15px] hover:bg-[#912018]">
              Apagar conta e dados
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className="botao-texto">
              Cancelar
            </button>
          </div>
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
