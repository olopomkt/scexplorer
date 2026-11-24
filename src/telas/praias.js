// Praias: lista com lotação estimada, detalhe de cada praia e mapa de ocupação.
import { t, tx, num, hh, hora, rumo } from '../i18n.js';
import { prefs } from '../prefs.js';
import { ic, img, link, esc, lot, cab, seg, chips, comoChegar, foto, nivelUV } from '../ui.js';
import { PRAIAS, REGIOES, praia as acharPraia } from '../conteudo/lugares.js';
import { lotacaoAgora, curvaDoDia, nivel } from '../motor/lotacao.js';
import { mapa } from '../mapa.js';
import { seloDado, vazio } from './comum.js';
import { partesSP } from '../i18n.js';

const OPC_REG = () => [['todas', t('Todas')], ...Object.entries(REGIOES).map(([k, v]) => [k, tx(v)]), ['favs', t('Favoritas')]];

function marPraia(estado, p) {
  if (p.mar === 'baia') return t('bahía · agua calma');
  const o = estado?.mar?.regioes?.[p.regiao === 'centro' ? 'leste' : p.regiao]?.onda_m ?? estado?.mar?.onda_m;
  return o != null ? t('olas {m} m', { m: num(o) }) : t('mar abierto');
}
function aguaIMA(estado, p) {
  const b = estado?.balneabilidade?.pontos?.[p.id];
  return b === 'propria' ? t('agua apta') : b === 'impropria' ? t('agua no apta') : '';
}

function lista(ctx) {
  const reg = ctx.ui.regiao || ctx.query.get('regiao') || 'todas';
  const modo = ctx.ui.modo || 'lista';
  let ps = lotacaoAgora(ctx.estado);
  if (reg === 'favs') ps = ps.filter((p) => prefs.favs.includes(p.id));
  else if (reg !== 'todas') ps = ps.filter((p) => p.regiao === reg);
  ps.sort((a, b) => b.valor - a.valor || a.nome.localeCompare(b.nome));
  const noite = partesSP().h >= 20 || partesSP().h < 7;
  const corpo = modo === 'mapa'
    ? `<div class="mapa-m alto">${mapa({ topo: 0, manchas: ps.filter((p) => p.valor > 0).map((p) => ({ lat: p.lat, lon: p.lon, nivel: p.nivel })), rotulos: ps.map((p) => ({ lat: p.lat, lon: p.lon, texto: p.nome.replace('Praia ', ''), rota: `/playa/${p.id}`, cls: `n-${p.nivel}` })) })}<span class="pilula est canto">${t('Estimación')}</span></div>`
    : `<div class="mlista">${ps.length ? ps.map((p) => {
      const extra = [tx(REGIOES[p.regiao]), aguaIMA(ctx.estado, p) || marPraia(ctx.estado, p)].filter(Boolean).join(' · ');
      return link(`/playa/${p.id}`, `<span class="mini foto">${img(p.foto)}</span><div><b>${esc(p.nome)}</b><small>${esc(extra)}</small></div>${noite ? `<span class="lotv lot">${ic('lua')}</span>` : `<span class="lotv lot ${p.nivel}">${ic('gente')}${t({ baixa: 'Baja', media: 'Media', alta: 'Alta' }[p.nivel])}</span>`}${ic('seta', 'seta')}`, 'mlin vidro');
    }).join('') : vazio(reg === 'favs' ? t('Todavía no tenés playas favoritas. Tocá el corazón en una playa.') : t('Ninguna playa en esta zona.'))}</div>`;
  return `${cab(t('Playas y ocupación'))}
    ${seg('modo', [['lista', t('Lista')], ['mapa', t('Mapa')]], modo)}
    ${chips('regiao', OPC_REG(), reg)}
    ${noite ? `<p class="nota-m">${ic('lua')}${t('De noche las playas están vacías. La estimación vuelve a las 7h.')}</p>` : `<p class="nota-m">${ic('info')}${t('Ocupación estimada por hora, día, clima y tránsito. No es una medición.')}</p>`}
    ${corpo}${seloDado(ctx.estado, 'baixo')}`;
}

function detalhe(ctx) {
  const p = acharPraia(ctx.params.id);
  if (!p) return `${cab(t('Playa'))}${vazio(t('No encontramos esta playa.'))}`;
  const e = ctx.estado, c = e?.clima || {}, m = e?.mar || {};
  const curva = curvaDoDia(e, p);
  const agoraH = partesSP().h;
  const pico = curva.reduce((a, b) => (b.v > a.v ? b : a), curva[0]);
  const agora = curva.find((x) => x.h === agoraH);
  const regMar = m.regioes?.[p.regiao === 'centro' ? 'leste' : p.regiao] || {};
  const fav = prefs.favs.includes(p.id);
  const ima = e?.balneabilidade?.pontos?.[p.id];
  return `
  <div class="det-foto foto escuro-fixo"><img src="${foto(p.foto, 1200)}" alt="">
    <div class="det-bt"><button type="button" class="btn-c vidro" data-voltar aria-label="${t('Volver')}">${ic('voltar')}</button>
      <button type="button" class="btn-c vidro${fav ? ' fav' : ''}" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${t('Favorita')}">${ic('coracao')}</button></div>
    <div class="det-tit"><span class="pilula est">${t('Estimación')}</span><h1>${esc(p.nome)}</h1><small>${esc(tx(REGIOES[p.regiao]))} · ${esc(tx(p.txt))}</small></div>
    <span class="credito-foto">${t('Foto ilustrativa')}</span>
  </div>
  <div class="det-corpo">
    <div class="det-card vidro">
      <div class="det-cab"><b>${t('Ocupación por hora')}</b>${agora && agora.v ? `${lot(nivel(agora.v), true)}` : `<small>${t('Fuera de horario')}</small>`}</div>
      <div class="horas">${curva.map((x) => `<i class="${x.h > agoraH ? 'fut' : ''} ${x.h === agoraH ? 'ag' : ''}" style="height:${Math.max(4, x.v)}%;background:var(--a-${nivel(x.v)})" title="${hh(x.h)}: ${x.v}%"></i>`).join('')}</div>
      <div class="eixo"><span>${hh(8)}</span><span>${hh(11)}</span><span>${hh(14)}</span><span>${hh(17)}</span><span>${hh(20)}</span></div>
      <p class="det-pico">${pico.v ? t('Pico estimado a las {h}', { h: hh(pico.h) }) : ''}</p>
    </div>
    <div class="det-dados">
      <div class="vidro">${ic('ondas')}<b>${p.mar === 'baia' ? t('Calmo') : `${num(regMar.onda_m ?? m.onda_m)} m`}</b><small>${t('Olas')}</small></div>
      <div class="vidro">${ic('termo')}<b>${regMar.agua_c ?? m.agua_c ?? '–'}°</b><small>${t('Agua')}</small></div>
      <div class="vidro">${ic('vento')}<b>${c.vento_kmh ?? '–'}</b><small>km/h ${esc(rumo(c.vento_dir))}</small></div>
      <div class="vidro">${ic('sol')}<b>${c.uv_max_hoje ?? '–'}</b><small>${t('UV máx.')}</small></div>
    </div>
    <div class="det-ima vidro">${ic('gota')}<span><b>${ima === 'propria' ? t('Apta para baño') : ima === 'impropria' ? t('No apta para baño') : t('Calidad del agua')}</b><small>${ima ? t('IMA · último informe') : t('Consultá el informe del IMA antes de bañarte.')}</small></span>${ima ? `<span class="tag ${ima === 'propria' ? 'ok' : 'bad'}">${t(ima === 'propria' ? 'Apta' : 'No apta')}</span>` : `<a class="tag inf" href="https://balneabilidade.ima.sc.gov.br/" target="_blank" rel="noopener">IMA ${ic('externo')}</a>`}</div>
    ${c.astro?.por ? `<div class="det-ima vidro">${ic('nascer')}<span><b>${t('Sol')}: ${hora(c.astro.nascer)} · ${hora(c.astro.por)}</b><small>${t('UV {n} · {nivel}', { n: c.uv_max_hoje ?? '–', nivel: t(nivelUV(c.uv_max_hoje ?? 0)) })}</small></span></div>` : ''}
    <a class="btn-pri" href="${comoChegar(p.nome)}" target="_blank" rel="noopener">${ic('navegar')}${t('Cómo llegar')}</a>
  </div>`;
}

function mapaOcupacao(ctx) {
  const camada = ctx.ui.camada || 'praias';
  const ps = lotacaoAgora(ctx.estado);
  const trechos = camada === 'transito' ? ctx.estado?.transito?.trechos || [] : [];
  const manchas = camada === 'praias' ? ps.filter((p) => p.valor > 0).map((p) => ({ lat: p.lat, lon: p.lon, nivel: p.nivel })) : [];
  const rotulos = camada === 'praias' ? ps.filter((p) => p.pop >= 0.8).map((p) => ({ lat: p.lat, lon: p.lon, texto: p.nome.replace('Praia ', ''), rota: `/playa/${p.id}` })) : (ctx.estado?.transito?.trechos || []).map((x) => ({ lat: x.linha?.[Math.floor((x.linha.length - 1) / 2)]?.[0], lon: x.linha?.[Math.floor((x.linha.length - 1) / 2)]?.[1], texto: x.via })).filter((x) => x.lat);
  return `${cab(t('Mapa de ocupación'))}
    ${chips('camada', [['praias', t('Playas')], ['transito', t('Tránsito')]], camada)}
    <div class="mapa-m alto">${mapa({ topo: 0, manchas, rotulos, trechos })}
      ${camada === 'praias' ? `<div class="legenda-mapa vidro">${t('Baja')}<i></i>${t('Alta')}</div><span class="pilula est canto">${t('Estimación')}</span>` : `<div class="legenda-mapa vidro">${t('Libre')}<i></i>${t('Lento')}</div>`}
    </div>${seloDado(ctx.estado, 'baixo')}`;
}

export const praias = { render: lista };
export const praiaDetalhe = { render: detalhe, classe: 'sem-topo' };
export const mapaOc = { render: mapaOcupacao };
export { PRAIAS };
