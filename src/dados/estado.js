// De onde vem o estado: 1) Supabase (o coletor grava a cada 12 min) · 2) em desenvolvimento, o
// arquivo do coletor local · 3) a última cópia boa guardada no aparelho (sem sinal) · 4) dados de
// exemplo (modo demo), sempre marcados na tela como exemplo.
import { estadoDemo } from './demo.js';

const CHAVE = 'sce-estado';
const SB_URL = __SB_URL__, SB_PUB = __SB_PUB__;

async function doSupabase() {
  if (!SB_URL || !SB_PUB) return null;
  const r = await fetch(`${SB_URL.replace(/\/$/, '')}/rest/v1/estado?id=eq.1&select=dados`, { headers: { apikey: SB_PUB }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) return null;
  return (await r.json())?.[0]?.dados || null;
}
async function doArquivoLocal() {
  if (!import.meta.env.DEV) return null;
  const r = await fetch('/dev-estado.json', { cache: 'no-store' }).catch(() => null);
  return r?.ok ? r.json().catch(() => null) : null;
}

export async function carregarEstado() {
  const forcarDemo = new URLSearchParams(location.search).has('demo');
  if (!forcarDemo) {
    for (const fonte of [doSupabase, doArquivoLocal]) {
      try {
        const e = await fonte();
        if (e?.clima) { try { localStorage.setItem(CHAVE, JSON.stringify(e)); } catch { /* cheio ou privado */ } return e; }
      } catch { /* tenta a próxima */ }
    }
    try { const c = JSON.parse(localStorage.getItem(CHAVE) || 'null'); if (c?.clima) return { ...c, offline: true }; } catch { /* nada guardado */ }
  }
  return estadoDemo();
}

// Minutos desde a última coleta (para avisar quando o dado estiver velho).
export const idadeMin = (e) => (e?.atualizado ? Math.round((Date.now() - new Date(e.atualizado).getTime()) / 60000) : null);
