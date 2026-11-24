// Trânsito: vias coloridas pelo estado do momento (TomTom) e a lista de trechos.
import { t, hora } from '../i18n.js';
import { ic, cab, seg, TAG_TRANSITO } from '../ui.js';
import { mapa } from '../mapa.js';
import { seloDado, resumoTransito, linhaTrecho, vazio } from './comum.js';

export const transito = {
  render(ctx) {
    const modo = ctx.ui.modo || 'mapa';
    const tr = ctx.estado?.transito?.trechos || [];
    const r = resumoTransito(ctx.estado);
    const [cls] = TAG_TRANSITO[r.geral] || TAG_TRANSITO.livre;
    const lido = ctx.estado?.transito?.lido_em;
    const sit = `<div class="sit vidro">${ic('carro')}<div><b>${t('Situación actual')}</b><small>${r.texto}</small></div><span class="tag ${cls}">${r.titulo}</span></div>`;
    const corpo = modo === 'mapa'
      ? `<div class="mapa-m alto">${mapa({ topo: -6, trechos: tr, rotulos: tr.filter((x) => x.linha?.length).map((x) => { const p = x.linha[Math.floor((x.linha.length - 1) / 2)]; return { lat: p[0], lon: p[1], texto: x.via }; }) })}${sit}</div>`
      : `${sit.replace('sit vidro', 'sit vidro solto')}<div class="card-lista vidro">${tr.length ? tr.slice().sort((a, b) => b.atraso_min - a.atraso_min).map(linhaTrecho).join('') : vazio(t('Sin datos de tránsito por ahora.'))}</div>`;
    return `${cab(t('Tránsito y tramos'))}
      ${seg('modo', [['mapa', t('Mapa')], ['trechos', t('Tramos')]], modo)}
      ${corpo}
      <p class="rodape-m">${t('Datos de TomTom')}${lido ? ` · ${hora(lido)}` : ''}. ${t('El color muestra la velocidad comparada con la vía libre.')}</p>${seloDado(ctx.estado, 'baixo')}`;
  },
};
