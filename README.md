# Prévia

Simulador do impacto do split payment no caixa de pequenas empresas.
App desktop feito com Next.js dentro do Electron. Os dados ficam salvos no
próprio computador (localStorage).

- Plano de desenvolvimento: [docs/plano-de-desenvolvimento.md](docs/plano-de-desenvolvimento.md)
- Escopo do MVP: [docs/02-escopo.txt](docs/02-escopo.txt)
- Telas de referência: [canvas "Prévia — Telas do MVP"](https://claude.ai/artifact/F6p5rXECTuSeTshRrtcLRq)

## Como rodar

Precisa do Node.js 20 ou mais novo.

```bash
npm install
npm run dev
```

`npm run dev` sobe o Next em `http://localhost:3000` e abre a janela do app.

| Comando | O que faz |
|---|---|
| `npm run dev` | Desenvolvimento com a janela do Electron |
| `npm run dev:web` | Só o Next, para testar no navegador |
| `npm run build` | Gera o export estático em `out/` |
| `npm start` | Gera o build e abre o app como no instalador |
| `npm test` | Roda os testes do cálculo e do armazenamento |
| `npm run lint` | Verifica o código |

## Onde fica cada coisa

- `src/app/(app)/`: telas com o menu (Painel, Projeção, Vendas, Transição, Em breve, Clientes)
- `src/app/(acesso)/`: Entrar e Cadastro
- `src/components/`: peças compartilhadas, como a `FaixaDividida` (verde e âmbar) e o `EstadoVazio`
- Botões: use as classes `botao` (ação principal) e `botao-contorno` (secundária), definidas no `globals.css`
- `src/lib/`: o motor, sem tela
  - `armazenamento.ts`: único lugar que lê e grava os dados. As telas usam `useDados()` e as funções daqui, nunca o localStorage direto
  - `calculo.ts`: retenção, resumo do mês, projeção, mês de maior retenção e capital de giro
  - `aliquotas.ts`: alíquota por ano e regime (26,5% provisória)
  - `exemplo.ts`: a empresa de exemplo, com os mesmos números do canvas
  - `formatar.ts`: reais e nome do mês para mostrar na tela
  - `tipos.ts`: `Empresa`, `Venda` e `ResumoDoMes`. Dinheiro sempre em centavos
- `src/app/globals.css`: cores, fontes e raios do visual, tirados do canvas
- `electron/main.mjs`: janela do app
