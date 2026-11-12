import type { Metadata } from "next";
import { FormularioDeConta } from "./FormularioDeConta";

export const metadata: Metadata = { title: "Criar conta" };

export default function CriarConta() {
  return <FormularioDeConta />;
}
