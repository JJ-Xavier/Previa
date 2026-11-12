"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useConta } from "@/lib/armazenamento";

// As telas do app só aparecem com uma conta aberta. Sem ela, a pessoa vai para Entrar.
export function ComAcesso({ children }: { children: ReactNode }) {
  const conta = useConta();
  const router = useRouter();
  const fora = conta === null;

  useEffect(() => {
    if (fora) router.replace("/entrar/");
  }, [fora, router]);

  if (!conta) return null;
  return children;
}
