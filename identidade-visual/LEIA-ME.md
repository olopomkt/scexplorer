# Identidade visual do SC Explorer

Aprovada em 24/11/2026. Tudo o que dá cara ao app fica nesta pasta. O manual completo é o `GUIA.html`: abra no navegador. A versão publicada está em https://claude.ai/artifact/GTv3RLtPkQDckBFdJGSiZq

| Pasta / arquivo | O que tem |
|---|---|
| `GUIA.html` | Manual: logotipo, construção, cores, tipografia, ícones, fotos, superfícies, telas, escrita, cuidados e arquivos |
| `prancha-telas.html` | Prancha v3 aprovada: painel + 13 telas, com troca de idioma (ES/PT/EN) e tema (escuro/claro) |
| `logotipo/svg` | Assinatura horizontal e vertical, símbolo e ícone do app (escuro, claro, branco, preto). Nome em curvas |
| `logotipo/png` | Os mesmos em PNG transparente (800, 1200, 2000 px), ícones 1024/512/192/180 e favicon 32 |
| `cores/tokens.css` | Variáveis de CSS: marca, app escuro e claro (mesmos nomes `--a-*` do app), raios, vidro |
| `cores/tokens.json` | Os mesmos valores para Figma e outras ferramentas, com o uso de cada cor |
| `tipografia/` | Plus Jakarta Sans (normal e itálico) e Inter, fontes variáveis, com as licenças OFL |
| `icones/interface` | 50 ícones de traço (24 × 24, traço 1,8, `currentColor`) |
| `icones/clima` | 7 ícones de tempo, versão `escuro` e `claro` |
| `icones/sprite.svg` | Cópia do sprite do app (`src/sprite.svg`) |
| `imagens/` | 9 fotos em 1200 e 480 px (WebP), mapas da ilha nos dois temas e a foto de exemplo do guia |
| `telas/escuro`, `telas/claro` | Prints da prancha: painel do computador e 13 telas de celular |

## Regras curtas

- **A cor do fundo decide a versão do logotipo:** escuro → `-escuro`, claro → `-claro`, foto → `-branco` com faixa escura por baixo.
- **Lagoa e céu são o degradê da marca:** `#1FE0BE` → `#46C2FF` no escuro, `#0B9C86` → `#1C7FD1` no claro.
- **Verde, amarelo e vermelho são da lotação e do trânsito.** Não entram em peça de marca.
- **Fontes:** Plus Jakarta Sans 800 itálico no nome; 700/800 nos títulos. Inter no texto.
- **Fotos:** ilustração por assunto e hora do dia. Nenhuma mostra um lugar identificado.
- **Escrita:**
  - espanhol de Buenos Aires ("vos") primeiro;
  - lotação é sempre "estimativa", nunca "ao vivo";
  - número sempre com unidade.

## Como atualizar

- **Logotipo:** `python logotipo/gerar.py` (lê a fonte de `tipografia/`), depois `node logotipo/exportar-png.mjs <playwright-core> <chrome.exe>`.
- **Ícones:** desenhe no `src/sprite.svg` do app e rode `node icones/extrair.mjs`.
- **Cores:** o valor vivo está em `src/estilo/app.css`. Mudou lá, mude em `cores/tokens.css`, em `cores/tokens.json` e no `GUIA.html`.
- **Fotos:** os originais (32 MB) ficam fora do projeto. Aqui entram só as versões WebP otimizadas.
