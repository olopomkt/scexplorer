// Preferências da pessoa, guardadas só neste aparelho (localStorage pode falhar: tudo em try/catch).
const ler = (k, padrao) => { try { const v = localStorage.getItem(k); return v == null ? padrao : JSON.parse(v); } catch { return padrao; } };
const gravar = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch { /* modo privado */ } };

function idiomaDoAparelho() {
  const l = (navigator.language || 'es').toLowerCase();
  return l.startsWith('pt') ? 'pt' : l.startsWith('en') ? 'en' : 'es';
}

export const prefs = {
  idioma: ler('sce-idioma', null) || idiomaDoAparelho(),
  jaEscolheu: !!ler('sce-idioma', null),
  tema: ler('sce-tema', null), // 'claro' | 'escuro' | null (automático)
  favs: ler('sce-favs', []),
  avisos: { chuva: true, uv: true, transito: true, mar: true, ...ler('sce-avisos', {}) },
  vistas: ler('sce-dicas-vistas', {}), // id da dica → quando foi mostrada (rotação de 24 h)
};

{ // ?idioma=en&tema=claro na URL (útil para testar e para compartilhar)
  const q = new URLSearchParams(location.search);
  if (['es', 'pt', 'en'].includes(q.get('idioma'))) { prefs.idioma = q.get('idioma'); prefs.jaEscolheu = true; }
  if (['claro', 'escuro'].includes(q.get('tema'))) prefs.tema = q.get('tema');
}

export function salvarIdioma(l) { prefs.idioma = l; prefs.jaEscolheu = true; gravar('sce-idioma', l); }
export function salvarTema(t) { prefs.tema = t === 'auto' ? null : t; gravar('sce-tema', prefs.tema); }
export function alternarFav(id) {
  prefs.favs = prefs.favs.includes(id) ? prefs.favs.filter((x) => x !== id) : [...prefs.favs, id];
  gravar('sce-favs', prefs.favs);
}
export function salvarAviso(k, v) { prefs.avisos[k] = v; gravar('sce-avisos', prefs.avisos); }
export function marcarDicasVistas(ids) {
  const agora = Date.now();
  for (const [k, v] of Object.entries(prefs.vistas)) if (agora - v > 864e5) delete prefs.vistas[k];
  for (const id of ids) if (!prefs.vistas[id]) prefs.vistas[id] = agora;
  gravar('sce-dicas-vistas', prefs.vistas);
}

const mq = matchMedia('(prefers-color-scheme: light)');
export const temaEfetivo = () => prefs.tema || (mq.matches ? 'claro' : 'escuro');
export function aoMudarTemaDoAparelho(fn) { mq.addEventListener?.('change', () => { if (!prefs.tema) fn(); }); }
