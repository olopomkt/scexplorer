// Mapa da Ilha: imagem base da TomTom (sem trânsito) + o que é do momento desenhado por cima.
// A projeção é a mesma usada para gerar a imagem (Web Mercator, zoom 11, tile 512, recorte 932×1643).
import { t } from './i18n.js';
import { esc, COR_TRANSITO } from './ui.js';

const W = 512 * 2 ** 11, LARG = 932, ALT = 1643;
const px = (lon, lat) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return [((lon + 180) / 360) * W, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * W];
};
const [X0, Y0] = px(-48.66, -27.36).map(Math.floor);
// lat/lon → posição em % da imagem
export function projetar(lat, lon) {
  const [x, y] = px(lon, lat);
  return [((x - X0) / LARG) * 100, ((y - Y0) / ALT) * 100];
}

const RGB = { alta: '255,77,77', media: '255,176,60', baixa: '52,211,153' };

// manchas: [{lat, lon, nivel}] · rotulos: [{lat, lon, texto}] · trechos: estado.transito.trechos
export function mapa({ manchas = [], rotulos = [], trechos = [], topo = 0 } = {}) {
  let h = `<div class="mapa-int" style="top:${topo}%">
    <img class="so-e" src="/img/mapa-base-escuro.webp" alt="${esc(t('Mapa de la Isla de Santa Catarina'))}" decoding="async">
    <img class="so-c" src="/img/mapa-base-claro.webp" alt="${esc(t('Mapa de la Isla de Santa Catarina'))}" decoding="async">`;
  if (trechos.length) {
    h += `<svg class="vias" viewBox="0 0 ${LARG} ${ALT}" preserveAspectRatio="none" aria-hidden="true">`;
    for (const tr of trechos) {
      if (!tr.linha?.length) continue;
      const pts = tr.linha.map(([la, lo]) => projetar(la, lo)).map(([x, y]) => `${((x * LARG) / 100).toFixed(1)},${((y * ALT) / 100).toFixed(1)}`).join(' ');
      h += `<polyline points="${pts}" class="via-fundo"/><polyline points="${pts}" class="via" style="stroke:${COR_TRANSITO[tr.estado] || COR_TRANSITO.livre}"/>`;
    }
    h += '</svg>';
  }
  for (const m of manchas) {
    const [x, y] = projetar(m.lat, m.lon); const c = RGB[m.nivel]; const s = m.nivel === 'alta' ? 30 : m.nivel === 'media' ? 23 : 17;
    h += `<span class="mancha" style="left:${x}%;top:${y}%;width:${s}%;background:radial-gradient(circle,rgba(${c},.95) 0%,rgba(${c},.5) 35%,rgba(${c},0) 70%)"></span>`;
  }
  for (const r of rotulos) {
    const [x, y] = projetar(r.lat, r.lon);
    const conteudo = `<span class="marcador${r.cls ? ` ${r.cls}` : ''}" style="left:${x}%;top:${y}%">${esc(r.texto)}</span>`;
    h += r.rota ? `<a href="${r.rota}" data-link>${conteudo}</a>` : conteudo;
  }
  return `${h}</div><span class="creditos">© TomTom · © OpenStreetMap</span>`;
}
