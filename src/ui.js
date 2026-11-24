// Pedaços de interface reaproveitados pelas telas (HTML em texto; tudo que vem de dado passa por esc()).
import { t, partesSP } from './i18n.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ic = (id, cls = '', estilo = '') => `<svg class="ic ${cls}"${estilo ? ` style="${estilo}"` : ''} aria-hidden="true"><use href="#i-${id}"/></svg>`;
export const icTempo = (icone, cls = 'ico-tempo') => `<svg class="${cls}" aria-hidden="true"><use href="#t-${icone || 'nuvem'}"/></svg>`;
export const link = (rota, conteudo, cls = '', extra = '') => `<a href="${rota}" data-link class="${cls}"${extra}>${conteudo}</a>`;

// Fotos do dono: escolhidas pelo TEMA do momento, nunca apresentadas como foto de uma praia específica.
export const FOTOS = {
  ensDia: 'enseada-dia', ensPor: 'enseada-por-do-sol', praiaMov: 'praia-movimentada', praiaNoite: 'praia-anoitecer',
  trilha: 'trilha-por-do-sol', costao: 'costao-anoitecer', centro: 'centro-ponte-dia', avenida: 'avenida-ponte', beiraNoite: 'beira-mar-noite',
};
export const foto = (nome, tam = 480) => `/img/${FOTOS[nome] || nome}-${tam}.webp`;
export const img = (nome, tam = 480, cls = '') => `<img src="${foto(nome, tam)}" alt="" loading="lazy" decoding="async"${cls ? ` class="${cls}"` : ''}>`;

// Foto do topo conforme a hora e o tempo agora.
export function fotoDoMomento(estado) {
  const { h } = partesSP();
  const c = estado?.clima;
  if (c && ['chuva', 'tormenta'].includes(c.cond)) return 'beiraNoite';
  if (h >= 19 || h < 5) return 'praiaNoite';
  if (h >= 17) return 'ensPor';
  if (h < 8) return 'trilha';
  return c && ['nublado', 'neblina'].includes(c.cond) ? 'centro' : 'ensPor';
}

export const NIVEL = { baixa: 'Baja', media: 'Media', alta: 'Alta' };
export const lot = (nivel, comTexto = true, cls = '') => `<span class="lot ${nivel} ${cls}">${ic('gente')}${comTexto ? t(NIVEL[nivel]) : ''}</span>`;

export const TAG_TRANSITO = { livre: ['ok', 'Libre'], moderado: ['mid', 'Moderado'], pesado: ['bad', 'Lento'], parado: ['bad', 'Detenido'], fechado: ['bad', 'Cerrado'] };
export const COR_TRANSITO = { livre: 'var(--a-baixa)', moderado: 'var(--a-media)', pesado: 'var(--a-alta)', parado: 'var(--a-alta)', fechado: 'var(--a-alta)' };

export const COND = { despejado: 'Despejado', parcial: 'Parcialmente nublado', nublado: 'Nublado', neblina: 'Neblina', chuvisco: 'Lluvia débil', chuva: 'Lluvia', tormenta: 'Tormenta' };
export const nivelUV = (uv) => (uv >= 11 ? 'Extremo' : uv >= 8 ? 'Muy alto' : uv >= 6 ? 'Alto' : uv >= 3 ? 'Moderado' : 'Bajo');

// Cabeçalho das telas internas (voltar + título).
export function cab(titulo, { voltar = true, dir = '' } = {}) {
  return `<header class="mcab">${voltar ? `<button type="button" class="voltar" data-voltar aria-label="${t('Volver')}">${ic('voltar')}</button>` : ''}<h1>${titulo}</h1>${dir ? `<span class="dir">${dir}</span>` : ''}</header>`;
}
// Segmentado (abas internas). `opcoes` = [[valor, rótulo]].
export const seg = (nome, opcoes, atual) => `<div class="seg" role="tablist" style="grid-template-columns:repeat(${opcoes.length},1fr)">${opcoes.map(([v, r]) => `<button type="button" role="tab" data-seg="${nome}" data-v="${v}" aria-selected="${v === atual}" class="${v === atual ? 'on' : ''}">${r}</button>`).join('')}</div>`;
export const chips = (nome, opcoes, atual) => `<div class="chips">${opcoes.map(([v, r]) => `<button type="button" data-chip="${nome}" data-v="${v}" aria-pressed="${v === atual}" class="${v === atual ? 'on' : ''}">${r}</button>`).join('')}</div>`;

// Link "Cómo llegar" (Google Maps pela busca do nome, sem coordenada inventada).
export const comoChegar = (nome) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome}, Florianópolis, SC`)}`;
