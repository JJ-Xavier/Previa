// Marca o que aparece na tela mas ainda não funciona no MVP.
export function SeloEmBreve({ naFaixa = false }: { naFaixa?: boolean }) {
  const cores = naFaixa
    ? "bg-petroleo-medio text-[11px] text-nevoa"
    : "bg-selo text-xs text-selo-texto";

  return <span className={`rounded-md px-2 py-0.5 font-semibold ${cores}`}>em breve</span>;
}
