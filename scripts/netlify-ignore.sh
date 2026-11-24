#!/usr/bin/env bash
# Trava de deploy da Netlify — SC Explorer (copiada do MOVRA-SITE em 2026-11-23).
#
# Por que existe: o plano Free da Netlify dá 300 créditos/mês para a conta inteira e cada deploy
# de PRODUÇÃO gasta 15. Acabou o crédito, a Netlify pausa os sites até o mês seguinte.
#
# Contrato da Netlify: exit 0 = CANCELA o build · exit 1 = segue com o build.
#
# Regras:
#   0. DEPLOY SÓ COM APROVAÇÃO DO DONO: push no GitHub NÃO publica sozinho. Só constrói o commit
#      cuja mensagem tem [deploy]. Exceção: "Trigger deploy" manual do commit que já está no ar.
#   1. Só produção (branch main). Deploy Preview e branch deploy nunca constroem.
#   2. Commit com [skip netlify] na mensagem não constrói.
#   3. Só constrói se mudou algo que vai para o ar.
#   4. Primeiro deploy ou histórico ausente → constrói.

set -u

if [ "${CONTEXT:-}" != "production" ]; then
  echo "[ignore] contexto '${CONTEXT:-?}' não é produção: build cancelado."
  exit 0
fi

if git log -1 --format=%B 2>/dev/null | grep -qi '\[skip netlify\]'; then
  echo "[ignore] commit marcado com [skip netlify]: build cancelado."
  exit 0
fi

ANTES="${CACHED_COMMIT_REF:-}"
AGORA="${COMMIT_REF:-HEAD}"

if ! git log -1 --format=%B 2>/dev/null | grep -qi '\[deploy\]'; then
  if [ -n "$ANTES" ] && [ "$ANTES" = "$AGORA" ]; then
    echo "[ignore] republicação manual do commit que já está no ar: build segue."
    exit 1
  fi
  echo "[ignore] commit sem [deploy] (deploy só com aprovação do dono): build cancelado."
  exit 0
fi

if [ -z "$ANTES" ] || [ "$ANTES" = "$AGORA" ] || ! git cat-file -e "$ANTES^{commit}" 2>/dev/null; then
  echo "[ignore] sem deploy anterior comparável (primeiro deploy ou manual): build segue."
  exit 1
fi

if git diff --quiet "$ANTES" "$AGORA" -- \
  src public netlify index.html \
  package.json package-lock.json vite.config.js netlify.toml; then
  echo "[ignore] nada que vai para o ar mudou desde ${ANTES:0:7}: build cancelado."
  exit 0
fi

echo "[ignore] mudança em código/conteúdo desde ${ANTES:0:7}: build segue."
exit 1
