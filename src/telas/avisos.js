// Avisos: só o que pede atenção agora, com a hora do dado.
import { t, haTempo } from '../i18n.js';
import { ic, esc, cab, chips, link } from '../ui.js';
import { avisos as gerar } from '../motor/avisos.js';
import { seloDado, vazio } from './comum.js';

export const avisos = {
  render(ctx) {
    const cat = ctx.ui.cat || 'todos';
    const todos = gerar(ctx.estado);
    const lista = cat === 'todos' ? todos : todos.filter((a) => a.cat === cat);
    const item = (a) => {
      const corpo = `<span class="q">${ic(a.icone)}</span><div><b>${esc(a.titulo)}</b><p>${esc(a.texto)}</p>${a.desde ? `<time>${haTempo(a.desde)}</time>` : ''}</div>`;
      return a.rota ? link(a.rota, corpo, 'aviso vidro', ` style="--cor:${a.cor}"`) : `<div class="aviso vidro" style="--cor:${a.cor}">${corpo}</div>`;
    };
    return `${cab(t('Avisos'), { voltar: false, dir: todos.length ? `<span class="pilula agora">${todos.length === 1 ? t('1 activo') : t('{n} activos', { n: todos.length })}</span>` : '' })}
      ${chips('cat', [['todos', t('Todos')], ['chuva', t('Clima')], ['uv', 'UV'], ['mar', t('Mar')], ['transito', t('Tránsito')]], cat)}
      <div class="avs">${lista.length ? lista.map(item).join('') : vazio(`${ic('check')} ${t('Todo tranquilo por ahora. Te avisamos acá si algo cambia.')}`)}</div>
      <p class="rodape-m">${t('Avisos oficiales del INMET y reglas sobre los datos de ahora. Elegí cuáles ver en Perfil.')}</p>${seloDado(ctx.estado, 'baixo')}`;
  },
};
