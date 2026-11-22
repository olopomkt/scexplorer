# SC Explorer — Dicas automáticas e locais, sem IA

> Versão 1 · 22/11/2026. Base para o código: cada dica abaixo vira um registro no banco.
> **Regra de ouro:** dica só entra no app com `status: confirmada`. Dica `a confirmar` fica guardada e não aparece até o dono ou uma fonte oficial confirmar.

---

## 1. A decisão: dicas por regras, IA quase zero

| | Antes (plano do Floripa Explorer) | Agora (SC Explorer) |
|---|---|---|
| Card de dicas | IA gerava texto a cada 15 min | **Base fixa de dicas escritas e conferidas**, escolhidas por regras com os dados do momento |
| Roteiros | IA montava o dia | **Motor de regras** monta o dia a partir da base de locais |
| Custo de IA | ~R$ 100 na temporada | **R$ 0** no lançamento |
| Risco de inventar | Existia (mitigado) | **Não existe**: todo texto foi escrito e conferido antes |

**Onde a IA ainda pode entrar, só se o dono quiser:** traduzir para espanhol as notas que o dono escreve no painel em português. É texto curto e raro (centavos por mês). Alternativa sem IA: o dono escreve a nota nas duas línguas.

---

## 2. Como o motor de dicas funciona

### 2.1 O que é uma dica

Cada dica é um registro com:

| Campo | Exemplo | Para quê |
|---|---|---|
| `id` | `mar-umbigo` | Identificar e não repetir |
| `categoria` | mar, sol, chuva, vento, trânsito, água, saúde, dinheiro, carro, transporte, comer, passeio | Filtro e ícone |
| `gatilho` | `uv_max_hoje >= 8` | Quando a dica vale (ver 2.2). Dica sem gatilho = dica "de sempre" |
| `regioes` | todas, ou `norte`, `leste`… | Só aparece onde faz sentido |
| `meses` | 11–3 | Temporada |
| `horas` | 6–11 | Hora do dia em que vale mostrar |
| `prioridade` | 1 (crítica) a 5 (curiosidade) | Ordem no card |
| `texto_es` / `texto_pt` | com variáveis `{uv_max}`, `{hora_pico_uv}` | O que aparece |
| `fonte` | nome + link | Aparece no rodapé da dica |
| `status` | confirmada / a confirmar | Só confirmada vai ao ar |
| `revisar_em` | 2027-01-15 | Data para conferir de novo (preço, regra) |

### 2.2 As variáveis que os gatilhos usam

Todas saem das fontes que o app já lê, sem custo extra:

| Variável | Fonte | Exemplo |
|---|---|---|
| `uv_agora`, `uv_max_hoje`, `hora_pico_uv` | WeatherAPI (hora a hora) / CPTEC | 11, "11:00–15:00" |
| `temp_max_hoje`, `sensacao` | WeatherAPI | 34 °C |
| `chuva_prox_6h_mm`, `chuva_prob_6h`, `chuva_24h_passadas_mm` | WeatherAPI | 12 mm, 80%, 35 mm |
| `vento_kmh`, `rajada_kmh`, `vento_dir` | WeatherAPI | 40, 65, "S" |
| `onda_m`, `estado_mar` | CPTEC / WeatherAPI Marine | 2,0 m, "agitado" |
| `fase_lua` | cálculo local (SunCalc) | cheia, nova |
| `por_do_sol`, `hora_dourada` | cálculo local (SunCalc) | 20:12 |
| `mare_baixa_prox`, `mare_alta_prox` | tábua da Marinha (importada) | 16:40 |
| `transito_regiao`, `atraso_min` | TomTom | pesado, +18 min |
| `pontos_improprios_regiao` | IMA/SC (semanal) | 2 |
| `aviso_inmet` | INMET | vendaval, laranja |
| `dia_semana`, `hora`, `feriado` | relógio | sábado, 15h |

### 2.3 Como escolhe o que mostrar

A cada ciclo (12 min), para cada região:

1. Junta as dicas `confirmadas` da região, do mês e da hora.
2. Separa as **com gatilho ativo** (o dado do momento bate) das **de sempre**.
3. Pontua: gatilho ativo vale mais que dica de sempre; prioridade 1 vale mais que 5; dica mostrada nas últimas 24 h para a mesma pessoa perde pontos (o app guarda no aparelho o que já mostrou).
4. Mostra **as 3 melhores** no card "Dica do momento". Dica com prioridade 1 e gatilho ativo vira também aviso.
5. Preenche as variáveis (`{hora_pico_uv}` vira "11:00–15:00").

**Nota do dono** tem prioridade máxima e passa na frente de tudo enquanto estiver válida.

### 2.4 Dicas que aprendem sozinhas (sem IA)

Com 2 a 3 semanas de leituras da TomTom guardadas, o app calcula a **média do atraso por trecho, hora e dia da semana**. Daí nascem dicas com número próprio:
- "Sábado, a SC-401 sentido norte costuma travar das 9h às 11h30. Saindo antes das 8h30 você ganha em média {ganho} min."
- O cálculo é uma média simples no banco, sem custo e sem IA. Antes de ter dados suficientes (mínimo de 4 semanas iguais), a dica não aparece.

---

## 3. A base de dicas (v1)

Legenda: **C** = confirmada (fonte citada) · **?** = a confirmar (não vai ao ar ainda).

### 3.1 Mar e segurança

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `mar-bandeiras` | sempre (prio 2) | Bandeira vermelha: risco alto de afogamento. Amarela: risco moderado. Verde: risco baixo. Lilás: águas-vivas na área. | Bandera roja: riesgo alto de ahogamiento. Amarilla: riesgo moderado. Verde: riesgo bajo. Lila: hay aguavivas. | CBMSC via NSC Total | C |
| `mar-app-cbmsc` | sempre (prio 3) | O app CBMSC Cidadão, dos Bombeiros, mostra a bandeira de cada praia em tempo real. | La app CBMSC Cidadão, de los bomberos, muestra la bandera de cada playa en tiempo real. | CBMSC via NSC Total | C |
| `mar-umbigo` | `onda_m >= 1.5` (prio 1) | "Água no umbigo, sinal de perigo." Com ondas de {onda_m} m hoje, fique onde dá pé. | "Agua en el ombligo, señal de peligro." Con olas de {onda_m} m hoy, quedate donde hacés pie. | CBMSC via Band | C |
| `mar-retorno-ver` | `onda_m >= 1.5` (prio 2) | Corrente de retorno: procure o trecho onde as ondas não quebram, entre duas faixas de espuma. Ali o mar puxa para fora. São mais comuns perto de pedras e morros. | Corriente de retorno: buscá el tramo donde las olas no rompen, entre dos franjas de espuma. Ahí el mar tira hacia afuera. Son más comunes cerca de rocas y morros. | Bombeiros via NSC Total / Band | C |
| `mar-retorno-sair` | `onda_m >= 1.5` (prio 1) | Se a corrente te puxar: não nade contra. Nade paralelo à praia até sair dela. Cansou? Boie, levante um braço e grite por ajuda. | Si la corriente te arrastra: no nades en contra. Nadá paralelo a la playa hasta salir. ¿Cansado? Flotá, levantá un brazo y pedí ayuda. | Bombeiros via NSC Total / Band | C |
| `mar-retorno-dado` | sempre (prio 4) | 9 em cada 10 mortes por afogamento no litoral acontecem em correntes de retorno. | 9 de cada 10 muertes por ahogamiento en la costa ocurren en corrientes de retorno. | Corpo de Bombeiros via NSC Total | C |
| `mar-lua` | `fase_lua in (cheia, nova) e onda_m >= 1` (prio 2) | Lua {fase_lua} hoje: as correntes ficam mais fortes. Entre no mar perto do posto de guarda-vidas. | Hoy hay luna {fase_lua}: las corrientes son más fuertes. Metete al mar cerca del puesto de guardavidas. | Bombeiros via NSC Total | C |
| `mar-placa` | sempre (prio 3) | Placa de perigo na areia quer dizer: não entre ali, mesmo com o mar parecendo calmo. Os guarda-vidas mudam a sinalização ao longo do dia. | Un cartel de peligro en la arena significa: no entres ahí, aunque el mar parezca calmo. Los guardavidas cambian la señalización durante el día. | Bombeiros via NSC Total | C |
| `mar-aguaviva` | `mes in 12–3` (prio 2) | Queimou com água-viva? Saia da água e procure o guarda-vidas. Sem posto perto: vinagre no local, sem esfregar. Nunca água doce, álcool ou urina. Piorou: ligue 193. | ¿Te quemó una aguaviva? Salí del agua y buscá al guardavidas. Sin puesto cerca: vinagre en la zona, sin frotar. Nunca agua dulce, alcohol ni orina. Si empeora: llamá al 193. | CBMSC via NSC Total | C |
| `mar-vento-forte` | `rajada_kmh >= 50` (prio 1) | Rajadas de até {rajada_kmh} km/h. Evite mar aberto, caiaque e stand up até o vento baixar. | Ráfagas de hasta {rajada_kmh} km/h. Evitá el mar abierto, el kayak y el stand up hasta que baje el viento. | Regra do app sobre WeatherAPI + INMET | C |

### 3.2 Sol e calor

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `sol-uv-alto` | `uv_max_hoje >= 8` (prio 1) | UV {uv_max} hoje, mais forte entre {hora_pico_uv}. Protetor FPS 30 ou mais, reaplicado a cada 2 horas e depois de cada mergulho. | UV {uv_max} hoy, más fuerte entre las {hora_pico_uv}. Protector FPS 30 o más, cada 2 horas y después de cada chapuzón. | SBD via CNN Brasil / Tua Saúde | C |
| `sol-janela` | `uv_max_hoje >= 6` e `hora <= 10` (prio 2) | A Sociedade Brasileira de Dermatologia recomenda evitar o sol das 10h às 16h no verão. Praia cedo, almoço na sombra, volta no fim da tarde. | La Sociedad Brasileña de Dermatología recomienda evitar el sol de 10 a 16 en verano. Playa temprano, almuerzo a la sombra y vuelta a la tarde. | SBD via Tua Saúde | C |
| `sol-antes` | `hora <= 9` (prio 4) | Passe o protetor de 15 a 30 minutos antes de sair, não na areia. | Ponete el protector de 15 a 30 minutos antes de salir, no en la arena. | SBD via Tua Saúde | C |
| `sol-nublado` | `uv_max_hoje >= 6` e nublado (prio 3) | Céu nublado não bloqueia o UV: hoje ele chega a {uv_max}. | El cielo nublado no frena el UV: hoy llega a {uv_max}. | Leitura do dado + SBD | C |
| `calor-35` | `temp_max_hoje >= 35` (prio 1) | Máxima de {temp_max} °C. Água o dia todo, crianças e idosos na sombra entre {hora_pico_calor}. | Máxima de {temp_max} °C. Agua todo el día; chicos y mayores a la sombra entre las {hora_pico_calor}. | Regra do app (aviso de calor) | C |

### 3.3 Água própria para banho

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `agua-pos-chuva` | `chuva_24h_passadas_mm >= 20` (prio 1) | Choveu forte nas últimas 24 h. O IMA recomenda evitar o banho de mar por 24 a 48 horas, principalmente perto de rios, canais e saídas de esgoto pluvial. | Llovió fuerte en las últimas 24 h. El IMA recomienda evitar el baño de mar por 24 a 48 horas, sobre todo cerca de ríos, canales y desagües. | IMA/SC via NSC Total | C |
| `agua-improprios` | `pontos_improprios_regiao >= 1` (prio 2) | {n} ponto(s) desta região estão impróprios no último laudo do IMA. Veja quais na aba Praias. | {n} punto(s) de esta zona están no aptos en el último informe del IMA. Mirá cuáles en Playas. | IMA/SC | C |
| `agua-sexta` | `dia_semana = sexta` (prio 4) | O IMA publica o laudo de balneabilidade toda sexta. O app atualiza assim que sai. | El IMA publica el informe de calidad del agua cada viernes. La app se actualiza apenas sale. | IMA/SC via NSC Total | C |
| `agua-rio` | sempre (prio 4) | Evite entrar no mar onde um rio ou canal deságua na praia, ainda mais depois de chuva. | Evitá meterte donde un río o canal desemboca en la playa, más después de lluvia. | IMA/SC via NSC Total | C |

> A Fecomércio-SC (verão 2026) registrou viroses e balneabilidade entre as queixas dos turistas em Florianópolis: estas dicas respondem a uma dor real.

### 3.4 Chuva, vento e escolha da praia

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `chuva-janela` | `chuva_prob_6h >= 60` (prio 2) | Chance de chuva de {prob}% até as {hora_fim}. Melhor janela de praia hoje: {janela_seca}. | Probabilidad de lluvia de {prob}% hasta las {hora_fim}. Mejor momento de playa hoy: {janela_seca}. | Cálculo sobre WeatherAPI | C |
| `chuva-roteiro` | `chuva_prox_6h_mm >= 5` (prio 2) | Dia de chuva: veja o roteiro coberto da sua região na aba Roteiros. | Día de lluvia: mirá el itinerario bajo techo de tu zona en Itinerarios. | Motor de roteiros | C |
| `vento-baia` | `vento_dir in (S, SE, SO) e vento_kmh >= 25` (prio 2) | Vento sul forte: as praias voltadas para as baías costumam ficar mais calmas que as de mar aberto. | Viento sur fuerte: las playas que dan a las bahías suelen estar más calmas que las de mar abierto. | Geografia geral (Viaje na Viagem); efeito do vento sul em cada praia **não confirmado** | ? |
| `mare-baixa` | `mare_baixa_prox` em até 2 h (prio 3) | Maré baixa às {mare_baixa}: areia mais larga e firme para caminhar. | Marea baja a las {mare_baixa}: arena más ancha y firme para caminar. | Tábua da Marinha | C* |
| `por-do-sol` | `hora` entre `por_do_sol − 2h` e `por_do_sol − 1h` (prio 3) | Pôr do sol às {por_do_sol}. Chegue 30 min antes para pegar a hora dourada. | El sol se pone a las {por_do_sol}. Llegá 30 min antes para la hora dorada. | Cálculo local (SunCalc) | C |

\* depende de importar a tábua da Marinha da temporada.

### 3.5 Trânsito

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `tr-pesado` | `transito_regiao in (pesado, parado)` (prio 1) | Trânsito {estado} em {trecho}: +{atraso} min agora. | Tránsito {estado} en {trecho}: +{atraso} min ahora. | TomTom | C |
| `tr-padrao` | média histórica disponível (prio 2) | {dia}, {trecho} costuma travar entre {inicio} e {fim}. Saindo antes das {sair_ate} você ganha em média {ganho} min. | Los {dia}, {trecho} suele trabarse entre las {inicio} y las {fim}. Si salís antes de las {sair_ate} ganás {ganho} min en promedio. | Média das leituras TomTom do próprio app | C (após 4 semanas) |
| `tr-queixa` | sempre (prio 5) | O trânsito é a queixa mais citada pelos turistas de Florianópolis. Planeje as travessias da ponte fora do horário de pico. | El tránsito es la queja más citada por los turistas en Florianópolis. Cruzá el puente fuera de la hora pico. | Fecomércio-SC, verão 2026 | C |

### 3.6 Saúde e emergência

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `sos-numeros` | sempre, fixa na aba Conta (prio 2) | Bombeiros 193 · SAMU 192 · Polícia Militar 190 · Defesa Civil 199. | Bomberos 193 · Ambulancia (SAMU) 192 · Policía 190 · Defensa Civil 199. | Números nacionais de emergência | C |
| `sos-upa` | sempre (prio 3) | Urgência 24 h perto: UPA Norte (Canasvieiras), UPA Sul (Rio Tavares) e UPA Continente. | Urgencias 24 h: UPA Norte (Canasvieiras), UPA Sur (Rio Tavares) y UPA Continente. | NSC Total; **endereços completos a conferir na Prefeitura** | ? |
| `sos-hidrata` | `temp_max_hoje >= 30` (prio 3) | Calor de {temp_max} °C: leve água para a praia e beba antes de sentir sede. | Calor de {temp_max} °C: llevá agua a la playa y tomá antes de tener sed. | Regra do app | C |

### 3.7 Dinheiro e pagamento

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `pix-ar` | sempre (prio 2) | Argentino pode pagar com Pix pelo Mercado Pago (QR ou chave Pix) desde dezembro de 2025. Outras carteiras também oferecem: confira a taxa de cada uma. | Desde diciembre de 2025 podés pagar con Pix desde Mercado Pago (QR o clave Pix). Otras billeteras también lo ofrecen: revisá la comisión de cada una. | Mercado & Eventos / Panrotas (30/01/2026) | C |
| `pix-uso` | sempre (prio 4) | 7 em cada 10 argentinos que vieram ao Brasil pagaram com Pix (pesquisa do Mercado Pago). | 7 de cada 10 argentinos que viajaron a Brasil pagaron con Pix (encuesta de Mercado Pago). | Panrotas, 30/01/2026 | C |
| `pix-cl` | sempre (prio 2) | Pix para chilenos: quais apps oferecem. | Pix para chilenos: qué apps lo ofrecen. | **não pesquisado ainda** | ? |

### 3.8 Ônibus e carro

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `bus-sem-dinheiro` | sempre (prio 2) | Os ônibus de Florianópolis não aceitam dinheiro a bordo desde 5/1/2026. Dinheiro só nos terminais de integração. | Los colectivos de Florianópolis no aceptan efectivo a bordo desde el 5/1/2026. Efectivo solo en las terminales de integración. | Diário do Transporte, 27/12/2025 | C |
| `bus-pix` | sempre (prio 2) | Dá para pagar a passagem com Pix na catraca, desde 1/4/2026. | Podés pagar el pasaje con Pix en el molinete, desde el 1/4/2026. | Diário do Transporte, 30/03/2026 | C |
| `bus-tarifa` | sempre (prio 4) | Passagem: R$ {tarifa}. | Pasaje: R$ {tarifa}. | Uma fonte cita R$ 7,70 — **conferir** | ? |
| `bus-cartao` | — | Cartão de crédito por aproximação no ônibus. | Tarjeta sin contacto en el colectivo. | **Sem confirmação para Florianópolis** | ? |
| `carro-zona-azul` | — | Zona Azul: horário, valor e app. | Zona Azul: horario, precio y app. | Fontes contraditórias (valor e app); licitação revogada em out/2026 | ? |
| `carro-carta-verde` | sempre (prio 2) | Carro argentino: a Carta Verde (seguro obrigatório do Mercosul) cobre danos a terceiros. Leve também o documento do carro e a carteira de motorista. | Si venís en auto: la Carta Verde (seguro obligatorio del Mercosur) cubre daños a terceros. Llevá también la cédula del auto y el registro. | Cartilha Mercosul da PRF (a ler) | ? |

### 3.9 Comer e passear

| id | Gatilho | Texto (PT) | Texto (ES) | Fonte | St |
|---|---|---|---|---|---|
| `ostra-sc` | `hora in 11–14 ou 18–21` (prio 4) | Santa Catarina responde por cerca de 97% da produção de moluscos do Brasil. Ribeirão da Ilha e Santo Antônio de Lisboa servem ostras cultivadas ali mesmo. | Santa Catarina produce cerca del 97% de los moluscos de Brasil. En Ribeirão da Ilha y Santo Antônio de Lisboa sirven ostras cultivadas ahí mismo. | Gazeta do Povo (dado) — **conferir com a Epagri antes de publicar** | ? |
| `baia-calma` | sempre (prio 4) | As praias voltadas para as baías são mais abrigadas e de águas calmas; as de mar aberto têm mais onda. | Las playas que dan a las bahías son más abrigadas y de agua calma; las de mar abierto tienen más olas. | Viaje na Viagem | C |
| `familia-norte` | região norte (prio 4) | Canasvieiras tem mar calmo e raso, boa para crianças. | Canasvieiras tiene mar calmo y playo, ideal para chicos. | Viaje na Viagem | C |

**Total v1: 42 dicas** — 34 confirmadas, 8 a confirmar. Meta antes do lançamento: **60+ confirmadas**, com o dono validando as de conhecimento local (vento, praias, horários) e um passe nas fontes oficiais das marcadas com "?".

### 3.10 Como o dono ajuda (é o que nenhum concorrente tem)

O dono mora na região. No painel, cada dica `a confirmar` aparece com dois botões: **Confirmar** e **Corrigir**. Conhecimento local que não está em site nenhum (qual praia fica boa com vento sul, onde estacionar na Lagoa, a hora em que a SC-401 trava) vira dica confirmada pelo próprio dono, com a fonte "Equipe SC Explorer".

---

## 4. Locais sem IA

### 4.1 De onde vêm (custo zero)

1. **OpenStreetMap (Overpass API)**, gratuito, com licença aberta (exige o crédito "© colaboradores do OpenStreetMap" no mapa e na lista):
   - praias (`natural=beach`), mirantes (`tourism=viewpoint`), trilhas (`highway=path` + nome), museus e atrações (`tourism=museum|attraction`), mercados públicos, restaurantes e cafés (`amenity=restaurant|cafe`) com nome.
   - Um script baixa tudo de Florianópolis **uma vez**, filtra e grava no banco como `rascunho`.
2. **O dono cura** no painel: aprova, descarta, completa os campos da 4.2. Só local aprovado entra em roteiro.
3. **Fotos**: próprias do dono ou bancos com licença livre (Unsplash, Wikimedia Commons), sempre com o crédito salvo no registro.

> Nada de Google, Apify ou IA nesta etapa. O Popular Times (Apify) do plano antigo fica fora: custa crédito e o dono pediu economia.

### 4.2 O que cada local guarda

| Campo | Exemplo |
|---|---|
| nome, região, coordenadas | Mirante da Lagoa, leste, −27,59 / −48,47 |
| tipo | praia, mirante, trilha, museu, mercado, restaurante, café, passeio de barco |
| funciona com chuva | sim / não |
| bom no calor (sombra, água) | sim / não |
| estilos | agitado, calmo, seguro, família, romântico, econômico, aventura, gastronômico |
| faixa de preço | $ · $$ · $$$ |
| melhor horário | manhã, almoço, tarde, pôr do sol, noite |
| tempo médio no local | 90 min |
| fecha em | segunda (ex.) |
| acessível (cadeira, carrinho) | sim / não |
| texto curto ES/PT | escrito uma vez pelo dono ou por mim, conferido |
| foto + crédito | |

### 4.3 O motor de roteiros (regras, não IA)

O dia tem 5 momentos: **manhã, almoço, tarde, pôr do sol, noite**.

1. **Entrada:** região base, dia, estilos escolhidos e o tempo previsto.
2. **Clima decide o modo:** chance de chuva ≥ 50% ou ≥ 5 mm → só locais com "funciona com chuva". UV ≥ 8 ao meio-dia → o almoço e a tarde priorizam sombra.
3. **Para cada momento**, pontua os locais aprovados:
   - combina com o horário (+), com os estilos escolhidos (+ por estilo), está na região base (+) ou vizinha (+ menor);
   - distância do local anterior (− por km) e trânsito atual no trecho (− se pesado);
   - fecha naquele dia → fora; já usado no roteiro → fora.
4. **Pôr do sol** escolhe um mirante ou praia voltada para o oeste, com o horário do SunCalc.
5. **Texto do roteiro** sai de modelos prontos: "{momento}: {local}. {texto_curto}. Saia às {hora_saida} ({tempo_deslocamento} min)."
6. Se faltar local para um momento, o roteiro mostra a vaga e sugere o mais próximo, em vez de inventar.

**Resultado:** o mesmo pedido gera sempre o mesmo roteiro com os mesmos dados, o que é bom para conferir, e nunca indica lugar que não existe.

### 4.4 Quando a IA seria realmente essencial

Nenhum item do lançamento depende de IA. Ficam como opção futura, com custo medido antes:
- traduzir notas do dono para espanhol (centavos por mês);
- resumir em uma frase um roteiro muito personalizado (só se os modelos de texto ficarem repetitivos na prática).

---

## 5. Pendências deste documento

- [ ] Dono confirmar ou corrigir as 8 dicas "?" (principalmente vento sul e Zona Azul).
- [ ] Ler a cartilha Mercosul da PRF (documentos de carro estrangeiro).
- [ ] Pesquisar Pix para chilenos.
- [ ] Conferir na Prefeitura os endereços das UPAs e a tarifa do ônibus.
- [ ] Importar a tábua de marés da Marinha da temporada.
- [ ] Escrever mais ~20 dicas: passeios de barco, trilhas, feiras, festas da temporada, mirantes de pôr do sol.

## 6. Fontes

- CBMSC (bandeiras, app CBMSC Cidadão, correntes de retorno): [NSC Total — cores das bandeiras](https://www.nsctotal.com.br/noticias/cores-bandeiras-praias) · [NSC Total — correntes de retorno](https://www.nsctotal.com.br/?p=7791880) · [Band — corrente de retorno](https://www.band.com.br/nacional/brasil/corrente-de-retorno-saiba-como-identificar-e-escapar-do-canal-no-mar) · [Band — 9 em cada 10 mortes](https://www.band.com.br/nacional/brasil/9-em-cada-10-mortes-por-afogamento-ocorrem-por-correntes-de-retorno)
- Água-viva: [NSC Total — o que fazer](https://www.nsctotal.com.br/noticias/saiba-o-que-fazer-ao-ser-queimado-por-agua-viva)
- Balneabilidade: [NSC Total — após chuvas](https://www.nsctotal.com.br/?p=7066195) · [IMA/SC — portal](https://balneabilidade.ima.sc.gov.br/)
- Protetor solar (SBD): [CNN Brasil](https://www.cnnbrasil.com.br/saude/como-usar-protetor-solar-corretamente-veja-x-dicas-de-dermatologista/) · [Tua Saúde](https://www.tuasaude.com/news/2026/10/30/protetor-solar-o-erro-de-quantidade-que-reduz-a-protecao-e-quando-reaplicar/)
- Ônibus: [Diário do Transporte — fim do dinheiro](https://diariodotransporte.com.br/2025/12/27/florianopolis-sc-acaba-com-pagamento-em-dinheiro-nos-onibus-a-partir-de-janeiro-de-2026/) · [Diário do Transporte — Pix na catraca](https://diariodotransporte.com.br/2026/03/30/florianopolis-sc-adota-pagamento-por-pix-diretamente-na-catraca-dos-onibus/)
- Pix para argentinos: [Panrotas, 30/01/2026](https://www.panrotas.com.br/mercado/pesquisas-e-estatisticas/2026/01/70-dos-turistas-argentinos-ja-usam-pix-em-compras-durante-a-viagem-ao-brasil_225393.html) · [Mercado & Eventos](https://www.mercadoeeventos.com.br/?p=680460)
- Zona Azul (contraditório): [NSC Total — novo modelo](https://www.nsctotal.com.br/?p=7907159) · [TCE/SC](https://www.tcesc.tc.br/radiover/70453)
- Carta Verde: [PRF — Cartilha Mercosul](https://www.gov.br/prf/pt-br/cartilha-mercosul-2023-versao-6-0-portugues.pdf)
- Ostras: [Gazeta do Povo](https://www.gazetadopovo.com.br/santa-catarina/principal-produtor-nacional-santa-catarina-ostras-perda-temporada/)
- Praias das baías: [Viaje na Viagem — 10 praias em Floripa](https://www.viajenaviagem.com/10-praias-em-floripa/)
- Queixas dos turistas: Fecomércio-SC, "Turismo de Verão no Litoral Catarinense 2026"
- UPAs: [NSC Total — UPA Norte](https://www.nsctotal.com.br/?p=6683009)
