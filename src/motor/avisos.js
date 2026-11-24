// Avisos: só o que exige atenção agora. INMET (oficial) + regras sobre os dados do momento.
// Cada aviso tem categoria (para os filtros do Perfil), cor e o momento a que se refere.
import { t, tn, hh, hora, num, dataCurta, partesSP } from '../i18n.js';
import { prefs } from '../prefs.js';
import { dicasDoMomento } from './dicas.js';

const EVENTOS_INMET = {
  'Tempestade': ['Tormenta', 'Tempestade', 'Storm'], 'Chuvas Intensas': ['Lluvias intensas', 'Chuvas intensas', 'Heavy rain'],
  'Acumulado de Chuva': ['Lluvia acumulada', 'Acumulado de chuva', 'Heavy rainfall'], 'Vendaval': ['Vendaval', 'Vendaval', 'Gale'],
  'Ventos Costeiros': ['Vientos costeros', 'Ventos costeiros', 'Coastal winds'], 'Onda de Calor': ['Ola de calor', 'Onda de calor', 'Heat wave'],
  'Baixa Umidade': ['Baja humedad', 'Baixa umidade', 'Low humidity'], 'Declínio de Temperatura': ['Descenso de temperatura', 'Declínio de temperatura', 'Temperature drop'],
  'Ressaca': ['Resaca (mar de fondo)', 'Ressaca', 'Storm surge'], 'Granizo': ['Granizo', 'Granizo', 'Hail'],
};
const NIVEL_INMET = { amarelo: ['Peligro potencial', 'var(--a-media)'], laranja: ['Peligro', 'var(--a-coral)'], vermelho: ['Gran peligro', 'var(--a-alta)'] };
const CAT_INMET = (ev) => (/Vent|Vendaval|Ressaca/.test(ev) ? 'mar' : /Calor/.test(ev) ? 'uv' : 'chuva');

function quando(inicio, fim) {
  const hoje = partesSP().data;
  const d = (iso) => iso.slice(0, 10);
  const dia = (iso) => (d(iso) === hoje ? t('hoy') : dataCurta(d(iso)));
  return `${dia(inicio)} ${hora(inicio)} – ${d(fim) === d(inicio) ? '' : `${dia(fim)} `}${hora(fim)}`;
}

export function avisos(estado) {
  if (!estado) return [];
  const lista = [];
  const idx = prefs.idioma === 'es' ? 0 : prefs.idioma === 'pt' ? 1 : 2;
  for (const a of estado.avisos_inmet || []) {
    const nome = EVENTOS_INMET[a.evento]?.[idx] || a.evento;
    const [nv, cor] = NIVEL_INMET[a.nivel] || NIVEL_INMET.amarelo;
    lista.push({ id: `inmet-${a.id}`, cat: CAT_INMET(a.evento), cor, icone: 'alerta', titulo: `${nome} · INMET`, texto: `${t(nv)}. ${quando(a.inicio, a.fim)}.`, desde: estado.avisos_inmet_lido_em || estado.atualizado, oficial: true });
  }
  const c = estado.clima || {}, m = estado.mar || {};
  const prox = (c.horas || []).slice(0, 6).find((x) => x.prob >= 60);
  if (prox) lista.push({ id: 'chuva', cat: 'chuva', cor: 'var(--a-sec)', icone: 'chuva', titulo: t('Lluvia desde las {h}', { h: hh(+prox.t.slice(11, 13)) }), texto: t('Probabilidad del {p}%. Mirá el itinerario de lluvia.', { p: prox.prob }), rota: '/lluvia', desde: c.lido_em });
  if ((c.uv_max_hoje ?? 0) >= 11 && c.pico_uv && partesSP().h < c.pico_uv[1]) lista.push({ id: 'uv', cat: 'uv', cor: 'var(--a-alta)', icone: 'sol', titulo: t('UV extremo de {a} a {b}', { a: hh(c.pico_uv[0]), b: hh(c.pico_uv[1]) }), texto: t('Índice {n}. Buscá sombra y renová el protector cada 2 horas.', { n: c.uv_max_hoje }), desde: c.lido_em });
  if ((m.onda_m ?? 0) >= 1.5) lista.push({ id: 'mar', cat: 'mar', cor: 'var(--a-coral)', icone: 'ondas', titulo: t('Mar agitado'), texto: t('Olas de {m} m. Bañate frente al guardavidas.', { m: num(m.onda_m) }), rota: '/mar', desde: m.lido_em });
  for (const tr of (estado.transito?.trechos || []).filter((x) => ['pesado', 'parado', 'fechado'].includes(x.estado))) {
    lista.push({ id: `tr-${tr.id}`, cat: 'transito', cor: 'var(--a-media)', icone: 'carro', titulo: `${tr.via}: ${t(tr.estado === 'fechado' ? 'cerrado' : 'lento')}`, texto: tr.fechado ? t('Vía cerrada según TomTom.') : t('+{n} min de {a} a {b}.', { n: tr.atraso_min, a: tn(tr.de), b: tn(tr.para) }), rota: '/transito', desde: estado.transito.lido_em });
  }
  // dicas críticas com gatilho ativo que ainda não viraram aviso acima
  const ja = new Set(lista.map((x) => x.cat));
  for (const d of dicasDoMomento(estado).filter((x) => x.aviso)) {
    const cat = { sol: 'uv', mar: 'mar', vento: 'mar', agua: 'mar', transito: 'transito' }[d.cat] || 'chuva';
    if (d.id === 'tr-pesado' || (d.id === 'sol-uv-alto' && ja.has('uv'))) continue;
    lista.push({ id: `dica-${d.id}`, cat, cor: 'var(--a-media)', icone: { sol: 'sol', mar: 'ondas', vento: 'vento', agua: 'gota' }[d.cat] || 'info', titulo: d.titulo, texto: d.texto, desde: estado.atualizado });
  }
  return lista.filter((a) => prefs.avisos[a.cat] !== false || a.oficial);
}
