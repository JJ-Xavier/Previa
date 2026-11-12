import type { Metadata } from "next";
import { FormularioDeEntrada } from "./FormularioDeEntrada";

export const metadata: Metadata = { title: "Entrar" };

export default function Entrar() {
  return <FormularioDeEntrada />;
}
