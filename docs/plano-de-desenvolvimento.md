# Plano de desenvolvimento do MVP da Prévia

Versão 1.0, 9 de novembro de 2026.
Prazo: semana de 9 a 13 de novembro de 2026.

- Telas de referência: [canvas "Prévia — Telas do MVP"](https://claude.ai/artifact/F6p5rXECTuSeTshRrtcLRq)
- Escopo: [02-escopo.txt](02-escopo.txt)

As etapas estão em ordem de prioridade. Cada uma termina com algo que funciona
e pode ser mostrado. Ao fim da etapa 7, o app está pronto.

## Decisões que valem para todo o plano

| Tema | Decisão |
|---|---|
| Plataforma | App desktop: Next.js dentro do Electron. Em desenvolvimento roda no servidor local do Next; no instalador, as telas vão empacotadas e não precisam de servidor. |
| Dados | Salvos no próprio computador, no localStorage. Sem banco externo e sem API. |
| Entrada de dados | Lançamento manual, planilha modelo (CSV) e dados de exemplo. |
| Público | Empresário e contador (painel com vários clientes). |
| Visual | Direção B do canvas: faixa petróleo `#0F2A2E`, verde `#17786C` para "fica com você", âmbar `#F0A33A` para "vai para o governo". Fontes Bricolage Grotesque e Geist. |
| Alíquota | 26,5% provisória, em `src/lib/aliquotas.ts` por ano e regime, até o time definir a oficial. |
| Integrações | NF-e, banco, ERP e crédito aparecem só como tela "em breve". |

## Ordem das etapas

| # | Etapa | Dia sugerido |
|---|---|---|
| 1 | Base do app rodando | segunda |
| 2 | Dados e cálculo | segunda |
| 3 | Painel e projeção | terça |
| 4 | Entrada de dados | quarta |
| 5 | Painel do contador | quinta |
| 6 | Telas restantes e acabamento | quinta |
| 7 | Instalador e apresentação | sexta |

A ordem segue o valor do produto: primeiro o cálculo e o painel, que são a
proposta da Prévia. Depois vem a entrada dos dados, e por último as telas de
apoio. Se faltar tempo, o que fica de fora é o fim da lista.

## Etapa 1 · Base do app rodando

Uma janela do Electron abre o Next.js com o menu e as telas vazias.

- [x] Criar o projeto Next.js (App Router, TypeScript, Tailwind).
- [x] Adicionar o Electron. Em desenvolvimento ele abre `http://localhost:3000`; no build, carrega o export estático do Next (`output: 'export'`) com `electron-serve`.
- [x] Colocar as cores da direção B no Tailwind e as fontes com `next/font`, que ficam dentro do app e funcionam sem internet.
- [x] Criar o layout com a faixa petróleo e o menu: Painel, Projeção, Vendas, Transição e Crédito ("em breve").
- [x] Criar as rotas vazias de todas as telas.

**Pronto quando:** `npm run dev` abre a janela e o menu navega entre as telas.

## Etapa 2 · Dados e cálculo

O motor da Prévia, ainda sem tela.

- [x] Definir os tipos `Empresa` (nome, CNPJ, regime, prazo médio de recebimento) e `Venda` (cliente, valor, data da venda, data de recebimento).
- [x] Criar um único módulo de armazenamento que lê e grava no localStorage. Ele guarda uma lista de empresas e qual está ativa, o que já prepara o painel do contador. As telas nunca acessam o localStorage direto, então trocar por um banco depois mexe só nesse arquivo.
- [x] Criar `aliquotas.ts` com a alíquota por ano e por regime.
- [x] Escrever as funções de cálculo: retenção de uma venda, resumo do mês (recebido, governo, fica com você), projeção dos próximos meses, mês de maior retenção e capital de giro médio.
- [x] Criar os dados de exemplo: uma empresa fictícia com vendas de janeiro a junho de 2027.
- [x] Testar as funções de cálculo com Vitest.

**Pronto quando:** com os dados de exemplo, março mostra R$ 48.000,00 recebidos, R$ 12.720,00 para o governo e R$ 35.280,00 com a empresa, como no canvas.

## Etapa 3 · Painel e projeção (telas 3.1 e 3.2)

A tela principal mostrando os números da empresa.

- [ ] Componente da faixa dividida ("fica com você" e "vai para o governo"), usado em várias telas.
- [ ] Painel: faixa do mês atual, gráfico dos 6 meses com destaque no mês de maior retenção, capital de giro e "O que dá para fazer agora".
- [ ] Projeção: comparação "hoje e com o split payment" e tabela mês a mês com total.
- [ ] Botões de período: 6 e 12 meses funcionando. "Até 2033" fica com selo "em breve".
- [ ] Estado vazio: sem vendas, o painel convida a lançar a primeira venda ou carregar o exemplo.

**Pronto quando:** depois de carregar os dados de exemplo, Painel e Projeção ficam iguais ao canvas.

## Etapa 4 · Entrada de dados (telas 1.2, 2.1 e 2.2)

- [ ] Cadastro da empresa: nome, CNPJ, regime (Simples Nacional ou Lucro Presumido), venda para empresas e prazo médio.
- [ ] Lançar venda, com a prévia da divisão atualizando enquanto o usuário digita.
- [ ] Lista de vendas com editar e excluir.
- [ ] Planilha: baixar o modelo CSV e importar o arquivo, avisando quais linhas têm erro.
- [ ] Botões "Carregar exemplo" e "Apagar meus dados".

**Pronto quando:** uma venda lançada à mão ou por planilha muda o Painel na hora.

## Etapa 5 · Painel do contador

A contadora acompanha vários clientes no mesmo app. Essa tela ainda não está
no canvas: seguir o mesmo padrão visual das outras.

- [ ] No primeiro acesso, escolher o perfil: empresário ou contador.
- [ ] Lista de clientes com o resumo de cada um: retido no mês e capital de giro.
- [ ] Adicionar cliente, reaproveitando o cadastro da empresa.
- [ ] Abrir um cliente: Painel, Projeção e Vendas passam a mostrar aquela empresa, com um seletor no topo para trocar.

**Pronto quando:** o contador cadastra dois clientes, lança vendas em cada um e vê os números separados.

## Etapa 6 · Telas restantes e acabamento

- [ ] Entrar: acesso local simples, que cria ou abre o perfil salvo no computador. Senha de verdade só quando houver servidor.
- [ ] Transição 2026–2033, com conteúdo fixo.
- [ ] Tela modelo "em breve" para NF-e, banco, ERP e crédito. O "Quero ser avisado" guarda o e-mail no localStorage.
- [ ] Mensagens de erro e estados vazios nas telas de entrada de dados.
- [ ] Aviso "estimativa para planejamento" nas telas com números.

**Pronto quando:** todas as telas do canvas funcionam e nenhum botão fica sem destino.

## Etapa 7 · Instalador e apresentação

- [ ] Gerar o instalador para Windows com `electron-builder`.
- [ ] Instalar num computador que nunca teve o projeto e testar sem internet.
- [ ] Escrever o README: como rodar em desenvolvimento e como gerar o instalador.
- [ ] Montar o roteiro da demonstração: cadastro, dados de exemplo, painel, lançar venda, projeção, painel do contador e uma tela "em breve".

**Pronto quando:** o instalador funciona numa máquina limpa e a demonstração roda do início ao fim.

## Como dividir entre os quatro

Na segunda, o time faz as etapas 1 e 2 juntos, porque todo o resto depende
delas. A partir de terça, cada pessoa pega uma das etapas 3, 4, 5 e 6, que
podem andar em paralelo. Na sexta, todos fazem a etapa 7.

## Fora do MVP

- Importação automática de NF-e, Open Finance, ERP e originação de crédito.
- Login com senha, nuvem e sincronização entre computadores.
- Vendas ao consumidor final, MEI e Lucro Real.
- Projeção até 2033.
