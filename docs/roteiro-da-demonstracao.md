# Roteiro da demonstração

A demonstração leva cerca de 7 minutos e usa o app instalado, sem internet.
Os valores de "Confira" foram tirados do app instalado, rodando este roteiro
com a data do computador em novembro de 2026. Se um número na tela for
diferente, algum passo saiu diferente do roteiro.

A história tem duas pessoas: o Marcos, dono de uma distribuidora que vende
para condomínios e escritórios, e a Fernanda, contadora que acompanha várias
empresas.

## Antes de apresentar

- [ ] Instalar com o `Previa-Setup-0.1.0.exe` no computador da apresentação.
- [ ] Começar com o app vazio. Se ele abrir no Painel, ou em Entrar com um
      e-mail já preenchido, sobraram dados de um ensaio: entre, vá em
      **Vendas** e use **Apagar meus dados**, no fim da tela. O app volta
      para Entrar, vazio.
- [ ] Maximizar a janela. A internet pode ficar desligada.
- [ ] Ensaiar uma vez do início ao fim e apagar os dados de novo.

## Roteiro

### 1. Entrar (30 s)

**Faça:** abra a Prévia. Digite `marcos@boalimpeza.com.br` e clique em
**Entrar**.

**Diga:** "Com o split payment, o imposto sai na hora em que o cliente paga, e
não quando a guia vence. A Prévia mostra quanto de cada venda fica com a
empresa. Os dados ficam só neste computador."

**Confira:** abre a tela "Como você vai usar a Prévia?".

### 2. Cadastro da empresa (45 s)

**Faça:** clique em **Para a minha empresa** e preencha:

| Campo | Valor |
|---|---|
| Nome da empresa | `Distribuidora Boa Limpeza` |
| CNPJ | `12.345.678/0001-95` |
| Regime tributário | Simples Nacional (já vem marcado) |
| Em média, quantos dias você leva para receber? | 30 (já vem preenchido) |

Clique em **Continuar**.

**Diga:** "MEI, Lucro Real e venda ao consumidor final aparecem como 'em
breve': o split payment começa pelas vendas entre empresas."

**Confira:** abre Vendas e recebimentos, com "Distribuidora Boa Limpeza" no
topo.

### 3. Dados de exemplo (30 s)

**Faça:** em "Como colocar seus dados", clique em **Carregar exemplo**.

**Diga:** "Dá para lançar venda por venda, mandar uma planilha ou, para ver
funcionando, carregar seis meses de vendas de exemplo. A importação de notas,
banco e sistema de gestão vem depois." Aponte para "Conexões automáticas".

**Confira:** o topo passa a mostrar "Empresa exemplo" num seletor.

### 4. Painel (1 min)

**Faça:** clique em **Painel** no menu.

**Confira e diga:**
- Janeiro de 2027: "De cada R$ 100 que você recebe, R$ 73,50 ficam com você."
- A faixa dividida: de R$ 44.000,00 recebidos, R$ 32.340 ficam com a empresa
  e R$ 11.660 vão para o governo.
- O gráfico: maio é o mês com mais dinheiro retido, R$ 13.780,00.
- Capital de giro que some: R$ 12.720 por mês. "É o dinheiro do imposto que
  hoje fica no caixa até a guia vencer. Com o split payment, ele sai no dia
  do pagamento."

### 5. Lançar uma venda (1 min)

**Faça:** clique em **Vendas** no menu e depois em **Lançar venda**. Preencha:

| Campo | Valor |
|---|---|
| Cliente | `Condomínio Jardim das Flores` |
| Valor da venda | `10000` |
| Data da venda | `15/01/2027` |
| Como você vai receber? | À vista |

**Confira:** a "Prévia desta venda", ao lado, mostra R$ 7.350 com você e
R$ 2.650 para o governo, antes de salvar.

**Faça:** clique em **Salvar venda**. Aparece "Venda salva. O Painel já mostra
o novo valor." Clique em **Painel**.

**Confira:** janeiro agora tem R$ 54.000,00 recebidos, R$ 39.690 com a empresa
e R$ 14.310 para o governo. Janeiro passa a ser o mês de maior retenção.

### 6. Projeção (45 s)

**Faça:** clique em **Projeção** no menu. Fique em **6 meses**: o exemplo só
tem vendas de janeiro a junho, então em 12 meses o segundo semestre aparece
zerado.

**Diga:** mostre o quadro "Uma venda de R$ 10.000, hoje e com o split
payment": hoje os R$ 2.650 do imposto passam pelo caixa, com o split payment
vão direto para o governo. Aponte "Até 2033", que está "em breve".

### 7. Painel do contador (1 min)

**Faça:** clique em **Vendas**, role até o fim e clique em **Trocar de
perfil**. Escolha **Para os meus clientes**.

**Diga:** "A Fernanda é contadora. Ela vê todos os clientes numa lista só."

**Confira:**
- "Somando os clientes, R$ 13.162 por mês deixam de ficar no caixa."
- Distribuidora Boa Limpeza: "Sem vendas lançadas".
- Empresa exemplo: R$ 14.310,00 retidos em janeiro de 2027, R$ 13.162 por mês
  de capital de giro e 37 vendas.

**Faça:** clique em **Abrir** na Empresa exemplo. Abre o Painel do cliente.

### 8. Uma tela "em breve" (45 s)

**Faça:** clique em **Crédito** no menu.

**Diga:** "Notas fiscais, banco, sistema de gestão e crédito usam esta mesma
tela. A lista de espera mede quem quer cada recurso."

**Faça:** clique em **Quero ser avisado**. O e-mail já vem preenchido.

**Confira:** "Pronto. Vamos avisar em marcos@boalimpeza.com.br no dia em que o
planejamento de crédito estiver funcionando."

No MVP o e-mail fica guardado só no computador. Se perguntarem, diga isso.

### 9. Fechamento (30 s)

**Faça:** clique em **Transição** no menu.

**Diga:** "A reforma muda aos poucos até 2033. Por enquanto, a Prévia usa uma
alíquota de referência de 26,5%: os números são uma estimativa para
planejamento, não o valor da guia."

## Se algo der errado

- **O app abriu no Painel, ou com dados de outro ensaio:** vá em **Vendas** e
  use **Apagar meus dados**. Se não der para entrar, desinstale e instale de
  novo: desinstalar apaga os dados.
- **"O Windows protegeu o computador" ao instalar:** clique em **Mais
  informações** e em **Executar assim mesmo**. Acontece porque o instalador
  não tem assinatura digital.
- **Os valores do Painel não batem com o roteiro:** confira a data da venda
  (15/01/2027) e se marcou **À vista**. Se o Painel abriu em outro mês, use as
  setas ao lado do mês para voltar a janeiro de 2027.

## Teste numa máquina limpa

Faça uma vez antes da apresentação, num computador que nunca teve o projeto:

- [ ] Levar só o `Previa-Setup-0.1.0.exe`, num pendrive.
- [ ] Desligar a internet, no Wi-Fi e no cabo.
- [ ] Instalar e passar pelo aviso do Windows.
- [ ] Rodar o roteiro inteiro e conferir os valores.
- [ ] Fechar e abrir o app: os dados continuam e ele abre direto no Painel.
- [ ] Desinstalar em Configurações > Apps > Prévia e conferir que a pasta
      `%APPDATA%\Prévia` sumiu.
