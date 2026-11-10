import type { Metadata } from "next";
import { Suspense } from "react";
import { NovaVenda } from "./FormularioDeVenda";

export const metadata: Metadata = { title: "Lançar venda" };

// O Suspense é exigido pelo useSearchParams (o ?editar=) no export estático.
export default function PaginaNovaVenda() {
  return (
    <Suspense>
      <NovaVenda />
    </Suspense>
  );
}
