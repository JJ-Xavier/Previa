// Marcador temporário das telas vazias da etapa 1. Some quando a tela for feita.
export function EmConstrucao({ etapa }: { etapa: number }) {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-12 sm:px-10">
      <p className="text-texto-suave">Esta tela entra na etapa {etapa} do plano de desenvolvimento.</p>
    </main>
  );
}
