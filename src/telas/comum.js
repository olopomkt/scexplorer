// Blocos usados por várias telas.
import { t, tn, num, hh, hora, rumo, diaSemana, haTempo } from '../i18n.js';
import { ic, icTempo, link, esc, COND, nivelUV, TAG_TRANSITO, COR_TRANSITO } from '../ui.js';
import { idadeMin } from '../dados/estado.js';

// Selo da origem do dado: exemplo, sem sinal ou atrasado. Real e em dia = nada.
export function seloDado(estado, cls = '') {
  if (!estado) return '';
  if (estado.fonte === 'demo') return `<span class="selo ${cls}">${ic('info')}${t('Datos de ejemplo')}</span>`;
  const idade = idadeMin(estado);
  if (estado.offline) return `<span class="selo ${cls}">${ic('info')}${t('Sin conexión · datos de {h}', { h: hora(estado.atualizado) })}</span>`;
  if (idade != null && idade > 40) return `<span class="selo ${cls}">${ic('relogio')}${t('Actualizado {x}', { x: haTempo(estado.atualizado) })}</span>`;
  return '';
}

export function resumoTransito(estado) {
  const tr = estado?.transito?.trechos || [];
  const ruins = tr.filter((x) => ['pesado', 'parado', 'fechado'].includes(x.estado));
  const medios = tr.filter((x) => x.estado === 'moderado');
  const geral = ruins.length ? 'pesado' : medios.length ? 'moderado' : 'livre';
  const titulo = { livre: 'Flujo libre', moderado: 'Flujo moderado', pesado: 'Flujo lento' }[geral];
  const lentos = [...ruins, ...medios].map((x) => x.via);
  const texto = lentos.length ? t('Más lento en: {v}.', { v: lentos.join(', ') }) : t('Sin demoras en los tramos principales.');
  return { geral, titulo: t(titulo), texto, cor: COR_TRANSITO[geral] };
}

export function linhaTrecho(tr) {
  const [cls, rot] = TAG_TRANSITO[tr.estado] || TAG_TRANSITO.livre;
  const tag = tr.estado === 'livre' && tr.atraso_min < 2 ? t('Libre') : tr.fechado ? t(rot) : `+${tr.atraso_min} min`;
  return `<div class="trecho"><span class="q">${ic('carro', '', `color:${COR_TRANSITO[tr.estado]}`)}</span><div><b>${esc(tr.via)}</b><small>${esc(tn(tr.de))} → ${esc(tn(tr.para))} · ${num(tr.km)} km · ${tr.vel} km/h</small></div><span class="tag ${cls}">${tag}</span></div>`;
}

export function cardClima(estado, { compacto = false } = {}) {
  const c = estado?.clima;
  if (!c) return '';
  const uv = c.dia ? c.uv : c.uv_max_hoje;
  const uvRot = c.dia ? 'UV' : t('UV máx.');
  return link('/clima', `
    <div><div class="ag">${t('Ahora en Florianópolis')}</div>
      <div class="tt"><div class="t">${c.temp}°</div>${icTempo(c.icone)}</div>
      <div class="d">${t(COND[c.cond] || 'Nublado')}${compacto ? '' : ` · ${t('máx.')} ${c.max}° ${t('mín.')} ${c.min}°`}</div></div>
    <ul>
      <li>${ic('termo')}${t('Sensación')} <b>${c.sensacao}°</b></li>
      <li>${ic('sol')}${uvRot} <b class="${uv >= 6 ? 'alto' : ''}">${num(uv, 0)} · ${t(nivelUV(uv))}</b></li>
      <li>${ic('vento')}${t('Viento')} <b>${c.vento_kmh} km/h ${esc(rumo(c.vento_dir))}</b></li>
      <li>${ic('gota')}${t('Humedad')} <b>${c.umidade}%</b></li>
    </ul>`, 'clima-m vidro');
}

export function previsaoDias(estado) {
  const dias = estado?.clima?.dias || [];
  return `<div class="prev">${dias.map((d, i) => `<div><b>${i === 0 ? t('Hoy') : esc(diaSemana(d.data))}</b>${icTempo(d.icone)}<span>${d.max}° <em>${d.min}°</em></span><small>${d.prob >= 30 ? `${ic('gota')}${d.prob}%` : '&nbsp;'}</small></div>`).join('')}</div>`;
}

export const vazio = (texto) => `<p class="vazio">${texto}</p>`;
export { hh };
