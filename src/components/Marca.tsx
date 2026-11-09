// Logotipo: os dois blocos repetem a divisão da venda (73,5% / 26,5%).
export function Marca() {
  return (
    <span className="flex items-center gap-2.5 text-mineral-claro">
      <span aria-hidden="true" className="flex gap-[3px]">
        <span className="h-[22px] w-[18px] rounded-[5px] bg-verde" />
        <span className="h-[22px] w-2 rounded-[5px] bg-ambar" />
      </span>
      <span className="font-display text-2xl font-extrabold tracking-[-0.03em]">Prévia</span>
    </span>
  );
}
