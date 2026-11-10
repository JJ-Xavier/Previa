import type { Metadata } from "next";
import { Projecao } from "./Projecao";

export const metadata: Metadata = { title: "Projeção mensal" };

export default function PaginaProjecao() {
  return <Projecao />;
}
