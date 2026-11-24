// SC Explorer — casca do app: roteador, barra lateral (computador), abas (celular), idioma, tema e dados.
import './estilo/app.css';
import sprite from './sprite.svg?raw';
import { t, LANG } from './i18n.js';
import { prefs, salvarIdioma, salvarTema, alternarFav, salvarAviso, temaEfetivo, aoMudarTemaDoAparelho } from './prefs.js';
import { ic } from './ui.js';
import { carregarEstado } from './dados/estado.js';
import { avisos as gerarAvisos } from './motor/avisos.js';
import { inicio } from './telas/inicio.js';
import { praias, praiaDetalhe, mapaOc } from './telas/praias.js';
import { transito } from './telas/transito.js';
import { clima } from './telas/clima.js';
import { roteiros, chuva } from './telas/roteiros.js';
import { dicas } from './telas/dicas.js';
import { avisos } from './telas/avisos.js';
import { explorar } from './telas/explorar.js';
import { perfil, boasVindas } from './telas/perfil.js';

document.body.insertAdjacentHTML('afterbegin', sprite);

const ROTAS = [
  ['/', inicio, 'Inicio'], ['/bienvenida', boasVindas, 'Bienvenida'], ['/playas', praias, 'Playas'], ['/playa/:id', praiaDetalhe, 'Playa'],
  ['/mapa', mapaOc, 'Mapa de ocupación'], ['/transito', transito, 'Tránsito'], ['/clima', clima, 'Clima y mar'], ['/mar', clima, 'Clima y mar'],
  ['/itinerarios', roteiros, 'Itinerarios'], ['/lluvia', chuva, 'Día de lluvia'], ['/consejos', dicas, 'Consejos'],
  ['/avisos', avisos, 'Avisos'], ['/explorar', explorar, 'Explorar'], ['/perfil', perfil, 'Perfil'],
];
const ABAS = [['/', 'casa', 'Inicio'], ['/mapa', 'mapa', 'Mapa'], ['/explorar', 'bussola', 'Explorar'], ['/avisos', 'sino', 'Avisos'], ['/perfil', 'pessoa', 'Perfil']];
const MENU = [['/', 'casa', 'Panel principal'], ['/playas', 'guarda', 'Playas'], ['/clima', 'sol', 'Clima y mar'], ['/transito', 'carro', 'Tránsito'], ['/mapa', 'chama', 'Mapa de ocupación'],
  ['/itinerarios', 'rota', 'Itinerarios'], ['/lluvia', 'chuva', 'Día de lluvia'], ['/consejos', 'lampada', 'Consejos'], ['/avisos', 'sino', 'Avisos'], ['/explorar', 'bussola', 'Explorar'], ['/perfil', 'pessoa', 'Perfil']];

const app = document.getElementById('app');
const mqDesk = matchMedia('(min-width: 1024px)');
let estado = null;
const uiPorRota = new Map();
let instalar = null; // evento beforeinstallprompt guardado

function achar(caminho) {
  for (const [padrao, tela, nome] of ROTAS) {
    const p = padrao.split('/'), c = caminho.split('/');
    if (p.length !== c.length) continue;
    const params = {};
    if (p.every((s, i) => (s.startsWith(':') ? ((params[s.slice(1)] = decodeURIComponent(c[i])), true) : s === c[i]))) return { tela, nome, params };
  }
  return { tela: inicio, nome: 'Inicio', params: {} };
}
const ativo = (rota, caminho) => (rota === '/' ? caminho === '/' : caminho === rota || caminho.startsWith(`${rota}/`) || (rota === '/playas' && caminho.startsWith('/playa/')));

function casca(caminho) {
  const nAvisos = estado ? gerarAvisos(estado).length : 0;
  return `
  <aside class="lat" aria-label="${t('Menú')}">
    <a href="/" data-link class="lock"><svg class="so-e" viewBox="0 0 128 72" aria-hidden="true"><use href="#marca"/></svg><svg class="so-c" viewBox="0 0 128 72" aria-hidden="true"><use href="#marca-c"/></svg><span class="wm"><b>SC</b> Explorer</span><span class="sub">Florianópolis · ${t('Litoral SC')}</span></a>
    <nav class="menu">${MENU.map(([r, i, n]) => `<a href="${r}" data-link class="${ativo(r, caminho) ? 'on' : ''}"${ativo(r, caminho) ? ' aria-current="page"' : ''}>${ic(i)}${t(n)}${r === '/avisos' && nAvisos ? `<span class="cont">${nAvisos}</span>` : ''}</a>`).join('')}</nav>
    <div class="leve vidro">${ic('celular', 'grad', 'width:28px;height:28px')}<b>${t('Llevalo en tu celular')}</b><p>${t('Abrí el enlace en el celular y tocá "Agregar a inicio". Funciona como una app, incluso sin señal.')}</p><code>${location.host}</code></div>
  </aside>
  <main id="tela" tabindex="-1"></main>
  <nav class="abas" aria-label="${t('Secciones')}">${ABAS.map(([r, i, n]) => `<a href="${r}" data-link class="aba${ativo(r, caminho) ? ' on' : ''}"${ativo(r, caminho) ? ' aria-current="page"' : ''}>${ic(i)}${t(n)}${r === '/avisos' && nAvisos ? '<i class="ponto"></i>' : ''}</a>`).join('')}</nav>`;
}

function aplicarTema() {
  const claro = temaEfetivo() === 'claro';
  app.classList.toggle('claro', claro);
  document.documentElement.dataset.theme = claro ? 'light' : 'dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', claro ? '#F3EFE7' : '#050D18');
  document.documentElement.lang = LANG[prefs.idioma];
}

function render({ manterScroll = false } = {}) {
  let caminho = location.pathname.replace(/\/+$/, '') || '/';
  if (!prefs.jaEscolheu && caminho === '/') { history.replaceState(null, '', '/bienvenida'); caminho = '/bienvenida'; }
  const { tela, nome, params } = achar(caminho);
  if (!uiPorRota.has(caminho)) uiPorRota.set(caminho, {});
  const ctx = { estado, params, query: new URLSearchParams(location.search), ui: uiPorRota.get(caminho), desktop: mqDesk.matches };
  const y = window.scrollY;
  aplicarTema();
  app.className = `app${app.classList.contains('claro') ? ' claro' : ''} ${tela.classe || ''} ${ctx.desktop ? 'desk' : 'cel'}`.trim();
  app.innerHTML = casca(caminho);
  const main = app.querySelector('#tela');
  main.innerHTML = estado ? tela.render(ctx) : `<div class="carregando">${ic('atualizar')}<span>${t('Cargando…')}</span></div>`;
  document.title = caminho === '/' ? 'SC Explorer · Florianópolis' : `${t(nome)} · SC Explorer`;
  if (estado) tela.depois?.(main, ctx);
  window.scrollTo(0, manterScroll ? y : 0);
}

function ir(url, { substituir = false } = {}) {
  const u = new URL(url, location.origin);
  if (u.origin !== location.origin) { location.href = url; return; }
  if (u.pathname !== location.pathname) uiPorRota.delete(u.pathname.replace(/\/+$/, '') || '/');
  history[substituir ? 'replaceState' : 'pushState']({ app: true }, '', u.pathname + u.search + u.hash);
  render();
  app.querySelector('#tela')?.focus({ preventScroll: true });
}

app.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[data-link]');
  if (a && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey && ev.button === 0) { ev.preventDefault(); ir(a.getAttribute('href')); return; }
  const b = ev.target.closest('button');
  if (!b) return;
  const ui = uiPorRota.get(location.pathname.replace(/\/+$/, '') || '/') || {};
  if (b.dataset.voltar !== undefined) { history.state?.app ? history.back() : ir('/', { substituir: true }); }
  else if (b.dataset.seg) { ui[b.dataset.seg] = b.dataset.v; render({ manterScroll: true }); }
  else if (b.dataset.chip) { ui[b.dataset.chip] = b.dataset.v; render({ manterScroll: true }); }
  else if (b.dataset.setIdioma) { salvarIdioma(b.dataset.setIdioma); render({ manterScroll: true }); }
  else if (b.dataset.setTema) { salvarTema(b.dataset.setTema); render({ manterScroll: true }); }
  else if (b.dataset.cicloIdioma !== undefined) { const o = ['es', 'pt', 'en']; salvarIdioma(o[(o.indexOf(prefs.idioma) + 1) % 3]); render({ manterScroll: true }); }
  else if (b.dataset.fav) { alternarFav(b.dataset.fav); render({ manterScroll: true }); }
  else if (b.dataset.aviso) { salvarAviso(b.dataset.aviso, prefs.avisos[b.dataset.aviso] === false); render({ manterScroll: true }); }
  else if (b.dataset.comecar !== undefined) { salvarIdioma(prefs.idioma); if (!prefs.tema) salvarTema('escuro'); ir('/', { substituir: true }); }
  else if (b.dataset.instalar !== undefined) {
    if (instalar) { instalar.prompt(); instalar = null; return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const alvo = document.getElementById('instalar-ajuda');
    if (alvo) alvo.innerHTML = `<p class="pf-nota destaque">${ios ? t('En iPhone: tocá Compartir y después "Agregar a inicio".') : t('En el menú del navegador, tocá "Instalar app" o "Agregar a la pantalla de inicio".')}</p>`;
  }
});

let espera;
app.addEventListener('input', (ev) => {
  if (!ev.target.matches('[data-busca]')) return;
  const ui = uiPorRota.get(location.pathname) || {};
  ui.busca = ev.target.value;
  clearTimeout(espera);
  espera = setTimeout(() => render({ manterScroll: true }), 180);
});

addEventListener('popstate', () => render());
mqDesk.addEventListener?.('change', () => render({ manterScroll: true }));
aoMudarTemaDoAparelho(() => render({ manterScroll: true }));
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); instalar = e; });

async function atualizar() {
  try { estado = await carregarEstado(); } catch (e) { console.error(e); }
  render({ manterScroll: true });
}
render();
atualizar();
setInterval(() => { if (document.visibilityState === 'visible') atualizar(); }, 6 * 60e3);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && estado && Date.now() - new Date(estado.atualizado) > 12 * 60e3) atualizar(); });

if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('/sw.js').catch(() => {});
