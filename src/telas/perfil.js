// Perfil (idioma, tema, avisos, favoritas, instalar) e a boas-vindas da primeira abertura.
import { t } from '../i18n.js';
import { prefs } from '../prefs.js';
import { ic, link, cab, img } from '../ui.js';
import { praia } from '../conteudo/lugares.js';

const IDIOMAS = [['es', 'Español'], ['pt', 'Português'], ['en', 'English']];
const marca = () => `<svg viewBox="0 0 128 72" aria-hidden="true"><use href="#marca"/></svg><div class="wm"><b>SC</b> Explorer</div>`;

export const perfil = {
  render(ctx) {
    const sw = (k, rot, i) => `<button type="button" class="pf-r" data-aviso="${k}" aria-pressed="${prefs.avisos[k] !== false}">${ic(i)}<span>${t(rot)}</span><span class="sw${prefs.avisos[k] !== false ? ' on' : ''}"></span></button>`;
    const favs = prefs.favs.map(praia).filter(Boolean);
    const temaAtual = prefs.tema || 'auto';
    return `${cab(t('Perfil y ajustes'), { voltar: false })}
      <div class="pf">
        <div class="pf-g"><h2>${t('Idioma')}</h2><div class="seg3">${IDIOMAS.map(([k, r]) => `<button type="button" data-set-idioma="${k}" aria-pressed="${prefs.idioma === k}">${r}</button>`).join('')}</div></div>
        <div class="pf-g"><h2>${t('Tema')}</h2><div class="seg3">${[['escuro', 'Oscuro'], ['claro', 'Claro'], ['auto', 'Automático']].map(([k, r]) => `<button type="button" data-set-tema="${k}" aria-pressed="${temaAtual === k}">${t(r)}</button>`).join('')}</div>
          <p class="pf-nota">${t('El tema claro "Sol fuerte" se lee mejor en la playa, bajo el sol.')}</p></div>
        <div class="pf-g"><h2>${t('Qué mostrar en Avisos')}</h2><div class="pf-l vidro">
          ${sw('chuva', 'Lluvia y tormentas', 'chuva')}${sw('uv', 'UV alto y calor', 'sol')}${sw('transito', 'Tránsito en los tramos', 'carro')}${sw('mar', 'Mar agitado y viento', 'ondas')}
        </div><p class="pf-nota">${t('Los avisos oficiales del INMET se muestran siempre.')}</p></div>
        <div class="pf-l vidro">
          ${link('/playas?regiao=favs', `${ic('coracao')}<span>${t('Playas favoritas')}</span><em>${favs.length}${ic('seta', 'seta')}</em>`, 'pf-r')}
          <button type="button" class="pf-r" data-instalar>${ic('baixar')}<span>${t('Instalar en el celular')}</span><em>${ic('seta', 'seta')}</em></button>
          ${link('/consejos?seg=sos', `${ic('saude')}<span>${t('Emergencias')}</span><em>${ic('seta', 'seta')}</em>`, 'pf-r')}
        </div>
        <div id="instalar-ajuda"></div>
        <p class="rodape-m">${t('Tus elecciones quedan guardadas solo en este dispositivo.')}<br>SC Explorer · ${t('versión de prueba')}</p>
      </div>`;
  },
};

export const boasVindas = {
  classe: 'sem-topo sem-abas',
  render() {
    return `<div class="bv-foto foto escuro-fixo">${img('trilha', 1200)}<div class="bv-marca">${marca()}<small>Florianópolis · ${t('Litoral SC')}</small></div></div>
      <div class="bv-folha">
        <h1 class="bv-tit">${t('Elegí tu idioma')}</h1>
        ${IDIOMAS.map(([k, r]) => `<button type="button" class="op vidro" data-set-idioma="${k}" aria-pressed="${prefs.idioma === k}"><span class="cod">${k.toUpperCase()}</span>${r}${ic('check')}</button>`).join('')}
        <div class="bv-tema">${[['escuro', 'Oscuro', 'lua'], ['claro', 'Claro', 'sol']].map(([k, r, i]) => `<button type="button" class="op vidro" data-set-tema="${k}" aria-pressed="${(prefs.tema || 'escuro') === k}">${ic(i)}${t(r)}</button>`).join('')}</div>
        <button type="button" class="btn-pri" data-comecar>${t('Continuar')}${ic('seta')}</button>
        <span class="bv-sub">${t('Podés cambiarlo cuando quieras en Perfil.')}</span>
      </div>`;
  },
};
