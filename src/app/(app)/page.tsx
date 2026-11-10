import type { Metadata } from "next";
import { Painel } from "./Painel";

export const metadata: Metadata = { title: "Painel" };

export default function PaginaPainel() {
  return <Painel />;
}
