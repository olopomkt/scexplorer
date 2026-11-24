# SC Explorer

Guia de bolso para o turista em Florianópolis: clima, mar e maré, trânsito, lotação estimada das praias,
dicas com fonte e roteiros. PWA (instala no celular), em espanhol (padrão), português e inglês, com tema
escuro e claro. **Sem IA**: tudo é dado real + regras + texto escrito e conferido.

## Como funciona

```
WeatherAPI (clima, previsão, sol, lua, mar, marés) ─┐
TomTom (7 trechos de via) ──────────────────────────┼─► netlify/functions/coletar.mjs (a cada 12 min)
INMET (avisos oficiais) ────────────────────────────┘          │  grava 1 linha "estado" + histórico
                                                                ▼
                                                     Supabase (tabela estado, leitura pública)
                                                                │
                                         app (Vite, sem framework) lê direto com a chave publishable
```

- **Dicas:** `src/conteudo/dicas.js` (42 dicas; só `confirmada` vai ao ar) + `src/motor/dicas.js` (gatilhos).
- **Lotação:** `src/motor/lotacao.js` — estimativa por hora, dia, temporada, tempo e trânsito. Não é medição.
- **Roteiros:** `src/motor/roteiro.js` — regras sobre `src/conteudo/lugares.js` (lugares reais).
- **Avisos:** `src/motor/avisos.js` — INMET + regras sobre os dados do momento.
- **Textos da interface:** `src/conteudo/textos.js` (chave em espanhol → [português, inglês]).
- **Identidade visual:** `identidade-visual/` — logotipo, cores, fontes, ícones, fotos, telas e o manual (`GUIA.html`).

## Rodar no computador

```
npm install
npm run coletar     # lê as fontes reais agora (usa o .env) e grava no Supabase e em public/dev-estado.json
npm run dev         # http://localhost:5180
```

Na URL: `?idioma=pt|en|es`, `?tema=claro|escuro`, `?demo` (dados de exemplo) e, só em desenvolvimento,
`?agora=2026-12-20T14:00:00-03:00` (relógio de teste).

Conferências: `node scripts/conferir-traducoes.mjs` (nenhum texto sem tradução) · `npm run build`.

## Banco

`npm run migrar` aplica `supabase/migrations/*.sql` (precisa do `DATABASE_URL` no `.env`).
Sem a senha do banco, cole o SQL da migration no SQL Editor do Supabase.

## Publicar (Netlify)

**Deploy só com aprovação do dono:** a Netlify só constrói o commit cuja mensagem tem `[deploy]`
(`scripts/netlify-ignore.sh`). Push sem `[deploy]` vai para o GitHub e o site fica como está.
Variáveis na Netlify: as de `.env.example`, menos `DATABASE_URL`.
