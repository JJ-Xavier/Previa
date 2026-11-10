"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useDados } from "@/lib/armazenamento";

// As telas do app só aparecem com o acesso aberto. Sem ele, a pessoa vai para Entrar.
export function ComAcesso({ children }: { children: ReactNode }) {
  const dados = useDados();
  const router = useRouter();
  const fechado = dados !== null && !dados.acesso?.aberto;

  useEffect(() => {
    if (fechado) router.replace("/entrar/");
  }, [fechado, router]);

  if (!dados || fechado) return null;
  return children;
}
