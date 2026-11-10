import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopoDaPagina } from "@/components/TopoDaPagina";
import { recursos, type ChaveDoRecurso } from "../recursos";
import { ListaDeEspera } from "./ListaDeEspera";

// Uma página pronta para cada recurso no build; outro endereço não existe.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(recursos).map((recurso) => ({ recurso }));
}

async function recursoDa({ params }: PageProps<"/em-breve/[recurso]">) {
  const { recurso } = await params;
  if (!(recurso in recursos)) notFound();
  return { chave: recurso as ChaveDoRecurso, ...recursos[recurso as ChaveDoRecurso] };
}

export async function generateMetadata(props: PageProps<"/em-breve/[recurso]">): Promise<Metadata> {
  return { title: `Em breve: ${(await recursoDa(props)).titulo}` };
}

// Modelo único para NF-e, banco, ERP e crédito: o que vai mudar e a lista de espera.
export default async function EmBreve(props: PageProps<"/em-breve/[recurso]">) {
  const { chave, titulo, descricao, nome, beneficios, enquanto } = await recursoDa(props);

  return (
    <>
      <TopoDaPagina
        titulo={titulo}
        descricao={descricao}
        selo={
          <span className="mb-1 inline-flex items-center gap-2 self-start rounded-full bg-ambar px-3 py-[5px] text-[13px] font-semibold text-petroleo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            Em breve
          </span>
        }
      />

      <main className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-6 px-4 pt-12 pb-[72px] sm:px-10">
        <section
          aria-labelledby="muda-titulo"
          className="flex min-w-0 flex-[3_1_420px] flex-col gap-1 rounded-cartao bg-papel p-6 sm:p-7"
        >
          <h2 id="muda-titulo" className="mb-2 font-display text-2xl font-bold tracking-[-0.02em]">
            O que muda quando estiver pronto
          </h2>
          <ul>
            {beneficios.map((beneficio) => (
              <li key={beneficio} className="flex gap-3.5 border-b border-linha-suave py-3.5 text-base leading-normal last:border-b-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0 text-verde-texto">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {beneficio}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-dashed border-campo pt-[18px]">
            <p className="text-[15px] text-texto-suave">{enquanto.texto}</p>
            <Link href={enquanto.href} className="botao-contorno text-[15px]">
              {enquanto.rotulo}
            </Link>
          </div>
        </section>

        <ListaDeEspera recurso={chave} nome={nome} />
      </main>
    </>
  );
}
