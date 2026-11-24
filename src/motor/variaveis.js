// Variáveis do momento, tiradas do estado coletado. São o que os gatilhos das dicas e avisos leem.
import { partesSP, hh, hora, num, t } from '../i18n.js';

const FASE = { cheia: { es: 'llena', pt: 'cheia', en: 'Full' }, nova: { es: 'nueva', pt: 'nova', en: 'New' } };

// Hora "atual" na previsão: a primeira hora cheia que ainda não passou.
export function horasRestantesHoje(estado) {
  const { data } = partesSP();
  return (estado?.clima?.horas || []).filter((x) => x.t.slice(0, 10) === data);
}

// Maior janela seca (prob < 40%) entre 8h e 19h de hoje, a partir de agora.
export function janelaSeca(estado) {
  const { h: agora } = partesSP();
  const hs = horasRestantesHoje(estado).map((x) => ({ h: +x.t.slice(11, 13), seco: x.prob < 40 })).filter((x) => x.h >= Math.max(8, agora) && x.h <= 19);
  let melhor = null, ini = null;
  hs.forEach((x, i) => {
    if (x.seco && ini == null) ini = x.h;
    const fim = !x.seco ? x.h : i === hs.length - 1 ? x.h + 1 : null;
    if (ini != null && fim != null) { if (!melhor || fim - ini > melhor[1] - melhor[0]) melhor = [ini, fim]; ini = null; }
  });
  return melhor && melhor[1] - melhor[0] >= 2 ? melhor : null;
}

export function variaveis(estado, idioma) {
  const c = estado?.clima || {}, m = estado?.mar || {}, tr = estado?.transito?.trechos || [];
  const p = partesSP();
  const agoraMs = Date.now();
  const prox6 = (c.horas || []).slice(0, 6);
  const fimChuva = [...prox6].reverse().find((x) => x.prob >= 60);
  const jan = janelaSeca(estado);
  const baixa = (m.mare?.eventos || []).find((e) => e.tipo === 'baixa' && new Date(e.t) > agoraMs && new Date(e.t) - agoraMs <= 2 * 36e5);
  const pior = tr.filter((x) => ['pesado', 'parado', 'fechado'].includes(x.estado)).sort((a, b) => b.atraso_min - a.atraso_min)[0];
  let minAtePor = null;
  if (c.astro?.por) { const [H, M] = c.astro.por.split(':').map(Number); minAtePor = H * 60 + M - (p.h * 60 + p.m); }
  const EST = { pesado: 'Lento', parado: 'Detenido', fechado: 'Cerrado' };
  return {
    // números (gatilhos)
    hora: p.h, mes: p.mes, dow: p.dow,
    // sol e calor de HOJE só valem até o fim do pico (à noite não faz sentido falar do UV que passou)
    uv_max: p.h < (c.pico_uv?.[1] ?? 16) ? c.uv_max_hoje ?? 0 : 0,
    temp_max: p.h < (c.pico_calor?.[1] ?? 17) ? c.max ?? 0 : 0, onda: m.onda_m ?? 0, rajada: c.rajada_kmh ?? 0, vento: c.vento_kmh ?? 0, vento_dir: c.vento_dir,
    lua: c.astro?.lua, nublado: ['nublado', 'neblina', 'parcial'].includes(c.cond),
    prob6: c.chuva_prob_6h ?? 0, mm6: c.chuva_prox_6h_mm ?? 0, chuva_24h: c.chuva_24h_passadas_mm ?? 0,
    improprios: estado?.balneabilidade?.improprios ?? 0, min_ate_por: minAtePor,
    mare_baixa_em_2h: baixa, janela_seca: jan, pior_trecho: pior,
    // textos (preenchem {variáveis})
    txt: {
      uv_max: c.uv_max_hoje, ini_uv: c.pico_uv ? hh(c.pico_uv[0]) : '', fim_uv: c.pico_uv ? hh(c.pico_uv[1]) : '',
      temp_max: c.max, ini_calor: c.pico_calor ? hh(c.pico_calor[0]) : '', fim_calor: c.pico_calor ? hh(c.pico_calor[1]) : '',
      onda_m: num(m.onda_m), rajada_kmh: c.rajada_kmh, fase_lua: FASE[c.astro?.lua]?.[idioma] || '',
      prob: c.chuva_prob_6h, hora_fim: fimChuva ? hh(+fimChuva.t.slice(11, 13) + 1) : '',
      janela_seca: jan ? `${hh(jan[0])}–${hh(jan[1])}` : '',
      mare_baixa: baixa ? hora(baixa.t) : '', por_do_sol: hora(c.astro?.por),
      estado: pior ? t(EST[pior.estado]).toLowerCase() : '', trecho: pior ? `${pior.via}` : '', atraso: pior?.atraso_min ?? '',
      n: estado?.balneabilidade?.improprios ?? '',
    },
  };
}
