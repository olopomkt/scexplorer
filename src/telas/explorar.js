// Explorar: busca nos lugares e praias da base (sem IA, sem lugar inventado).
import { t, tx, hora } from '../i18n.js';
import { ic, img, link, esc, cab, chips, comoChegar } from '../ui.js';
import { PRAIAS, LUGARES, TIPOS, REGIOES } from '../conteudo/lugares.js';
import { lotacaoAgora } from '../motor/lotacao.js';
import { vazio } from './comum.js';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const explorar = {
  render(ctx) {
    const tipo = ctx.ui.tipo || ctx.query.get('tipo') || 'todo';
    const busca = ctx.ui.busca || '';
    const lot = Object.fromEntries(lotacaoAgora(ctx.estado).map((p) => [p.id, p]));
    const chuva = (ctx.estado?.clima?.chuva_prob_6h ?? 0) >= 60;
    let todos = [...PRAIAS.map((p) => ({ ...p, tipo: 'praia' })), ...LUGARES];
    if (tipo !== 'todo') todos = todos.filter((l) => l.tipo === tipo || (tipo === 'mirante' && l.tipo === 'trilha'));
    if (busca) { const q = norm(busca); todos = todos.filter((l) => norm(`${l.nome} ${tx(l.txt)} ${tx(TIPOS[l.tipo])} ${tx(REGIOES[l.regiao])}`).includes(q)); }
    const etiqueta = (l) => {
      if (l.tipo === 'praia') { const p = lot[l.id]; return p?.valor ? `<span class="tag ${p.nivel === 'alta' ? 'bad' : p.nivel === 'media' ? 'mid' : 'ok'}">${t({ baixa: 'Baja', media: 'Media', alta: 'Alta' }[p.nivel])}</span>` : ''; }
      if (chuva && l.chuva) return `<span class="tag inf">${t('Bajo techo')}</span>`;
      if (l.oeste) return `<span class="tag inf">${ic('sol')}${hora(ctx.estado?.clima?.astro?.por)}</span>`;
      return '';
    };
    const linha = (l) => {
      const conteudo = `<span class="mini foto">${img(l.foto)}</span><div><b>${esc(l.nome)}</b><small>${esc(tx(TIPOS[l.tipo]))} · ${esc(tx(REGIOES[l.regiao]))}</small></div>${etiqueta(l)}${ic(l.tipo === 'praia' ? 'seta' : 'externo', 'seta')}`;
      return l.tipo === 'praia' ? link(`/playa/${l.id}`, conteudo, 'mlin vidro') : `<a class="mlin vidro" href="${comoChegar(l.nome)}" target="_blank" rel="noopener" title="${esc(tx(l.txt))}">${conteudo}</a>`;
    };
    return `${cab(t('Explorar'), { voltar: false })}
      <label class="busca-m vidro">${ic('busca')}<input type="search" data-busca value="${esc(busca)}" placeholder="${t('Playas, miradores, restaurantes…')}" aria-label="${t('Buscar')}"></label>
      ${chips('tipo', [['todo', t('Todo')], ['praia', t('Playas')], ['mirante', t('Miradores')], ['gastronomia', t('Gastronomía')], ['cultura', t('Cultura')], ['passeio', t('Paseos')], ['compras', t('Compras')]], tipo)}
      <div class="mlista">${todos.length ? todos.map(linha).join('') : vazio(t('Nada encontrado. Probá con otra palabra.'))}</div>
      <p class="rodape-m">${t('Lugares conocidos de la Isla. Lista inicial en revisión por el equipo; confirmá horarios en el lugar.')}</p>`;
  },
  depois(raiz, ctx) {
    const inp = raiz.querySelector('[data-busca]');
    if (inp && (ctx.query.get('buscar') || ctx.ui.busca)) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  },
};
