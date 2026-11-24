// Tradução: o texto do código é o espanhol (idioma padrão). O dicionário guarda [português, inglês].
// t('Playas') → "Praias" / "Beaches". Variáveis: t('Pico estimado a las {h}', { h: hh(15) }).
import { D } from './conteudo/textos.js';
import { prefs } from './prefs.js';

const faltando = new Set();
export const LANG = { es: 'es-AR', pt: 'pt-BR', en: 'en' };

export function t(es, vars) {
  const l = prefs.idioma;
  let s = es;
  if (l !== 'es') {
    const par = D[es];
    if (par) s = par[l === 'pt' ? 0 : 1];
    else if (import.meta.env.DEV && !faltando.has(es)) { faltando.add(es); console.warn('[i18n] sem tradução:', es); }
  }
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : s;
}
if (import.meta.env.DEV) window.__faltando = faltando;

// Nome que pode ser próprio (bairro, via): traduz só se o dicionário tiver ("Aeropuerto" → "Airport").
export const tn = (s) => (D[s] ? t(s) : s);

// Texto com as três línguas no próprio objeto ({ es, pt, en }) — usado nas dicas e nos lugares.
export const tx = (o) => (o ? o[prefs.idioma] || o.es || '' : '');

// Números e horas no formato de cada idioma.
export function num(n, casas = 1) {
  if (n == null || Number.isNaN(+n)) return '–';
  return (+n).toLocaleString(LANG[prefs.idioma], { minimumFractionDigits: 0, maximumFractionDigits: casas });
}
// 15 → "15h" (es/pt) ou "3 pm" (en)
export function hh(h) {
  h = ((+h % 24) + 24) % 24;
  if (prefs.idioma !== 'en') return `${h}h`;
  return `${h % 12 || 12} ${h < 12 ? 'am' : 'pm'}`;
}
// "18:49" ou Date → "18:49" (es/pt) ou "6:49 pm" (en)
export function hora(v) {
  if (!v) return '–';
  let h, m;
  if (v instanceof Date || /T/.test(v)) { const d = new Date(v); ({ h, m } = partesSP(d)); }
  else[h, m] = String(v).split(':').map(Number);
  const mm = String(m).padStart(2, '0');
  if (prefs.idioma !== 'en') return `${String(h).padStart(2, '0')}:${mm}`;
  return `${h % 12 || 12}:${mm} ${h < 12 ? 'am' : 'pm'}`;
}
// Relógio de teste (só em desenvolvimento): ?agora=2026-12-20T14:00:00-03:00
const AGORA_TESTE = import.meta.env.DEV ? new URLSearchParams(location.search).get('agora') : null;
// Hora e data no fuso de Florianópolis, qualquer que seja o fuso do aparelho.
export function partesSP(d = AGORA_TESTE ? new Date(AGORA_TESTE) : new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' })
    .formatToParts(d).map((x) => [x.type, x.value]));
  const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
  return { ano: +p.year, mes: +p.month, dia: +p.day, h: +p.hour, m: +p.minute, dow, data: `${p.year}-${p.month}-${p.day}` };
}
export function diaSemana(data, curto = true) {
  const d = new Date(`${data}T12:00:00-03:00`);
  return new Intl.DateTimeFormat(LANG[prefs.idioma], { weekday: curto ? 'short' : 'long', timeZone: 'America/Sao_Paulo' }).format(d).replace('.', '');
}
export function dataCurta(data) {
  const d = new Date(`${data}T12:00:00-03:00`);
  return new Intl.DateTimeFormat(LANG[prefs.idioma], { day: 'numeric', month: 'short', timeZone: 'America/Sao_Paulo' }).format(d).replace('.', '');
}
// "hace 5 min" / "há 5 min" / "5 min ago"
export function haTempo(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return t('ahora');
  if (min < 60) return t('hace {n} min', { n: min });
  const h = Math.round(min / 60);
  if (h < 24) return t('hace {n} h', { n: h });
  return t('hace {n} días', { n: Math.round(h / 24) });
}
// Direção do vento (16 pontos, em inglês) → sigla do idioma.
export function rumo(dir) {
  if (!dir) return '';
  // Oeste = O em espanhol e português; o resto da rosa dos ventos é igual nos três idiomas.
  return prefs.idioma === 'en' ? dir : dir.replace(/W/g, 'O');
}
