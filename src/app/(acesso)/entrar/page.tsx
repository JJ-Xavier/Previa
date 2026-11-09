import type { Metadata } from "next";
import Link from "next/link";
import { EmConstrucao } from "@/components/EmConstrucao";
import { TopoDaPagina } from "@/components/TopoDaPagina";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return (
    <>
      <TopoDaPagina titulo="Entrar" />
      <EmConstrucao etapa={6} />
      <p className="mx-auto max-w-[1200px] px-4 sm:px-10">
        <Link href="/" className="font-semibold">
          Ir para o Painel
        </Link>
      </p>
    </>
  );
}
