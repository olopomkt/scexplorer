# SC Explorer — como pegar as 3 chaves

> Conferido nas páginas oficiais em **22/11/2026**. Onde a página oficial não diz o nome exato de um botão, está escrito "a página não diz"; nada aqui foi inventado.
> Quando tiver as 3 chaves, cole cada uma no arquivo `.env` da pasta do projeto (linhas `TOMTOM_KEY=`, `WEATHERAPI_KEY=`, `OPENWEATHER_KEY=`) ou mande para mim que eu coloco.

---

## 1. TomTom (trânsito dos 12 trechos)

**O que ela faz no app:** velocidade atual × velocidade livre em cada trecho (SC-401, Morro da Lagoa, pontes, BR-101 etc.).

**Passo a passo:**
1. Entre em **https://my.tomtom.com/** com o e-mail e a senha que você cadastrou.
   - Se ainda não confirmou o e-mail, confirme pelo link que a TomTom mandou.
2. Abra **API & SDK Keys**. O endereço direto é **https://my.tomtom.com/keys**.
3. A TomTom já cria uma chave sozinha, chamada **"My first API key"**. Clique nela.
4. Copie a chave (um texto longo de letras e números) e me mande ou cole no `.env`.

**Não precisa** criar outra chave nem escolher produtos: a conta grátis já tem um projeto e a chave automática serve.

**Limites (página de preços oficial):**
- Grátis, **sem cartão de crédito**.
- **Traffic Flow API Segment Data: 20.000 leituras grátis por mês.** O app vai ler 12 trechos a cada 20 min, das 7h às 22h = ~16.700 por mês, dentro do limite.
- ⚠️ A TomTom chama o grátis de **"free evaluation"** (avaliação). Para o teste não há problema. Antes de vender, é preciso ler os termos de uso comercial (fica na lista de pendências).

**Teste rápido (opcional):** cole no navegador, trocando `SUA_CHAVE`:
`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=-27.5640,-48.5030&unit=KMPH&key=SUA_CHAVE`
Se aparecer um texto com `currentSpeed` e `freeFlowSpeed`, a chave funciona.

---

## 2. WeatherAPI.com (tempo agora, chuva por hora, vento, ar, mar)

**O que ela faz no app:** é a fonte principal de clima: temperatura, sensação, chuva por hora, rajadas, qualidade do ar, alertas e a previsão marinha do dia.

**Passo a passo:**
1. Entre em **https://www.weatherapi.com/** e faça login com a conta que você criou (Google, GitHub ou e-mail, do jeito que se cadastrou).
2. Depois de entrar, abra **https://www.weatherapi.com/my/** — é o painel da sua conta.
3. A chave aparece nesse painel (a documentação oficial diz só "copy your API key from your account"; o nome exato da seção, a página não diz). Copie e me mande.

**Limites (página de preços oficial):**
- Toda conta nova ganha **7 dias do plano Business**; depois **muda sozinha para o Free**, sem cartão e sem cobrança.
- **Free: 100.000 chamadas por mês**, 3 dias de previsão, previsão marinha de 1 dia, qualidade do ar e alertas (limitados).
- A página diz: **"Free covers light use, including commercial apps"** — o grátis permite uso comercial.
- Se estourar o limite, a API para até o dia 1º do mês seguinte. O app vai usar ~5 mil por mês.

---

## 3. OpenWeatherMap (reserva do clima)

**O que ela faz no app:** só entra se a WeatherAPI cair. Por isso o app nunca fica sem clima.

**Passo a passo:**
1. **Confirme o e-mail** primeiro. A OpenWeather só libera a chave depois que o e-mail é verificado (procure o e-mail deles, inclusive no spam).
   - Se o e-mail não chegou: dá para pedir reenvio 1 hora depois do cadastro, nas configurações do perfil.
2. Entre em **https://home.openweathermap.org/** e abra a aba **"API keys"**. Endereço direto: **https://home.openweathermap.org/api_keys**.
3. A chave fica listada nessa aba. Copie e me mande. (Se a lista estiver vazia, a própria aba permite criar uma.)
4. ⚠️ **A chave pode levar até 2 horas para funcionar** depois do cadastro. Se der erro "401" logo de cara, é normal: espere.

**Limites (página de preços oficial):**
- Plano **"Free for everyone"**: 60 chamadas por minuto e 1.000.000 por mês.
- Inclui **Current Weather**, **3-hour Forecast (5 days)** e **Air Pollution** — é o que o app usa.
- **Não assine** o "One Call API" (pede cartão e cobra por chamada). O app não usa.

---

## Depois das chaves

Nada mais é preciso de você para o clima e o trânsito. As outras fontes são abertas e sem cadastro:
- **INMET** (avisos oficiais), **CPTEC/INPE** (ondas e UV), **IMA/SC** (balneabilidade), **Marinha** (marés), cálculo do sol no próprio app.

Fontes: [TomTom — How to get a TomTom API key](https://docs.tomtom.com/platform/documentation/my-tomtom/how-to-get-a-tomtom-api-key) · [TomTom — Pricing](https://docs.tomtom.com/pricing) · [WeatherAPI — Docs](https://www.weatherapi.com/docs/) · [WeatherAPI — Pricing](https://www.weatherapi.com/pricing.aspx) · [OpenWeather — FAQ](https://openweathermap.org/faq) · [OpenWeather — Price](https://openweathermap.org/price)
