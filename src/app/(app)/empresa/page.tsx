import type { Metadata } from "next";
import { DadosDaEmpresa } from "./DadosDaEmpresa";

export const metadata: Metadata = { title: "Dados da empresa" };

export default function PaginaEmpresa() {
  return <DadosDaEmpresa />;
}
