# Floripa Explorer — App de avisos e alertas inteligente (PWA)

**Atualizado:** 2026-11-11 (revisão técnica e de mercado) · **Status:** app construído com dados de exemplo; ajustes e lançamento pela frente · **Temporada:** 15/nov/2026 a 15/mar/2027 · **Nome:** Floripa Explorer (provisório)

---

## Context

O app já existe: o **Floripa Explorer** foi construído em outra sessão. A documentação está em `OneDrive\Desktop\floripa-explorer-documentacao.md`. O código e as imagens o dono envia na hora de construir.

A especificação chegou cortada em "4. Loja". Por isso o núcleo bate com o combinado, mas pagamento, guias, passes, QR, rastreio e IA saíram por padrão e divergem. Este plano faz três coisas:
- registra as decisões finais do dono;
- lista os ajustes no código;
- monta a **estrutura de conversão** (dor, mecanismo único, copy, anúncios, funil), porque o lucro depende de duas alavancas: **subir a conversão e baixar o CPL**.

**Decisões do dono:**
- Nome **Floripa Explorer** por enquanto.
- **Vercel** com domínio próprio.
- **Stripe** como pagamento.
- **Popular Times** entra, analisado na §8.
- Instruções da **TomTom** com o link de cadastro.
- **Pré-ativação por data:** a pessoa informa ida e volta antes do checkout, e o sistema liga sozinho na data de ida (§3.3).
- **Alerta de confirmação até 10 dias depois da compra**, com botões Confirmar e Remarcar. Sem resposta, confirma automaticamente (§3.4).
- **Remarcação com limite** e **regras de cancelamento** publicadas (§3.4 e §3.5).
- **Extensão de dias** comprada pelo painel (§3.6).
- **Mínimo de custo, máximo de vendas.** Cálculo bruto, sem filigrana.
- Estratégias orgânicas ficam fora deste documento.
- Parcerias com restaurantes e bares por troca de público, sem ganho em cima, ainda **a definir** (§12).
- Produtos e recomendações dentro do app: **ideia para depois**, sem definição.

---

## 1. Premissas — todos os números saem daqui

| Premissa | Valor | Base |
|---|---|---|
| Câmbio | **R$ 5,40 / USD** | fixado |
| Mercado | ordem de **100 a 130 mil grupos** por via aérea, mais a estrada | §1.1 · quem compra é o grupo, não a pessoa |
| Mistura de passes | **55% USD 19 · 35% USD 29 · 10% USD 49** | ⚠️ estimativa minha, entre os 6,5 dias de permanência no litoral e as 11,2 noites do argentino no Brasil (§1.1). O beta mede |
| → Ticket médio do passe | **USD 25,50 = R$ 137,70** | antes era USD 29 para todos |
| Guias | USD 7 cada · **0,40 guia por pagante** | 25% levam 1 no checkout + 15% compram depois · R$ 15,12 por pagante |
| Pacotes de roteiro | 10% dos pagantes · média USD 7 | R$ 3,78 por pagante |
| → **Receita bruta por pagante** | **R$ 156,60** | 137,70 + 15,12 + 3,78 |
| **Taxa Stripe** | **8,3% da receita** | 7,99% (3,99% + 2% cartão internacional + ~2% conversão) + R$ 0,39 por transação ([Stripe BR](https://stripe.com/br/pricing)) |
| → **Receita líquida por pagante** | **R$ 143,66** | 156,60 − 12,94 |
| CPL (cadastro ou compra) | **USD 1,50 = R$ 8,10** | ⚠️ estimativa — a escada de mídia mede |
| Conversão em pagante | **8% dos leads** | ⚠️ estimativa, sem dado que a sustente — a escada de mídia mede |
| Leads sem mídia (QR A6 e orgânico) | A 750 · B 1.100 · C 1.500 · D 3.000 | ⚠️ estimativa. É daqui que sai a maior parte do lucro (§10.1) |
| **Custo fixo da temporada** | **R$ 830** (A e B) · **R$ 1.154** (C e D) | §9 · C e D pagam o envio de e-mail |

**Ficam fora do cálculo bruto:**
- o guia avulso de quem não paga e a extensão de dias, que somam;
- o desconto de 10% do QR, que subtrai;
- reembolsos e contestações, que subtraem. No reembolso a Stripe não devolve a taxa. O beta mede o percentual;
- **impostos.** O líquido deste plano é **antes de imposto**. Recebendo no CPF, a regra geral é carnê-leão mensal pela tabela progressiva, que chega a 27,5%. ⚠️ Um contador define CPF ou CNPJ antes da primeira venda (§14).

### 1.1 Mercado — o que os dados dizem

Fonte principal: [Fecomércio-SC, Turismo de Verão no Litoral Catarinense 2026](https://www.fecomercio-sc.com.br/wp-content/uploads/2026/03/Temporada-de-Verao-2026.pdf), 1.200 turistas entrevistados de janeiro a março de 2026.

| Dado | Valor | O que muda no plano |
|---|---|---|
| Turistas em Florianópolis que falam espanhol | **55%**: argentinos 43%, uruguaios 5%, chilenos 4,4%, paraguaios 2,9% | O público existe e é a maioria. **Uruguai entra no anúncio** junto com a Argentina (§10.5) |
| Quem viaja | famílias 53%, casais 32% | **Um passe por grupo.** A copy vende "un pase para toda la familia" e o sistema limita os aparelhos (§4, ajuste 23) |
| Permanência | **6,5 dias** em média na hospedagem do litoral (2026). Argentino no Brasil: 11,2 noites (Embratur, 2024, país inteiro) | A maioria cai no passe de USD 19. O ticket médio desce de USD 29 para USD 25,50 |
| Hospedagem em Florianópolis | **49,7% em imóvel alugado**; Airbnb e Booking fazem metade das locações | O QR A6 rende mais com **anfitrião e administradora de temporada** do que com hotel (§10.6) |
| Transporte | 72,3% de carro próprio, 14,2% de avião (todos os turistas do litoral) | O trecho da BR-101 e o guia "Manejar en Brasil" têm público grande |
| Queixas em Florianópolis | **trânsito é o ponto negativo mais citado**; depois viroses, balneabilidade e preço | Confirma a dor da §10.3 com dado, não só com palpite |
| Gasto do grupo argentino | R$ 10.983 por viagem (−17,5% contra 2025) | O passe custa cerca de 1% da viagem. O turista está mais cauteloso |
| Tendência | Na 1ª quinzena de janeiro de 2026, a fatia de argentinos em Florianópolis caiu de 39% para 24%; a temporada fechou em 43% | O fluxo depende do câmbio. Risco na §11 |

**Tamanho do mercado (correção).** O número antigo, "669.000 argentinos e chilenos", estava errado como leitura: bate com o **movimento de passageiros internacionais do aeroporto** no verão 2024/25, que soma embarque e desembarque e inclui brasileiros. O aeroporto projetava 819 mil para dezembro a março de 2025/26, 19% acima do verão anterior. Por inferência minha, isso dá de 300 a 400 mil pessoas chegando de avião, ou **100 a 130 mil grupos**. Quem vem de carro soma e não está medido aqui. O cenário D precisa de 560 pagantes, menos de 0,5% desses grupos: **o mercado não é o limite; a conversão e o CPL são.**

---

## 2. Regiões e trechos de trânsito

| Área | Praias em destaque | Trechos TomTom |
|---|---|---|
| **Norte** | Jurerê, Daniela, Canasvieiras, Ingleses, Santinho | SC-401 (Saco Grande / Cacupé) · **SC-403 (novo)** |
| **Leste** | Lagoa da Conceição, Joaquina, Mole, Barra da Lagoa | SC-404 Morro da Lagoa · centrinho / ponte da Lagoa |
| **Sul** | Campeche, Armação, Matadeiro, Pântano do Sul | SC-405 Rio Tavares · **SC-406 (novo)** |
| **Centro e pontes** | Beira-Mar, Coqueiros, Itaguaçu | Pontes Pedro Ivo / Colombo Salles · Beira-Mar Norte · **Via Expressa BR-282 (novo)** |
| **Continente BR-101 (sentido Ilha)** | Palhoça, São José, Biguaçu | BR-101 em Biguaçu, São José/Kobrasol e Palhoça |

**12 trechos:** os 9 que já existem e 3 novos.
- A **Via Expressa** é o gargalo de quem vem da BR-101.
- **SC-403** e **SC-406** são os acessos que mais travam no verão.

---

## 3. Produto

### O que já existe e fica

- **Cadastro e teste.** E-mail e senha. **Teste de 48 h que começa no cadastro.** Quem testa em casa vê os dados reais e compra com a data da viagem, então o teste não se perde.
- **Navegação.** Livre entre as 5 áreas. As favoritas definem o push e a tela inicial.
- **Avisos por regras a cada 12 min:** INMET, vento, calor, ar, chuva, UV, ondas, trânsito e balneabilidade. Ordenados por gravidade, com o selo "dados guardados" quando uma fonte cai.
- **Card da IA:** 1 por área, gerado a cada 15 min numa chamada só. Cita as fontes, não inventa, e o dono pode bloquear.
- **Roteiros com IA:**
  - 3 inclusos para quem pagou;
  - chuva ou calor, até 3 estilos;
  - **só locais da base curada**, e o servidor rejeita qualquer outro;
  - abrem offline;
  - pacotes +5 / +10 / +20 por USD 5 / 8 / 12.
- **Push:** só 🔴 e 🟠, nas áreas favoritas, uma vez por aviso. No iPhone exige o app na tela de início (iOS 16.4+).
- **Telas:** Região (Resumo e Gráficos), Praias, Trânsito, Mar e clima, Avisos, Roteiros, Mapa, Conta, Planos, Loja, Compra, Como usar e Painel do dono.
- **Design aprovado:** oceano, turquesa e coral, 4 gráficos sem eixos. Ver §4 da documentação e as imagens.

### 3.1 Preços

| Item | Preço | Com QR (−10%) |
|---|---|---|
| Passe 7 dias | USD 19 | USD 17,10 |
| **Passe 14 dias** (destaque) | **USD 29** | **USD 26,10** |
| Passe Temporada (até 15/03/2027) | USD 49 | USD 44,10 |
| Guia "Dinero en Brasil sin sorpresas" | USD 7 | — |
| Guia "Manejar en Brasil" | USD 7 | — |
| Guia "Playa segura: salud y emergencias" | USD 7 | — |
| Pacotes de roteiro +5 / +10 / +20 | USD 5 / 8 / 12 | — |
| Extensão +1 / +3 / +7 dias | USD 4 / 9 / 15 | — |

- O passe Temporada **sai da vitrine em 15/02**, para não vender temporada com menos de 30 dias.
- O desconto do QR vale **só para o passe**.

### 3.2 Duas portas de entrada

```
                ┌─ "Probar gratis 48 h" ─→ cadastro → TESTE COMEÇA → paywall → datas → passe
Anúncio / QR ───┤
                └─ "Comprar ahora" ─────→ datas → checkout SEM login → Stripe → conta criada → "creá tu contraseña"
                                          → acesso na data de ida, SEM teste
QR A6 → ?o=<ponto> → 10% no passe, nas duas portas · origem gravada no cadastro e na compra
```

### 3.3 Pré-ativação por data

**As datas escolhem o passe.** Antes do checkout, a pessoa informa ida e volta, dentro de 15/11/2026 a 15/03/2027. O preço não é por dia exato, porque isso derrubaria o ticket:

| Duração da viagem | Passe pré-selecionado | Acesso |
|---|---|---|
| Até 7 noites | 7 dias · USD 19 · oferta de upgrade para o de 14 dias | Da ida até o fim do dia da volta |
| 8 a 14 noites | 14 dias · USD 29 | Da ida até o fim do dia da volta |
| 15 noites ou mais | Temporada · USD 49 | Da ida até 15/03/2027 |

**A conta é por noites, e o dia da volta sempre entra.** Uma semana de sábado a sábado são 7 noites e 8 datas no calendário. Contando por dias, essa viagem cairia no passe de USD 29 ou ficaria sem acesso justamente no dia de ir ao aeroporto, que é quando o aviso de trânsito mais vale. Todo horário é o de Brasília: o acesso abre à 0h da ida e fecha às 23h59 da volta.

**Antes da data de ida:**
- Abertos: conta, painel da viagem, contagem regressiva, guias comprados e roteiros quando faltarem 15 dias ou menos.
- Bloqueados: dados ao vivo, card da IA e push.
- Lembretes por e-mail 7 dias antes, 1 dia antes e no dia da ida.

**Na data de ida:** o sistema liga sozinho e os dias começam a contar, mesmo que a pessoa não abra o app.

**Botão "Ya llegué":** para quem chegou antes. Adianta o início uma vez, sem somar dias.

**Compra com início hoje ou amanhã (quem já está em Floripa):** o acesso começa logo e não há etapa de confirmação.

### 3.4 Confirmação e remarcação

**Alerta de confirmação, com botões Confirmar e Remarcar:**
- Vai por e-mail na compra, e de novo no 7º dia se não houver resposta. Fica também como aviso no painel.
- **Sem resposta, confirma automaticamente** no 10º dia depois da compra ou 24 h antes da ida, o que vier primeiro.
- O sistema grava data e hora do clique, e marca separadamente o que foi confirmado automaticamente. Só o clique é prova forte; a confirmação automática não é aceite.

**Remarcação (limites recomendados, o dono pode ajustar):**
- **2 remarcações por compra.** Depois disso, só no atendimento manual.
- Até 24 h antes da ida. Depois que o acesso começou, não remarca.
- A nova data fica dentro da temporada, até 15/03/2027.
- Mesma duração do passe. Viagem mais longa paga a diferença.
- **Cada remarcação reinicia o alerta de confirmação, mas NÃO reabre o prazo de reembolso.** São dois relógios separados:

| Relógio | Quando começa | Reinicia ao remarcar? |
|---|---|---|
| Confirmação da viagem | Na compra | **Sim** |
| Reembolso pelo botão | Na compra, 1 vez só | **Não** |

**Por que o limite existe.** Remarcar não custa nada, porque o produto é digital. O limite evita bagunça, evita usar a remarcação para esticar o prazo de reembolso e evita empurrar a janela de contestação no cartão, que conta a partir da data do serviço (§3.5).

**O lado positivo.** Remarcar mantém a venda em vez de devolver o dinheiro, e cada alerta é mais um contato com o cliente.

### 3.5 Cancelamento

| Momento | Regra |
|---|---|
| Até 10 dias da compra, antes da ida | Botão "Cancelar" no painel, com reembolso total |
| Depois disso, antes da ida | Oferece remarcar. Se a pessoa insistir em cancelar, devolve |
| Começou e nunca abriu | E-mail em 48 h: "¿Cambió tu viaje?", com uma remarcação, que conta no limite de 2 |
| Começou e usou | Sem reembolso por padrão. ⚠️ **Ponto para o advogado validar** |

**Base e limites:**
- **Brasil:** [CDC, art. 49](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm): 7 dias "a contar de sua assinatura ou do ato de recebimento do produto ou serviço". A leitura favorável ao consumidor pode contar da viagem, não da compra.
- **Termos não eliminam o risco.** O art. 51 do CDC anula a cláusula que implique renúncia a direitos ou retire a opção de reembolso prevista no código. Os termos reduzem o conflito e servem de prova, mas não encerram o direito de arrependimento.
- **Canal:** o [Decreto 7.962/2013, art. 5º](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm) exige informar o meio de forma clara, aceitar pela mesma ferramenta da compra, confirmar de imediato e comunicar a operadora do cartão.
- **Argentina e Chile:** 10 dias ([Ley 24.240, art. 34](https://servicios.infoleg.gob.ar/infolegInternet/anexos/0-4999/638/texact.htm); [Ley 19.496, art. 3 bis](https://www.sernac.cl/portal/609/w3-propertyvalue-58897.html)). ⚠️ Vistos em resumo de busca, e não confirmado se valem para vendedor brasileiro. Os 10 dias da regra cobrem os dois.
- **Cartão:** na [Stripe](https://docs.stripe.com/disputes/how-disputes-work), em serviço futuro "a janela de contestação começa na data do evento, não na data de pagamento", em geral de 120 dias. A contestação debita o valor mais uma tarifa que não volta, e quem decide é o banco. Por isso, reembolso rápido costuma sair mais barato que brigar.

**Documentos, em espanhol e português, com aceite obrigatório (checkbox) antes do pagamento:**
- Termos de uso, com as regras de confirmação, remarcação e cancelamento.
- Política de privacidade (LGPD), citando e-mail, Meta Pixel e CAPI.
- O sistema grava a versão aceita, a data e a hora.

### 3.6 Extensão de férias

- **+1 dia USD 4 · +3 dias USD 9 · +7 dias USD 15**, comprada pelo painel, sem limite de vezes.
- Aviso por push e e-mail 1 dia antes do fim do acesso.
- O preço por dia é mais alto que o do passe de propósito: 7 + 7 dias sai por USD 34, então não compensa fugir do passe de 14 dias.
- Não passa de 15/03/2027.

---

## 4. Ajustes no código do Floripa Explorer

| # | Ajuste | Onde (na documentação) |
|---|---|---|
| 1 | **Portar para Vercel + Supabase:**<br>• SQLite → Postgres (as mesmas 14 tabelas, chaves únicas de `purchases` e `alert_log` mantidas);<br>• Fastify → funções da Vercel;<br>• `src/jobs.js` → Vercel Cron chamando `/api/cron/alerts` (`*/12`) e `/api/cron/tips` (`*/15`), protegidos por `CRON_SECRET`;<br>• cache das fontes numa tabela;<br>• snapshot em memória por 60 s | §5, §7 "Portando" |
| 2 | **IA → OpenRouter + GPT-6 Luna**, mantendo a saída estruturada (zod). Trocar só o `ANTHROPIC_MODEL` não basta | `src/ai/client.js` |
| 3 | **Catálogo** como na §3.1: `pass14` e `passSeason` (fim fixo em 15/03/2027); os 3 guias certos a USD 7; extensões | `src/billing.js` |
| 4 | **Compra direta sem login:**<br>• checkout público, com o Stripe coletando o e-mail;<br>• o webhook cria a conta sem senha (já existe);<br>• quem pagou **não ganha teste** ao criar a senha | `src/billing.js`, `src/auth.js`, `POST /api/checkout` |
| 5 | **QR A6:**<br>• `?o=<código>` vira um cookie;<br>• cupom Stripe de 10% só no passe;<br>• tabela `origens` (código, ponto, data);<br>• origem no cadastro e na compra;<br>• painel com leads e vendas por ponto | novo |
| 6 | **Meta Pixel + CAPI:**<br>• `Lead` + `StartTrial` no cadastro;<br>• `InitiateCheckout`;<br>• `Purchase` pelo webhook, com `event_id` para não contar duas vezes;<br>• `value` em USD | novo |
| 7 | **Guia na hora da dor:**<br>• aviso de ondas ou ressaca → "Playa segura";<br>• trânsito na BR-101 → "Manejar en Brasil";<br>• primeira compra → "Dinero en Brasil" no order bump | `src/alerts.js` + telas |
| 8 | **Relatório no paywall:** "En 48 h te avisamos X veces: Y alertas de tránsito, Z playas impropias" (§10.4) | tela Planos |
| 9 | **TomTom:**<br>• 12 trechos;<br>• leitura a cada 20 min das 7h às 22h;<br>• `TOMTOM_DAILY_BUDGET=640` (§7) | `src/places.js`, `src/sources/tomtom` |
| 10 | **Popular Times:** ingestão semanal do Apify → tabela `popular_times` → lotação, card e roteiros (§8) | novo |
| 11 | Dicas lidas **a cada 5 min**, não a cada 30 s: o conteúdo muda de 15 em 15 min | `public/js` |
| 12 | Notas do dono com **categoria e peso**. Painel com vendas **por porta** (teste × compra direta) e **por ponto de QR** | `src/admin.js` |
| 13 | **E-mails** pelo Resend: 3 do teste (boas-vindas, dia 2 com relatório e oferta, fim do teste) e os da viagem (§3.3 a §3.6) | novo |
| 14 | Conferir a **licença comercial dos tiles da CARTO** no mapa; se não servir, trocar o provedor | `MAP_TILES_URL` |
| 15 | Os 17 testes passando depois do porte, mais testes para a compra direta sem teste, o cupom QR e o `Purchase` sem duplicar | `test/` |
| 16 | **Datas da viagem:** formulário antes do checkout; campos `trip_start`, `trip_end`, `access_starts_at` e `access_ends_at`; escolha do passe pela duração; acesso liberado só a partir da ida; botão "Ya llegué" | `src/auth.js` (`temAcesso`), `src/billing.js`, tela Compra |
| 17 | **Confirmação:** alerta com Confirmar e Remarcar; confirmação automática por cron; `confirmation_status` (pendente, clicado, automático) com data e hora | novo, `src/jobs.js`, painel |
| 18 | **Remarcação:** `reschedule_count` com limite de 2; bloqueio 24 h antes; prazo de reembolso preso à data da compra (não reinicia); e-mail "¿Cambió tu viaje?" para quem nunca abriu | novo |
| 19 | **Cancelamento:** botão no painel com reembolso pela API da Stripe, dentro das regras da §3.5; confirmação imediata por e-mail; reembolso revoga o acesso (o webhook de `charge.refunded` já faz isso) | `src/billing.js`, tela Conta |
| 20 | **Extensão:** SKUs +1 / +3 / +7 dias que somam em `access_ends_at`, com teto em 15/03/2027 | `src/billing.js`, tela Conta |
| 21 | **Termos e privacidade:** páginas em ES e PT; checkbox antes do pagamento; tabela de aceite com versão, data e hora | novo |
| 22 | 🔴 **Fechar o roubo de conta.** Hoje, quem paga sem cadastro ganha uma conta sem senha, e "o cadastro com o mesmo e-mail assume essa conta e as compras". Não há verificação de e-mail: qualquer pessoa que saiba o e-mail do comprador leva o passe. Correção: a senha só é criada por **link assinado enviado ao e-mail da compra** (uso único, validade curta), e o cadastro comum recusa e-mail que já tem compra. Incluir **"esqueci minha senha"**, que o app não tem | `src/auth.js`, `src/billing.js` |
| 23 | **Limite de aparelhos por conta:** 4 sessões ativas; a 5ª derruba a mais antiga. Deixa a família usar e segura o repasse do login | `src/auth.js` (`sessions`) |
| 24 | **Limpeza do banco:** apagar `ai_tips` com mais de 7 dias e `alert_log` com mais de 30. Sem isso, só as dicas somam 57.600 linhas na temporada e encostam nos 500 MB do Supabase grátis | cron diário |
| 25 | **Cópia de segurança:** o Supabase grátis não guarda backup. O n8n da VPS roda um `pg_dump` por dia e mantém 7 cópias | n8n |
| 26 | **Fuso do cron:** a Vercel agenda em UTC. A janela da TomTom, 7h às 22h de Brasília, é **10h à 1h UTC**; a confirmação automática e os lembretes também usam `America/Sao_Paulo` | `vercel.json`, `src/jobs.js` |

**O que precisa estar pronto para abrir** (o resto pode entrar depois, sem travar venda): 1, 2, 3, 4, 6, 9, 13 (só os e-mails da compra), 16, 19, 21, 22 e 26. O ajuste 22 não é opcional: com a compra direta como porta principal, a falha é explorável no primeiro dia.

---

## 5. Infra — Vercel + Supabase

| Serviço | Plano | Por quê | Custo na temporada |
|---|---|---|---|
| **Vercel** | **Hobby** no desenvolvimento → **Pro antes da primeira venda até 15/03** | O Hobby é "non-commercial, personal use only" e só roda cron 1x por dia. O Pro roda cron por minuto ([cron](https://vercel.com/docs/cron-jobs/usage-and-pricing), [Hobby](https://vercel.com/docs/plans/hobby)) | US$ 20 × 5 meses = **R$ 540** |
| **Supabase** | Free | Banco, login e dados pessoais. O cron da Vercel chamando a cada 12 min impede a pausa por inatividade | R$ 0 |
| **Domínio** | `.com` | O Pro pago dá domínio grátis no 1º ano, mas pode ser preciso comprar antes do Pro | **R$ 60** |
| **n8n** (VPS existente) | — | Só a raspagem do IMA, como já está | R$ 0 |

> ⚠️ **Tráfego do Supabase grátis: 5 GB por mês.**
> - O snapshot de cada ciclo é gravado 1 vez e lido pelas funções da Vercel com cache de 60 s em memória.
> - O app nunca lê o banco direto para avisos e dicas.

**E-mail (Resend).** O grátis envia [3.000 por mês e 100 por dia](https://resend.com/pricing). O cenário C manda cerca de 10,8 mil e-mails na temporada e o D, 24 mil, concentrados em janeiro: passa do limite diário. A partir de uns 1.000 leads por mês entra o Pro, a US$ 20 por mês. Nos cenários A e B o grátis basta.

**Login.** O app tem login próprio (scrypt e cookie), então não usa o envio de e-mail do Supabase, que é limitado a 2 por hora.

---

## 6. IA — custo

GPT-6 Luna via OpenRouter: US$ 0,10 por milhão de tokens de entrada, US$ 0,50 de saída e US$ 0,01 de entrada em cache.

```
Dicas: 1 chamada por ciclo para as 5 áreas (es + pt)
  entrada ~10 mil tokens (4 mil em cache) + saída ~2 mil
  = 6.000 × 0,10/M + 4.000 × 0,01/M + 2.000 × 0,50/M = US$ 0,00164 por ciclo
  96 ciclos/dia × 120 dias = 11.520 ciclos × 0,00164 = US$ 19 ≈ R$ 100
Roteiros: ~R$ 0,01 cada · ~3,5 por pagante → desprezível
```

O mesmo trabalho no Claude Opus, padrão do código atual, ficaria na casa de **R$ 4–5 mil** (estimativa).

---

## 7. TomTom — passo a passo

O grátis é **mensal, por API e sem cartão**. O **Traffic Flow API – Segment Data** tem **20.000 leituras grátis por mês** ([preços](https://docs.tomtom.com/pricing)). O código atual gasta ~1.300 por dia, ou seja, 39 mil por mês, e **estoura** o limite.

**Cadastro:**
1. Acesse **https://my.tomtom.com/** → criar conta com e-mail, sem cartão.
2. Confirme o e-mail, entre no painel e abra **API Keys**. Use a chave padrão ou crie uma chamada `floripa-explorer`.
3. Na hora do cadastro, confira nos termos se o **uso comercial** é permitido no grátis. ⚠️ A página de preços (reconferida em 11/11) confirma as 20 mil por mês, mas chama o grátis de "free evaluation", ou seja, avaliação. Se os termos vetarem venda, o plano B é pagar pelo uso ou ler menos trechos.
4. Teste no navegador, trocando a coordenada e a chave:
   `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=<lat>,<lon>&unit=KMPH&key=<SUA_CHAVE>`
   A resposta traz `currentSpeed`, `freeFlowSpeed`, `currentTravelTime`, `freeFlowTravelTime` e `roadClosure`.
5. Coordenada de cada trecho: no Google Maps, clique com o botão direito **em cima da pista**, no ponto que trava, e copie a coordenada. Faça isso para os 12 trechos da §2 e confira os 9 atuais, que estão aproximados.
6. Na Vercel, em Settings → Environment Variables:
   - `TOMTOM_KEY=<chave>`
   - `TOMTOM_DAILY_BUDGET=640`
7. Toda semana, veja o uso no painel da TomTom.

**Orçamento:**
```
12 trechos × leitura a cada 20 min das 7h às 22h (45 por trecho/dia) = 540 por dia
540 × 31 dias = 16.740 por mês  →  dentro dos 20.000 (sobram ~16%)
Das 22h às 7h, nenhuma leitura: o app mostra "última leitura às 22h"
```

---

## 8. Popular Times — análise

**O que é.** O Google mostra, para cada local, quão cheio ele costuma ficar por hora em cada dia da semana (histograma). No momento da leitura também mostra o "ao vivo".

**Onde ajuda:**
- **Restaurantes, bares e atrações:** quase todos têm o dado. Alimenta o card ("os restaurantes de Canasvieiras lotam sábado à noite") e os roteiros (não mandar ao local no pico).
- **Praias:** quase nunca têm o dado. A lotação de praia continua sendo a estimativa por regras, sempre marcada como estimativa.
- O **dono corrige pela nota** no painel, e a nota tem prioridade.

**Custo** (Apify, ator Google Maps Scraper; o Popular Times exige `scrapePlaceDetailPage: true`):

| Uso | Conta | Custo |
|---|---|---|
| **Histograma 1x por semana**, ~180 locais (150 da base + 30 pontos) | 180 × 4,3 semanas × US$ 0,006 (0,004 local + 0,002 detalhe) | **US$ 4,70/mês** — cabe no crédito grátis de US$ 5/mês da Apify |
| "Ao vivo" de hora em hora, 30 locais, 8h–22h | 450 por dia × 30 × 0,006 | US$ 81/mês → **fora** |

**Recomendação:**
- Histograma semanal; o padrão do Google muda devagar, então mensal também serviria.
- O "ao vivo" fica fora.
- Orçamento de segurança: **R$ 130** na temporada, caso o crédito grátis já esteja sendo usado em outra coisa.
- ⚠️ Antes da 1ª rodada: **preflight com 1 local** e confirmação de que o campo `popularTimesHistogram` vem preenchido.

---

## 9. Custos da temporada (15/11 a 15/03)

| Item | Custo |
|---|---|
| Vercel Pro (5 meses) | R$ 540 |
| Apify — Popular Times | R$ 130 (teto; R$ 0 se couber no crédito grátis) |
| IA — dicas | R$ 100 |
| Domínio | R$ 60 |
| Supabase, TomTom, push, n8n | R$ 0 |
| **Total fixo — cenários A e B** | **R$ 830** |
| E-mail: Resend Pro, 3 meses (só C e D) | R$ 324 |
| **Total fixo — cenários C e D** | **R$ 1.154** |
| Folhas A6 | impressão do dono |
| Variável | mídia + 8,3% de taxa Stripe |
| Fora da conta | impostos (§1) · contestação: R$ 55 cada, segundo fonte secundária, a confirmar na Stripe |

---

## 10. Estrutura de conversão — onde está o dinheiro

### 10.1 A conta bruta

```
Leads      = (mídia ÷ R$ 8,10) + orgânico
Pagantes   = leads × 8%
Receita    = pagantes × R$ 156,60
Líquido    = pagantes × R$ 143,66 − mídia − custo fixo      (antes de imposto)
```

| Cenário | Mídia | Leads | Pagantes | Receita bruta | **Líquido** | Margem | Lucro só do anúncio | Lucro dos leads sem mídia |
|---|---|---|---|---|---|---|---|---|
| A · Mínimo | R$ 800 | 849 | 68 | R$ 10.649 | **R$ 8.139** | 76% | R$ 335 | R$ 8.620 |
| B · Conservador | R$ 5.000 | 1.717 | 137 | R$ 21.454 | **R$ 13.851** | 65% | R$ 2.094 | R$ 12.642 |
| C · Realista | R$ 13.000 | 3.105 | 248 | R$ 38.837 | **R$ 21.474** | 55% | R$ 5.445 | R$ 17.239 |
| D · Escala | R$ 32.400 | 7.000 | 560 | R$ 87.696 | **R$ 46.896** | 53% | R$ 13.571 | R$ 34.478 |

As duas últimas colunas são antes do custo fixo. Pequenas diferenças de soma vêm do arredondamento dos pagantes.

Conta aberta do C:
```
13.000 ÷ 8,10 = 1.605 + 1.500 = 3.105 leads × 8% = 248 pagantes
248 × 143,66 = 35.628 − 13.000 − 1.154 = R$ 21.474
```

**Por que caiu em relação à versão anterior** (C era R$ 29.231):
- ticket médio de USD 25,50 em vez de USD 29, pela permanência real das viagens;
- 0,40 guia por pagante em vez de 0,75, que contradizia a meta de 25% do funil;
- custo de e-mail nos cenários C e D.

⚠️ **O que a tabela mostra e a versão anterior escondia: nas premissas de base, o anúncio quase só se paga.** No C, R$ 13.000 de mídia deixam R$ 5.445. Os outros R$ 17.239 vêm dos 1.500 leads sem mídia, e esse número é um palpite sem estratégia escrita neste plano. Duas consequências:
- o QR A6 (§10.6) deixa de ser detalhe e vira o canal que sustenta a conta. Ele precisa de meta por ponto desde a primeira semana;
- escalar a mídia só vale com a conversão acima de 8% ou o CPL abaixo de USD 1,50, como a escada da §10.5 já exige.

### 10.2 As duas alavancas: lucro por pagante vindo de anúncio

O custo de cada pagante é **CPL ÷ conversão**. Cada pagante deixa **R$ 143,66** líquidos.

| Conversão ↓ · CPL → | USD 0,75 | USD 1,00 | **USD 1,50** | USD 2,50 |
|---|---|---|---|---|
| 5% | R$ 62,66 | R$ 35,66 | −R$ 18,34 | −R$ 126,34 |
| **8%** | R$ 93,03 | R$ 76,16 | **R$ 42,41** | −R$ 25,09 |
| 12% | R$ 109,91 | R$ 98,66 | R$ 76,16 | R$ 31,16 |
| 15% | R$ 116,66 | R$ 107,66 | R$ 89,66 | R$ 53,66 |

- **Teto de CPL:** com 8% de conversão, o anúncio se paga até um CPL de **USD 2,13**. Com 5%, só até **USD 1,33**: no CPL de base, o anúncio dá prejuízo.
- ⚠️ **Se todos comprarem o passe de USD 19:** cada pagante deixa R$ 111,36 e o lucro por pagante (8%, USD 1,50) cai de **R$ 42,41 para R$ 10,11**. O upgrade para o passe de 14 dias no checkout é a defesa, e o beta mede a distribuição.
- **No cenário C:**

| Conversão e CPL | Líquido |
|---|---|
| 8% e CPL USD 1,50 (base) | R$ 21.474 |
| **12%** | **R$ 39.431** |
| CPL **USD 1,00** | **R$ 30.812** |
| **12% e USD 1,00 juntos** | **R$ 53.223**, duas vezes e meia a base com a mesma verba |
| 5% | R$ 8.113 |

### 10.3 A dor, a necessidade latente e o mecanismo único

**A dor real** (o turista sente, mas não procura solução):
- O turista tem 7 a 14 dias e pagou caro por eles. **Cada dia ruim é dinheiro perdido.**
- 2 horas parado na SC-401 ou na ponte.
- Praia imprópria que ninguém avisou.
- Mar de ressaca com criança.
- O dia de praia que a chuva estragou.
- Restaurante lotado.
- Conta com couvert e golpe.

**O dado que confirma:** na pesquisa da Fecomércio-SC de 2026, o trânsito foi o ponto negativo mais citado pelos turistas em Florianópolis, com "filas intermináveis" entre as praias. Em seguida vieram viroses, balneabilidade e preço. Os dois primeiros ângulos de anúncio da §10.5 são exatamente esses.

**A necessidade latente:** aproveitar cada dia sem perder horas nem passar sustos, num lugar onde não lê a língua nem sabe onde procurar.

**Mecanismo único — "Radar 15 minutos":**
- A cada 15 minutos o app cruza **8 fontes oficiais brasileiras**: INMET, Marinha, IMA, CPTEC, TomTom e outras.
- Sozinho, o turista não consegue usá-las: estão em português e espalhadas.
- O app traduz tudo em **uma decisão por região, em espanhol**: aonde ir agora, a que horas, por onde e o que evitar.

**Promessa:** *"Sabé antes de salir: qué playa, a qué hora y por dónde. Actualizado cada 15 minutos, en español."*

**Prova** (o que vende): **dado ao vivo na página de vendas**, antes de qualquer cadastro. Por exemplo: *"Ahora: puente con 18 min de demora · Joaquina: mar agitado · Jurerê: agua apta."*

### 10.4 Funil e o que sobe a conversão

| Etapa | O que faz | Meta |
|---|---|---|
| Anúncio | Um ângulo de dor por anúncio (§10.5) | CTR ≥ 1,5% |
| Página | Dado ao vivo + as duas portas + o preço com o 14 dias em destaque | ≥ 25% viram lead |
| Primeiro minuto | Escolhe a área → ativa o push → vê o 1º aviso real (o momento "uau") | ≥ 50% com push |
| Dia 1 | Push real de um 🔴/🟠 numa área favorita | — |
| Dia 2 | **Relatório do teste:** "te avisamos X veces…" + oferta + e-mail | — |
| Fim do teste | Paywall com o relatório · remarketing nas 24 h seguintes · e-mail | **≥ 10% pagam** |
| Checkout | Datas da viagem + order bump de 1 guia ligado à dor do anúncio | 25% levam |

**Outros reforços:**
- Prova social dos 20 do beta: vídeo curto, em espanhol.
- A regra da §3.5 como argumento: *"¿Cambió tu viaje? Reprogramá gratis."*

### 10.5 Anúncios

- **Ângulos** para o teste 1 (R$ 100), 1 criativo cada:
  1. **Trânsito:** "2 horas en la SC-401 es medio día de playa perdido."
  2. **Água:** "El agua que el IMA marcó impropia esta semana. ¿Sabés cuál es?"
  3. **Chuva/dia perdido:** "Llueve en el Sur y hace sol en el Norte. Hoy."
  4. **Família/mar:** "Bandera roja en Joaquina. Tus chicos, ¿dónde se meten?"
  5. **Dinheiro:** "Couvert, 10%, Pix: lo que nadie te explica antes de pagar."
- **Formatos:**
  - gravação de tela do app com dado real;
  - UGC em espanhol rioplatense para a Argentina e neutro para o Chile;
  - "POV: estás en el puente…".
- **Públicos:**
  - **In-destino** (Florianópolis + idioma espanhol) → botão "Probar gratis".
  - **Pré-viagem** (Argentina, Uruguai e Chile, interesse Florianópolis) → botão "Comprar ahora" com as datas da viagem. O Uruguai tem mais turistas em Florianópolis que o Chile (5% contra 4,4%) e usa a mesma copy rioplatense.
- **Argumento de preço:** "un pase para toda la familia", porque 85% viajam em família ou casal.
- **Pix para quem já está no Brasil (a testar):** o cartão argentino em dólar pode levar 30% de percepção na fatura, e o turista já paga com Pix por aplicativos do país dele. A Stripe aceita Pix em reais. Falta confirmar a taxa, se a conta tem acesso e se o pagador precisa de CPF (§14).
- **Escada:**
  - **R$ 100:** qual ângulo para o scroll.
  - **R$ 200:** Argentina × Chile.
  - **R$ 500 (beta):** CPL, % com push, conversão por porta, duração das viagens.
  - **Escala só se** o CPL ficar ≤ USD 1,50 e a conversão ≥ 8%.
- **Squads:** a copy e os criativos saem com o `squad-conteudo` e o `squad-trafego`. O rastreio sai com o `squad-growth`.

### 10.6 QR A6

- Folhas impressas pelo dono, deixadas onde a pessoa está **parada com o celular**: check-in, pousada, administradora de temporada, mesa, balcão.
- **10% no passe.**
- **Um código por ponto:** imprima mais nos pontos que vendem e corte os que não vendem.
- **Prioridade: imóvel de temporada.** Metade dos turistas de Florianópolis fica em imóvel alugado, e não em hotel. A folha vai no kit de boas-vindas do anfitrião e da administradora, e o mesmo link segue na mensagem de check-in do Airbnb ou do Booking.
- **Meta por ponto:** leads e vendas por código, toda semana. Este canal responde pela maior parte do lucro projetado (§10.1).

---

## 11. Riscos

| Risco | Gravidade | O que fazer |
|---|---|---|
| Conversão abaixo de 8% | 🔴 | Relatório do teste, push no 1º minuto, e-mails; a escada mede antes de escalar |
| Porte para Vercel/Supabase quebrar o que funciona | 🔴 | Os 17 testes passando antes do deploy |
| **Prazo até 15/11** | 🔴 | São 26 ajustes e faltam 4 dias. Abrir só com a lista mínima do fim da §4, ou adiar a abertura |
| Conta paga tomada por terceiro (cadastro sem verificação de e-mail) | 🔴 | Ajuste 22 antes de abrir a compra direta |
| Leads sem mídia abaixo do previsto | 🔴 | São a maior parte do lucro. Meta por ponto de QR; rever os cenários com o número real do beta |
| Imposto não previsto (CPF, carnê-leão) | 🟠 | Contador antes da primeira venda |
| Menos argentinos na temporada, pelo câmbio | 🟠 | Não escalar mídia antes de janeiro mostrar o fluxo; Uruguai e Chile no anúncio |
| Banco sem backup no Supabase grátis | 🟠 | Ajuste 25 |
| Contestação no cartão de quem não viajou | 🟠 | Lembretes, clique de confirmação, remarcação e reembolso rápido; acompanhar a taxa de contestação na Stripe |
| Pedido de reembolso depois de usar o passe inteiro | 🟠 | Regra da §3.5 validada por advogado |
| Maioria das viagens curtas baixar o ticket | 🟠 | Upgrade no checkout; o beta mede |
| Cartão argentino em dólar ter imposto na fatura | 🟠 | As fontes de 2026 dizem que a percepção de 30% segue valendo e some para quem paga a fatura em dólar, mas se contradizem. A copy orienta a pagar em dólar; Pix como alternativa (§10.5) |
| TomTom acima de 20 mil por mês | 🟠 | `TOMTOM_DAILY_BUDGET=640`, janela 7h–22h, sem cartão cadastrado |
| Guia com informação errada | 🟠 | Revisão na fonte oficial, com a data de verificação no guia |
| Taxa Stripe acima de 8,3% | 🟡 | Conferir no 1º pagamento real |
| Supabase acima de 5 GB | 🟡 | Snapshot em cache nas funções |
| Licença dos tiles do mapa | 🟡 | Conferir a CARTO; trocar se precisar |

---

## 12. Parcerias com restaurantes e bares — a definir, fora do lançamento

**Ideia do dono:** troca de público, sem dinheiro de nenhum lado.

**Estrutura possível:**
- O estabelecimento expõe a folha A6 com **código de origem próprio**. Os leads e as vendas que vêm dele aparecem no painel.
- Em troca, o app mostra o estabelecimento numa área **"Beneficios de socios"**, com um cupom do próprio estabelecimento. O turista mostra o cupom na tela.
- **Regra:** a IA de dicas e de roteiros **nunca** favorece parceiro. Parceria aparece só na área de benefícios, marcada como tal.
- **Decide depois do lançamento,** olhando quais pontos de QR vendem.

---

## 13. Ordem de entrega

As datas ficam em aberto até o dono confirmar o estado do código. A meta de abertura continua sendo **15/11**.

| Etapa | Entrega |
|---|---|
| 1 | Domínio. Contas: Vercel, Supabase, Stripe BR, TomTom, OpenRouter, Meta (Pixel), Resend. Porte para Vercel + Supabase com os testes passando. Página de espera com dado ao vivo. Teste 1 de mídia (R$ 100, 5 ângulos) |
| 2 | Catálogo correto, datas da viagem, compra direta sem login, QR com cupom, Stripe ponta a ponta, Pixel + CAPI, IA no OpenRouter |
| 3 | Confirmação, remarcação, cancelamento, extensão. Termos e privacidade revisados por advogado |
| 4 | Chaves reais e validação de cada fonte, TomTom com 12 trechos, `municipioID` do IMA, marés, preflight do Popular Times. Relatório do paywall. E-mails |
| 5 | Os 3 guias revisados na fonte oficial. Base de 150 locais. Criativos v2. Teste 2 (R$ 200, AR × CL). Vercel Pro ligado |
| 6 | Beta com 20 usuários e depoimentos. Teste 3 (R$ 500). Imprimir as folhas A6 |
| — | **Lançamento**, com roteiros se a base de locais estiver pronta |

---

## 14. Pendências

1. **Estado do código:** onde está a pasta `floripa-explorer/` e quais ajustes já foram feitos. Não está em `D:\VIBE-CODING-PROJETOS` nem no Desktop.
2. **Conta Stripe BR e contador:** a Stripe abre no CPF, com conta bancária no mesmo CPF, e o CNPJ é opcional. A escolha é fiscal: no CPF, o imposto pode chegar a 27,5%. Decidir com um contador antes da primeira venda.
3. **Advogado:** termos, privacidade, regra de "começou e usou" e se as leis da Argentina e do Chile se aplicam.
4. **Domínio:** `floripaexplorer.com` ou outra variação.
5. **Termos da TomTom:** se o grátis permite uso comercial.
6. **Tarifa de contestação da Stripe no Brasil** e se a taxa volta no reembolso.
7. **Nome definitivo:** reavaliar depois do teste 1 de mídia.
8. **Pix na Stripe:** taxa, acesso da conta e se o turista estrangeiro consegue pagar sem CPF.
9. **Percepção de 30% na Argentina:** confirmar na norma (RG 5617) antes de escrever a copy de preço.

---

## 15. Verificação

- **Porte:**
  - `npm test` verde;
  - a página de espera no ar com dado real de agora;
  - o teste 1 medido (CTR e CPL por ângulo).
- **Fluxos completos com o Stripe em modo teste:**
  1. **Teste:** cadastro → push 🔴 → card → relatório → paywall → datas → paga → `Purchase` 1 vez no Meta.
  2. **Compra direta pelo QR:** `?o=qr-x` → datas → 10% no passe → paga sem login → conta criada **sem teste** → origem gravada no painel.
  3. **Pré-ativação:** compra para daqui a 30 dias → dados bloqueados → alerta → sem resposta confirma no 10º dia → lembretes → liga sozinho na data de ida.
  4. **Remarcação:** 2 remarcações passam, a 3ª é barrada → alerta reinicia a cada uma → botão de reembolso continua preso aos 10 dias da compra.
  5. **Cancelamento:** botão dentro do prazo → reembolso na Stripe → acesso revogado → e-mail de confirmação.
  6. **Extensão:** soma os dias e não passa de 15/03/2027.
  - Mais o reenvio do mesmo webhook, que **não** libera duas vezes.
- **Beta:**
  - 20 usuários;
  - TomTom abaixo de 640 por dia;
  - Popular Times preenchido nos locais;
  - o card de cada área troca a cada 15 min;
  - o tráfego do Supabase dentro do limite.
- **Toda semana:** CPL, conversão por porta, duração das viagens, vendas por ponto de QR, % com push, % de remarcação, reembolso e contestação, custo de IA, uso da TomTom e tráfego do Supabase.

**Fontes:**
- Conferidas em 04/10/2026: [Vercel cron](https://vercel.com/docs/cron-jobs/usage-and-pricing) · [Vercel Hobby](https://vercel.com/docs/plans/hobby) · [Stripe BR](https://stripe.com/br/pricing) · [TomTom pricing](https://docs.tomtom.com/pricing) · [Apify Google Maps Scraper](https://apify.com/compass/crawler-google-places) · [Apify plano grátis](https://use-apify.com/docs/what-is-apify/apify-free-plan)
- Conferidas em 11/11/2026: [Fecomércio-SC, verão 2026](https://www.fecomercio-sc.com.br/wp-content/uploads/2026/03/Temporada-de-Verao-2026.pdf) · [Itatiaia, queda de argentinos](https://www.itatiaia.com.br/turismo/por-que-o-numero-de-turistas-argentinos-caiu-no-litoral-de-santa-catarina-neste-verao/) · [Panrotas, 1 milhão de passageiros internacionais](https://www.panrotas.com.br/aviacao/aeroportos/2025/10/floripa-airport-atinge-marca-historica-de-1-milhao-de-passageiros-internacionais-em-2025_222894.html) · [Embratur, mercado argentino](https://embratur.com.br/wp-content/uploads/2025/02/2025-Insights-de-Mercado-Argentina.pdf) · [Resend, preços](https://resend.com/pricing) · [Stripe, conta no Brasil](https://support.stripe.com/questions/brazil-specific-information-to-open-a-stripe-account?locale=pt-BR) · [Stripe, Pix](https://docs.stripe.com/payments/pix/accept-a-payment) · [TomTom pricing](https://docs.tomtom.com/pricing). Os números do aeroporto e da Embratur vieram de resumo de busca, não da página aberta.
- Conferidas em 05/11/2026: [CDC](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm) · [Decreto 7.962/2013](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm) · [Contestações na Stripe](https://docs.stripe.com/disputes/how-disputes-work)
