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
| `npm run instalador` | Gera o instalador para Windows em `dist/` |
| `npm test` | Roda os testes do motor: cálculo, armazenamento, entrada de dados e planilha |
| `npm run lint` | Verifica o código |

## Gerar o instalador

```bash
npm run instalador
```

Gera `dist/Previa-Setup-0.1.0.exe`, com cerca de 116 MB. Na primeira vez
precisa de internet para baixar o Electron e o NSIS; depois usa o cache.

- O instalador instala só para o usuário, sem pedir senha de administrador,
  cria atalhos na área de trabalho e no menu Iniciar e abre o app no fim.
- O app instalado funciona sem internet: as telas e as fontes vão dentro dele.
- Os dados ficam em `%APPDATA%\Prévia`. Desinstalar em Configurações > Apps
  apaga essa pasta também.
- O instalador não tem assinatura digital. Na primeira vez, o Windows mostra
  "O Windows protegeu o computador": clique em **Mais informações** e depois
  em **Executar assim mesmo**.
- Para uma versão nova, mude `version` no `package.json` antes de gerar.
- A configuração fica em `electron-builder.yml`. O ícone é o
  `electron/icone.svg`; o `icone.png` é o mesmo desenho em 512 px.
- Next e React ficam em `devDependencies` de propósito: o instalador leva só o
  export de `out/` e o `electron-serve`, por isso o app dentro dele tem menos
  de 2 MB.

Para apresentar, siga o [roteiro da demonstração](docs/roteiro-da-demonstracao.md).

## Onde fica cada coisa

- `src/app/entrar/`: Entrar. Acesso local, só com o e-mail: o primeiro cria o acesso neste computador e depois só ele abre. Senha só quando houver servidor
- `src/app/(app)/`: telas com o menu (Painel, Projeção, Vendas, Lançar venda, Dados da empresa, Transição, Clientes e Novo cliente do contador). Sem o acesso aberto, levam para Entrar
- `src/app/(app)/em-breve/`: a tela modelo do que ainda não existe. Os textos de NF-e, banco, ERP e crédito ficam em `recursos.ts`; cada um vira `/em-breve/<chave>/`
- `src/app/(acesso)/`: escolha de perfil (empresário ou contador) e cadastro, sem o menu
- `src/components/`: peças compartilhadas, como a `FaixaDividida` (verde e âmbar), o `EstadoVazio`, o `Campo` e a `Opcao` dos formulários, o `FormularioDaEmpresa` (cadastro e edição) e o `AvisoDeEstimativa`, que vai embaixo de toda tela com números
- Classes do `globals.css`: `botao` (ação principal), `botao-contorno` (secundária), `botao-texto` (Voltar, Cancelar) e `campo` (caixa de texto)
- `src/lib/`: o motor, sem tela
  - `armazenamento.ts`: único lugar que lê e grava os dados. As telas usam `useDados()` e as funções daqui, nunca o localStorage direto. Guarda empresas, perfil, acesso e a lista de espera do "Quero ser avisado"
  - `calculo.ts`: retenção, resumo do mês, projeção, mês de maior retenção, capital de giro e a `visaoGeral` que o Painel e a lista de clientes usam
  - `aliquotas.ts`: alíquota por ano e regime (26,5% provisória)
  - `exemplo.ts`: a empresa de exemplo, com os mesmos números do canvas
  - `entrada.ts`: lê valor, data, CNPJ e e-mail digitados e valida empresa e venda (formulário e planilha usam a mesma regra)
  - `planilha.ts`: modelo CSV e leitura da planilha enviada, com o erro de cada linha
  - `formatar.ts`: reais, datas e nome do mês para mostrar na tela
  - `tipos.ts`: `Empresa`, `Venda` e `ResumoDoMes`. Dinheiro sempre em centavos
- `src/app/globals.css`: cores, fontes e raios do visual, tirados do canvas
- `electron/main.mjs`: janela do app
