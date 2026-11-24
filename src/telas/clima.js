// Clima e mar: previsão hora a hora e dos próximos dias, maré, sol, lua e ondas.
import { t, num, hh, hora, diaSemana, partesSP } from '../i18n.js';
import { ic, icTempo, cab, seg, esc, nivelUV } from '../ui.js';
import { REGIOES } from '../conteudo/lugares.js';
import { tx } from '../i18n.js';
import { seloDado, cardClima, previsaoDias } from './comum.js';

const LUA = { nova: 'Nueva', crescente: 'Creciente', quarto_crescente: 'Cuarto creciente', gibosa_crescente: 'Gibosa creciente', cheia: 'Llena', gibosa_minguante: 'Gibosa menguante', quarto_minguante: 'Cuarto menguante', minguante: 'Menguante' };

// Curva da maré do dia a partir dos eventos (cosseno entre alta e baixa consecutivas).
function curvaMare(eventos, data) {
  const ev = eventos.map((e) => ({ ...e, ms: new Date(e.t).getTime() })).sort((a, b) => a.ms - b.ms);
  const ini = new Date(`${data}T00:00:00-03:00`).getTime(), fim = ini + 864e5;
  const W = 300, H = 110, alt = (m) => 92 - m * 80;
  const pts = [];
  for (let ms = ini; ms <= fim; ms += 15 * 60e3) {
    const i = ev.findIndex((e) => e.ms > ms);
    if (i <= 0) continue;
    const a = ev[i - 1], b = ev[i], f = (ms - a.ms) / (b.ms - a.ms);
    const m = a.m + (b.m - a.m) * (1 - Math.cos(Math.PI * f)) / 2;
    pts.push([((ms - ini) / 864e5) * W, alt(m)]);
  }
  if (pts.length < 2) return '';
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const agora = Date.now();
  let marca = '';
  if (agora >= ini && agora <= fim) {
    const x = ((agora - ini) / 864e5) * W; const p = pts.reduce((a, b) => (Math.abs(b[0] - x) < Math.abs(a[0] - x) ? b : a));
    marca = `<line class="agora-l" x1="${x}" y1="8" x2="${x}" y2="${H - 12}"/><circle class="pt" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4.5"/><text x="${Math.min(x + 7, W - 40)}" y="16">${t('Ahora')}</text>`;
  }
  const eixo = [0, 6, 12, 18].map((h) => `<text class="eixo-t" x="${(h / 24) * W + 2}" y="${H - 1}">${hh(h)}</text>`).join('');
  return `<svg class="mare" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="area" d="${d}L${pts[pts.length - 1][0]} ${H - 12}L${pts[0][0]} ${H - 12}Z"/><path class="linha" d="${d}"/>${marca}${eixo}</svg>`;
}

export const clima = {
  render(ctx) {
    const e = ctx.estado, c = e?.clima || {}, m = e?.mar || {};
    const dia = ctx.ui.dia || 'hoy';
    const { data } = partesSP();
    const datas = (c.dias || []).map((d) => d.data);
    const alvo = dia === 'hoy' ? data : datas[1] || data;
    const eventos = (m.mare?.eventos || []).filter((x) => x.t.slice(0, 10) === alvo);
    const horas = (c.horas || []).filter((x) => dia === 'hoy' ? true : x.t.slice(0, 10) === alvo).slice(0, 12);
    const ond = Object.entries(m.regioes || {});
    const cor = (o) => (o >= 1.5 ? ['alta', 'bad', 'Agitado'] : o >= 1 ? ['media', 'mid', 'Moderado'] : ['baixa', 'ok', 'Calmo']);
    const astro = dia === 'hoy' ? c.astro : { ...c.astro, ...(c.astro?.amanha || {}) };
    return `${cab(t('Clima y mar'))}
      ${seg('dia', [['hoy', t('Hoy')], ['manana', t('Mañana')]], dia)}
      ${dia === 'hoy' ? cardClima(e) : ''}
      <div class="mar-card vidro"><div class="det-cab"><b>${t('Hora por hora')}</b><small>WeatherAPI</small></div>
        <div class="horas-prev">${horas.map((x) => `<div><small>${hh(+x.t.slice(11, 13))}</small>${icTempo(x.icone)}<b>${x.temp}°</b><em class="${x.prob >= 50 ? 'chove' : ''}">${x.prob ? `${x.prob}%` : '&nbsp;'}</em>${x.uv >= 6 ? `<i class="uvh">UV ${num(x.uv, 0)}</i>` : '<i>&nbsp;</i>'}</div>`).join('')}</div></div>
      <div class="mar-card vidro"><div class="det-cab"><b>${t('Próximos días')}</b></div>${previsaoDias(e)}</div>
      <div class="mar-card vidro">
        <div class="det-cab"><b>${dia === 'hoy' ? t('Marea de hoy') : t('Marea de mañana')}</b><small>${t('altura en metros')}</small></div>
        ${eventos.length ? curvaMare(m.mare.eventos, alvo) : ''}
        <div class="mare-ev">${eventos.length ? eventos.map((x) => `<div><small>${t(x.tipo === 'alta' ? 'Pleamar' : 'Bajamar')}</small><b>${hora(x.t)} · ${num(x.m)} m</b></div>`).join('') : `<div><small>${t('Sin tabla de mareas por ahora.')}</small></div>`}</div>
      </div>
      <div class="tri">
        <div class="vidro"><small>${ic('nascer')}${t('Sol')}</small><b>${hora(astro?.nascer)} · ${hora(astro?.por)}</b></div>
        <div class="vidro"><small><span class="lua"></span>${t('Luna')}</small><b>${astro?.lua ? t(LUA[astro.lua]) : '–'}${astro?.lua_ilum ? ` · ${astro.lua_ilum}%` : ''}</b></div>
        <div class="vidro"><small>${ic('termo')}${t('Agua')}</small><b>${m.agua_c ?? '–'}°</b></div>
      </div>
      <div class="ondas-r vidro">
        <div class="det-cab"><b>${m.regioes_iguais ? t('Olas') : t('Olas por región')}</b><small>${t('ahora')}</small></div>
        ${m.regioes_iguais || !ond.length
          ? (() => { const [n, tg, r] = cor(m.onda_m ?? 0); return `<div class="onda"><span>${t('Isla')}</span><div class="barra"><i style="width:${Math.min(100, (m.onda_m ?? 0) * 45)}%;background:var(--a-${n})"></i></div><b>${num(m.onda_m)} m</b><span class="tag ${tg}">${t(r)}</span></div><p class="det-pico">${t('El pronóstico no distingue las zonas hoy. Las playas de bahía suelen estar más calmas.')}</p>`; })()
          : ond.map(([k, v]) => { const [n, tg, r] = cor(v.onda_m); return `<div class="onda"><span>${esc(tx(REGIOES[k]))}</span><div class="barra"><i style="width:${Math.min(100, v.onda_m * 45)}%;background:var(--a-${n})"></i></div><b>${num(v.onda_m)} m</b><span class="tag ${tg}">${t(r)}</span></div>`; }).join('')}
      </div>
      <p class="rodape-m">${t('Clima, mar y mareas: WeatherAPI. Las mareas son de previsión: pueden variar unos minutos.')}</p>${seloDado(e, 'baixo')}`;
  },
};
export { nivelUV, diaSemana };
