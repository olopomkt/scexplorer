// Tela inicial: celular (herói com foto + atalhos) e computador (painel com cards).
import { t, tx, num } from '../i18n.js';
import { prefs } from '../prefs.js';
import { ic, img, link, esc, fotoDoMomento, lot, foto } from '../ui.js';
import { lotacaoAgora, nivelRegiao } from '../motor/lotacao.js';
import { dicasDoMomento } from '../motor/dicas.js';
import { avisos } from '../motor/avisos.js';
import { montarRoteiro } from '../motor/roteiro.js';
import { CAT_ICONE } from '../conteudo/dicas.js';
import { mapa } from '../mapa.js';
import { seloDado, resumoTransito, linhaTrecho, cardClima, previsaoDias } from './comum.js';

const marca = () => `<div class="lock"><svg viewBox="0 0 128 72" aria-hidden="true"><use href="#marca"/></svg><div class="wm"><b>SC</b> Explorer</div></div>`;

function regioesHoje(estado) {
  const R = [['norte', 'Norte de la Isla', 'ensDia'], ['sul', 'Sur de la Isla', 'trilha'], ['leste', 'Este y Lagoa', 'praiaMov']];
  return R.map(([r, nome, f]) => {
    const n = nivelRegiao(estado, r);
    return link(`/playas?regiao=${r}`, `${img(f)}<span class="lotm">${lot(n.nivel, false)}${t('Ocupación')} <b style="color:var(--a-${n.nivel})">${t({ baixa: 'Baja', media: 'Media', alta: 'Alta' }[n.nivel])}</b></span><b>${t(nome)}</b>`, 'c foto escuro-fixo');
  }).join('');
}

function celular(estado) {
  const av = avisos(estado);
  const dica = dicasDoMomento(estado, { limite: 2 });
  return `
  <div class="heroi foto">
    <img src="${foto(fotoDoMomento(estado), 1200)}" alt="" fetchpriority="high">
    <div class="cab-cel">
      <button type="button" class="btn-c idi vidro" data-ciclo-idioma aria-label="${t('Cambiar idioma')}">${prefs.idioma.toUpperCase()}</button>
      <div class="marca">${marca()}<small>Florianópolis · SC</small></div>
      ${link('/avisos', `${ic('sino')}${av.length ? '<i class="ponto"></i>' : ''}`, 'btn-c vidro', ` aria-label="${t('Avisos')}"`)}
    </div>
    <div class="ola"><h1>${t('¡Hola, explorador!')}</h1><p>${t('Planeá, explorá y aprovechá lo mejor de Florianópolis.')}</p>${seloDado(estado)}</div>
  </div>
  <div class="corpo">
    ${link('/explorar?buscar=1', `${ic('busca')}${t('¿Qué querés hacer hoy?')}`, 'busca-c vidro')}
    ${cardClima(estado, { compacto: true })}
    <div class="tiles">
      ${link('/playas', `${ic('guarda', 'grad')}${t('Playas y ocupación')}`, 'tile vidro')}
      ${link('/transito', `${ic('carro', 'grad')}${t('Tránsito y tramos')}`, 'tile vidro')}
      ${link('/itinerarios', `${ic('rota', 'grad')}${t('Itinerarios del día')}`, 'tile vidro')}
      ${link('/lluvia', `${ic('chuva', 'grad')}${t('Día de lluvia')}`, 'tile vidro')}
    </div>
    ${link('/mapa', `${img('praiaMov')}<div class="txt"><span class="pilula agora">${t('Ahora')}</span><b>${t('Ocupación de las playas')}</b><small>${t('Mirá cuáles están más llenas en este momento (estimación).')}</small></div>${ic('seta', 'seta')}`, 'banner foto')}
    ${dica.length ? `<div class="sec-c"><h2>${t('Consejo del momento')}</h2>${link('/consejos', `${t('Ver más')}${ic('seta')}`)}</div>
    <div class="dicas-l">${dica.map((d) => link(`/consejos#${d.id}`, `<span class="dq">${ic(CAT_ICONE[d.cat] || 'lampada')}</span><span><b>${esc(d.titulo)}</b><small>${esc(d.texto)}</small></span>${ic('seta', 'seta')}`, 'vidro')).join('')}</div>` : ''}
    <div class="sec-c"><h2>${t('Hoy en Floripa')}</h2>${link('/playas', `${t('Ver más')}${ic('seta')}`)}</div>
    <div class="hoje">${regioesHoje(estado)}</div>
    <p class="rodape-m">${t('Clima: WeatherAPI · Tránsito: TomTom · Avisos: INMET. Ocupación: estimación del SC Explorer.')}</p>
  </div>`;
}

function computador(estado) {
  const lots = lotacaoAgora(estado).sort((a, b) => b.valor - a.valor).slice(0, 5);
  const rt = resumoTransito(estado);
  const dicas = dicasDoMomento(estado, { limite: 4 });
  const dia = estado?.clima?.dias?.[0];
  const rot = montarRoteiro({ dia, por: estado?.clima?.astro?.por });
  const trechos = (estado?.transito?.trechos || []).slice().sort((a, b) => b.atraso_min - a.atraso_min).slice(0, 4);
  return `
  <div class="capa foto">
    <img src="${foto('centro', 1200)}" alt="" fetchpriority="high">
    <div class="topo-dir">${seloDado(estado, 'vidro')}${link('/avisos', `${ic('sino')}${avisos(estado).length ? '<i class="ponto"></i>' : ''}`, 'btn redondo vidro', ` aria-label="${t('Avisos')}"`)}${link('/perfil', ic('pessoa'), 'btn redondo vidro', ` aria-label="${t('Perfil')}"`)}</div>
    <h1>${t('Explorá Florianópolis')}</h1>
    <p class="lead">${t('Playas, tránsito, clima, consejos e itinerarios, actualizados cada 12 minutos.')}</p>
    ${link('/explorar?buscar=1', `${ic('busca')}${t('¿Qué querés hacer hoy? (playa, mirador, itinerario, restaurante…)')}`, 'busca vidro')}
    <div class="atalhos">
      ${link('/playas', `${ic('guarda', 'grad')}${t('Playas')}`, 'vidro')}${link('/itinerarios', `${ic('rota', 'grad')}${t('Itinerarios')}`, 'vidro')}
      ${link('/explorar?tipo=gastronomia', `${ic('talher', 'grad')}${t('Gastronomía')}`, 'vidro')}${link('/explorar?tipo=passeio', `${ic('camera', 'grad')}${t('Paseos')}`, 'vidro')}
      ${link('/mar', `${ic('ondas', 'grad')}${t('Mar y marea')}`, 'vidro')}
    </div>
  </div>
  <div class="grade-desk">
    <section class="card vidro c4"><h2>${ic('sol')}${t('Clima ahora en Florianópolis')}</h2>${cardClima(estado)}</section>
    <section class="card vidro c4"><h2>${ic('calendario')}${t('Próximos días')}${link('/clima', ic('seta'), 'mais', ` aria-label="${t('Ver más')}"`)}</h2>${previsaoDias(estado)}</section>
    <section class="card c4 foto transito-d escuro-fixo">${img('avenida')}
      <h2>${ic('carro')}${t('Tránsito en la Isla')}</h2>
      <div class="estado"><i style="background:${rt.cor}"></i>${rt.titulo}</div><p>${esc(rt.texto)}</p>
      ${link('/transito', `${ic('mapa')}${t('Ver en el mapa')}`, 'btn-sec')}</section>
    <section class="card vidro c4"><h2>${ic('guarda')}${t('Ocupación de las playas')} <span class="sub-h">${t('estimación')}</span></h2>
      ${lots.every((p) => !p.valor) ? `<p class="nota-m solta">${ic('lua')}${t('De noche las playas están vacías. La estimación vuelve a las 7h.')}</p>` : ''}
      <div class="lista-ocup">${lots.every((p) => !p.valor) ? '' : lots.map((p) => link(`/playa/${p.id}`, `<span class="mini foto">${img(p.foto)}</span><div><b>${esc(p.nome)}</b><div class="barra"><i style="width:${Math.max(6, p.valor)}%;background:var(--a-${p.nivel})"></i></div></div>${lot(p.nivel)}`, 'lin-ocup')).join('')}</div></section>
    <section class="card vidro c4"><h2>${ic('chama')}${t('Mapa de ocupación')}</h2>
      ${link('/mapa', `<div class="mapa-caixa">${mapa({ topo: -22, manchas: lotacaoAgora(estado).filter((p) => p.valor > 0).map((p) => ({ lat: p.lat, lon: p.lon, nivel: p.nivel })), rotulos: [{ lat: -27.44, lon: -48.499, texto: 'Jurerê' }, { lat: -27.5964, lon: -48.5494, texto: 'Centro' }, { lat: -27.675, lon: -48.479, texto: 'Campeche' }] })}<div class="legenda-mapa vidro">${t('Baja')}<i></i>${t('Alta')}</div></div>`, 'mapa-link')}</section>
    <section class="card vidro c4"><h2>${ic('rota')}${t('Tramos')}<span class="tag ok" style="margin-left:auto">TomTom</span></h2><div class="trechos">${trechos.map(linhaTrecho).join('')}</div></section>
    <section class="card vidro c3"><h2>${ic('calendario')}${t('Itinerario del día')}</h2>
      ${link('/itinerarios', `<span class="ft foto">${img('trilha')}</span><div><b>${rot.chuva ? t('Día con lluvia: plan bajo techo') : t('Un día completo en la Isla')}</b><p>${rot.paradas.filter((p) => p.lugar).map((p) => esc(p.lugar.nome)).slice(0, 3).join(' · ')}</p></div>`, 'roteiro-d')}</section>
    <section class="card vidro c3"><h2>${ic('chuva')}${t('Itinerario de lluvia')}</h2>
      ${link('/lluvia', `<span class="ft foto">${img('beiraNoite')}</span><div><b>${t('Floripa con lluvia: ¿qué hacer?')}</b><p>${t('Mercado Público, museos y cafés bajo techo.')}</p></div>`, 'roteiro-d')}</section>
    <section class="card vidro c3"><h2>${ic('lampada')}${t('Consejos')}</h2>
      <div class="lista-links">${dicas.map((d) => link(`/consejos#${d.id}`, `${ic(CAT_ICONE[d.cat] || 'lampada')}<span>${esc(d.titulo)}</span>${ic('seta', 'seta')}`)).join('')}</div></section>
    <section class="card vidro c3"><h2>${ic('info')}${t('Info local')}</h2>
      <div class="lista-links">
        ${link('/consejos?seg=info', `${ic('onibus')}<span>${t('Colectivo: cómo pagar')}</span>${ic('seta', 'seta')}`)}
        ${link('/consejos?seg=info', `${ic('carteira')}<span>${t('Pagar con Pix desde Mercado Pago')}</span>${ic('seta', 'seta')}`)}
        ${link('/consejos?seg=sos', `${ic('saude')}<span>${t('Emergencias: 193 · 192 · 190')}</span>${ic('seta', 'seta')}`)}
        ${link('/mar', `${ic('ondas')}<span>${t('Mar y marea')}</span>${ic('seta', 'seta')}`)}
      </div></section>
  </div>`;
}

export const inicio = {
  classe: 'tela-inicio',
  render: (ctx) => (ctx.desktop ? computador(ctx.estado) : celular(ctx.estado)),
};
export { tx, num };
