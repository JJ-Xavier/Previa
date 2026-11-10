import type { Metadata } from "next";
import { Suspense } from "react";
import { Vendas } from "./Vendas";

export const metadata: Metadata = { title: "Vendas e recebimentos" };

// O Suspense é exigido pelo useSearchParams (o ?salva=) no export estático.
export default function PaginaVendas() {
  return (
    <Suspense>
      <Vendas />
    </Suspense>
  );
}
