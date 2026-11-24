// Dicas: as do momento primeiro (gatilho ativo), depois as de sempre. Info local e emergências.
import { t } from '../i18n.js';
import { ic, esc, cab, seg } from '../ui.js';
import { dicasDoMomento } from '../motor/dicas.js';
import { CAT_ICONE } from '../conteudo/dicas.js';
import { marcarDicasVistas } from '../prefs.js';

const card = (d) => `<article class="dica vidro${d.ativa ? ' ativa' : ''}" id="${d.id}">
  <span class="dq">${ic(CAT_ICONE[d.cat] || 'lampada')}</span>
  <div><b>${esc(d.titulo || d.texto.split('.')[0])}</b>${d.ativa ? `<span class="pilula agora mini">${t('Hoy')}</span>` : ''}
  <p>${esc(d.texto)}</p><small>${t('Fuente')}: ${esc(d.fonte)}</small></div></article>`;

const SOS = [['193', 'Bomberos y guardavidas', 'guarda'], ['192', 'Ambulancia (SAMU)', 'saude'], ['190', 'Policía Militar', 'alerta'], ['199', 'Defensa Civil', 'info']];

export const dicas = {
  render(ctx) {
    const s = ctx.ui.seg || ctx.query.get('seg') || 'consejos';
    const todas = dicasDoMomento(ctx.estado);
    let corpo;
    if (s === 'sos') {
      corpo = `<div class="sos">${SOS.map(([n, r, i]) => `<a class="vidro" href="tel:${n}">${ic(i)}<span><b>${n}</b><small>${t(r)}</small></span>${ic('telefone', 'seta')}</a>`).join('')}</div>
        <p class="rodape-m">${t('Números nacionales de emergencia de Brasil. Llamada gratuita desde cualquier teléfono.')}</p>`;
    } else {
      const info = ['transporte', 'dinheiro', 'agua', 'saude', 'carro'];
      const lista = s === 'info' ? todas.filter((d) => info.includes(d.cat)) : todas.filter((d) => !info.includes(d.cat) || d.ativa);
      marcarDicasVistas(lista.slice(0, 3).map((d) => d.id));
      corpo = `<div class="dicas-c">${lista.map(card).join('')}</div>
        <p class="rodape-m">${t('Consejos escritos y revisados con fuente. Se eligen según el clima, el mar y el tránsito de ahora, sin IA.')}</p>`;
    }
    return `${cab(t('Consejos y info'))}${seg('seg', [['consejos', t('Consejos')], ['info', t('Info local')], ['sos', t('Emergencias')]], s)}${corpo}`;
  },
  depois() {
    const id = location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'center' });
  },
};
