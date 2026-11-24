// Roteiros do dia (por regras) e o plano para dia de chuva.
import { t, tx, hora, diaSemana, partesSP } from '../i18n.js';
import { ic, img, link, esc, cab, chips, comoChegar } from '../ui.js';
import { montarRoteiro, ESTILOS } from '../motor/roteiro.js';
import { LUGARES, TIPOS } from '../conteudo/lugares.js';
import { lotacaoAgora } from '../motor/lotacao.js';

const MOMENTO = { manha: 'Mañana', almoco: 'Almuerzo', tarde: 'Tarde', por: 'Atardecer', noite: 'Noche' };

function linhaTempo(r) {
  return `<ol class="linha-t">${r.paradas.map((p) => p.vazio
    ? `<li><time>${hora(p.hora)}</time><i></i><span><b>${t(MOMENTO[p.momento])}</b><small>${t('Libre: elegí algo cerca.')}</small></span></li>`
    : `<li><time>${hora(p.hora)}</time><i></i><span><b>${esc(p.lugar.nome)}</b><small>${t(MOMENTO[p.momento])} · ${esc(tx(p.lugar.txt))}${p.km ? ` · ${p.km} km` : ''}</small></span><a href="${comoChegar(p.lugar.nome)}" target="_blank" rel="noopener" aria-label="${t('Cómo llegar')}">${ic('navegar')}</a></li>`).join('')}</ol>`;
}

export const roteiros = {
  render(ctx) {
    const c = ctx.estado?.clima || {};
    const dias = (c.dias || []).slice(0, 3);
    const di = +(ctx.ui.dia ?? 0);
    const estilo = ctx.ui.estilo || 'clasico';
    const dia = dias[di];
    const por = di === 0 ? c.astro?.por : c.astro?.amanha?.por || c.astro?.por;
    const r = montarRoteiro({ dia, estilo, por });
    const ocup = lotacaoAgora(ctx.estado);
    const media = Math.round(ocup.reduce((s, p) => s + p.valor, 0) / ocup.length);
    return `${cab(t('Itinerarios del día'))}
      <div class="dias">${dias.map((d, i) => `<button type="button" data-chip="dia" data-v="${i}" class="${i === di ? 'on' : ''}" aria-pressed="${i === di}">${i === 0 ? t('Hoy') : i === 1 ? t('Mañana') : esc(diaSemana(d.data))}<small>${d.max}° · ${d.prob}%</small></button>`).join('')}</div>
      ${chips('estilo', Object.entries(ESTILOS).map(([k, v]) => [k, tx(v)]), estilo)}
      <article class="rcard vidro">
        <div class="ft foto escuro-fixo">${img(r.chuva ? 'beiraNoite' : 'ensPor')}<span class="sug">${r.chuva ? t('Plan con lluvia') : t('Sugerido para hoy')}</span><h2>${r.chuva ? t('Floripa bajo techo') : t('{e} de Floripa', { e: tx(ESTILOS[estilo]) })}</h2>
          <div class="meta-r"><span>${t('1 día')}</span>${di === 0 && media > 0 ? `<span>${t('Ocupación media')}: ${media}%</span>` : ''}<span>${t('Atardecer')} ${hora(por)}</span></div></div>
        ${linhaTempo(r)}
      </article>
      <p class="rodape-m">${t('Armado por reglas con el pronóstico del día, sin IA. Siempre lugares reales.')}</p>`;
  },
};

export const chuva = {
  classe: 'sem-topo',
  render(ctx) {
    const c = ctx.estado?.clima || {};
    const cobertos = LUGARES.filter((l) => l.chuva);
    const r = montarRoteiro({ dia: c.dias?.[0], por: c.astro?.por, chuvaForcada: true });
    const prob = c.chuva_prob_6h ?? 0;
    return `
      <div class="chuva-topo foto escuro-fixo">${img('beiraNoite', 1200)}
        <button type="button" class="btn-c vidro volta-abs" data-voltar aria-label="${t('Volver')}">${ic('voltar')}</button>
        ${ic('chuva')}<h1>${t('Día de lluvia')}</h1><p>${prob >= 50 ? t('Probabilidad de {p}% en las próximas 6 horas.', { p: prob }) : t('Hoy el pronóstico no indica lluvia fuerte. Igual, este es el plan B.')}</p></div>
      <div class="opc">${cobertos.map((l) => `<a class="vidro" href="${comoChegar(l.nome)}" target="_blank" rel="noopener">${ic(TIPOS[l.tipo]?.ic || 'loja')}<span><b>${esc(l.nome)}</b><small>${esc(tx(TIPOS[l.tipo]))} · ${esc(tx(l.txt))}</small></span>${ic('seta', 'seta')}</a>`).join('')}</div>
      <article class="rcard vidro"><div class="cab-r"><b>${t('Itinerario bajo techo')}</b><small>${t('para hoy')}</small></div>${linhaTempo(r)}</article>
      <p class="rodape-m">${t('Horarios de apertura: confirmá en el lugar antes de ir.')}</p>`;
  },
};
export { partesSP, link };
