// Coletor do SC Explorer: lê as fontes, monta o "estado" (um retrato do momento) e grava no Supabase.
// Roda na função agendada da Netlify (a cada 12 min) e no script local (npm run coletar).
// Fontes: WeatherAPI (clima, previsão, sol, lua, mar e maré), TomTom (trânsito), INMET (avisos).
// Nenhuma IA. Se uma fonte falhar, a seção dela fica com o último valor bom (marcada em `falhas`).

export const TRECHOS = [
  // ponto = onde a TomTom encaixa o segmento (testado em 23/11/2026). de → para = sentido do fluxo.
  { id: 'sc401', via: 'SC-401', de: 'Centro', para: 'Norte de la Isla', regiao: 'norte', ponto: [-27.5150, -48.4950] },
  { id: 'sc403', via: 'SC-403', de: 'SC-401', para: 'Ingleses', regiao: 'norte', ponto: [-27.4520, -48.4150] },
  { id: 'lagoa', via: 'SC-404', de: 'Lagoa', para: 'Itacorubi', regiao: 'leste', ponto: [-27.5930, -48.4880] },
  { id: 'riotavares', via: 'SC-406', de: 'Lagoa', para: 'Rio Tavares', regiao: 'sul', ponto: [-27.6420, -48.4900] },
  { id: 'viaexpsul', via: 'Via Expressa Sul', de: 'Aeropuerto', para: 'Centro', regiao: 'sul', ponto: [-27.6230, -48.5350] },
  { id: 'ponte', via: 'Puentes', de: 'Isla', para: 'Continente', regiao: 'centro', ponto: [-27.5965, -48.5635] },
  { id: 'beiramar', via: 'Beira-Mar Norte', de: 'Agronômica', para: 'Centro', regiao: 'centro', ponto: [-27.5830, -48.5470] },
];

const PONTOS_MAR = { norte: '-27.43,-48.39', leste: '-27.62,-48.42', sul: '-27.70,-48.48' };
const CIDADE = '-27.59,-48.55';
const GEOCODE_FLORIPA = '4205407';
const TZ = '-03:00'; // Brasil sem horário de verão desde 2019

const espera = (ms) => AbortSignal.timeout(ms);
async function json(url, ms = 9000) {
  const r = await fetch(url, { signal: espera(ms), headers: { 'user-agent': 'sc-explorer-coletor/1.0' } });
  if (!r.ok) throw new Error(`${new URL(url).host} ${r.status}`);
  return r.json();
}
const iso = (local) => local.replace(' ', 'T') + ':00' + TZ; // "2026-11-23 13:33" → ISO com fuso
const hm12 = (s) => { // "06:49 PM" → "18:49"
  const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(s || ''); if (!m) return null;
  let h = +m[1] % 12; if (m[3].toUpperCase() === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};
const r1 = (n) => Math.round(n * 10) / 10;

// Código da WeatherAPI → condição própria (traduzida no app) e ícone.
export function condicao(code, dia = 1) {
  const c = +code;
  if (c === 1000) return { cond: 'despejado', icone: dia ? 'sol' : 'lua' };
  if (c === 1003) return { cond: 'parcial', icone: dia ? 'sol-nuvem' : 'lua-nuvem' };
  if ([1006, 1009].includes(c)) return { cond: 'nublado', icone: 'nuvem' };
  if ([1030, 1135, 1147].includes(c)) return { cond: 'neblina', icone: 'nuvem' };
  if ([1087, 1273, 1276, 1279, 1282].includes(c)) return { cond: 'tormenta', icone: 'tormenta' };
  if ([1186, 1189, 1192, 1195, 1243, 1246].includes(c)) return { cond: 'chuva', icone: 'chuva' };
  if ([1063, 1150, 1153, 1180, 1183, 1240, 1072, 1168, 1171, 1198, 1201].includes(c)) return { cond: 'chuvisco', icone: 'chuva' };
  return { cond: 'nublado', icone: 'nuvem' };
}
const LUA = {
  'new moon': 'nova', 'waxing crescent': 'crescente', 'first quarter': 'quarto_crescente', 'waxing gibbous': 'gibosa_crescente',
  'full moon': 'cheia', 'waning gibbous': 'gibosa_minguante', 'last quarter': 'quarto_minguante', 'third quarter': 'quarto_minguante', 'waning crescent': 'minguante',
};

async function lerClima(E, agora) {
  const base = `https://api.weatherapi.com/v1`;
  const ontem = new Date(agora.getTime() - 864e5 - 3 * 36e5).toISOString().slice(0, 10);
  const [f, h] = await Promise.all([
    json(`${base}/forecast.json?key=${E.WEATHERAPI_KEY}&q=${CIDADE}&days=3&alerts=no&aqi=no`),
    json(`${base}/history.json?key=${E.WEATHERAPI_KEY}&q=${CIDADE}&dt=${ontem}`).catch(() => null),
  ]);
  const c = f.current, dias = f.forecast.forecastday;
  const agoraEpoch = Math.floor(agora.getTime() / 1000);
  const todasHoras = dias.flatMap((d) => d.hour);
  const prox = todasHoras.filter((x) => x.time_epoch >= agoraEpoch - 3600).slice(0, 25);
  const prox6 = prox.slice(0, 6);
  const passadas = [...(h?.forecast?.forecastday?.[0]?.hour || []), ...dias[0].hour]
    .filter((x) => x.time_epoch <= agoraEpoch && x.time_epoch > agoraEpoch - 24 * 3600);
  const hoje = dias[0].hour;
  const uvMax = Math.max(...hoje.map((x) => x.uv), dias[0].day.uv || 0);
  const forte = hoje.filter((x) => x.uv >= Math.min(8, uvMax * 0.8) && x.is_day);
  const tMax = Math.max(...hoje.map((x) => x.temp_c));
  const quente = hoje.filter((x) => x.temp_c >= tMax - 1.5);
  const hora = (x) => +x.time.slice(11, 13);
  const cc = condicao(c.condition.code, c.is_day);
  return {
    temp: Math.round(c.temp_c), sensacao: Math.round(c.feelslike_c), ...cc, dia: !!c.is_day,
    uv: r1(c.uv), vento_kmh: Math.round(c.wind_kph), vento_dir: c.wind_dir, rajada_kmh: Math.round(c.gust_kph || 0),
    umidade: c.humidity, nuvens: c.cloud,
    max: Math.round(dias[0].day.maxtemp_c), min: Math.round(dias[0].day.mintemp_c),
    uv_max_hoje: Math.round(uvMax),
    pico_uv: forte.length ? [hora(forte[0]), hora(forte[forte.length - 1]) + 1] : null,
    pico_calor: quente.length ? [hora(quente[0]), hora(quente[quente.length - 1]) + 1] : null,
    chuva_prob_6h: Math.max(0, ...prox6.map((x) => x.chance_of_rain)),
    chuva_prox_6h_mm: r1(prox6.reduce((s, x) => s + x.precip_mm, 0)),
    chuva_24h_passadas_mm: r1(passadas.reduce((s, x) => s + x.precip_mm, 0)),
    horas: prox.map((x) => ({ t: iso(x.time), temp: Math.round(x.temp_c), prob: x.chance_of_rain, mm: r1(x.precip_mm), uv: r1(x.uv), ...condicao(x.condition.code, x.is_day) })),
    dias: dias.map((d) => ({ data: d.date, max: Math.round(d.day.maxtemp_c), min: Math.round(d.day.mintemp_c), prob: d.day.daily_chance_of_rain, mm: r1(d.day.totalprecip_mm), uv: Math.round(d.day.uv), ...condicao(d.day.condition.code, 1) })),
    astro: {
      nascer: hm12(dias[0].astro.sunrise), por: hm12(dias[0].astro.sunset),
      lua: LUA[(dias[0].astro.moon_phase || '').toLowerCase()] || null, lua_ilum: +dias[0].astro.moon_illumination || 0,
      amanha: { nascer: hm12(dias[1]?.astro?.sunrise), por: hm12(dias[1]?.astro?.sunset) },
    },
  };
}

async function lerMar(E, agora) {
  const pega = (q, dias, mare) => json(`https://api.weatherapi.com/v1/marine.json?key=${E.WEATHERAPI_KEY}&q=${q}&days=${dias}${mare ? '&tides=yes' : ''}`);
  const [n, l, s] = await Promise.all([pega(PONTOS_MAR.norte, 1), pega(PONTOS_MAR.leste, 3, true), pega(PONTOS_MAR.sul, 1)]);
  const agoraEpoch = Math.floor(agora.getTime() / 1000);
  const naHora = (m) => {
    const hs = m.forecast.forecastday[0].hour;
    return hs.reduce((a, b) => (Math.abs(b.time_epoch - agoraEpoch) < Math.abs(a.time_epoch - agoraEpoch) ? b : a));
  };
  const onda = (x) => r1(Math.max(x.sig_ht_mt || 0, x.swell_ht_mt || 0));
  const reg = {};
  for (const [k, m] of Object.entries({ norte: n, leste: l, sul: s })) {
    const x = naHora(m);
    const hoje = m.forecast.forecastday[0].hour;
    reg[k] = { onda_m: onda(x), onda_max_hoje: r1(Math.max(...hoje.map(onda))), agua_c: Math.round(x.water_temp_c), swell_dir: x.swell_dir_16_point, periodo_s: Math.round(x.swell_period_secs || 0) };
  }
  const vals = Object.values(reg).map((r) => r.onda_m);
  const eventos = l.forecast.forecastday.flatMap((d) => d.day.tides?.[0]?.tide || [])
    .map((t) => ({ t: iso(t.tide_time), tipo: t.tide_type === 'HIGH' ? 'alta' : 'baixa', m: r1(+t.tide_height_mt) }));
  const dias = l.forecast.forecastday.map((d) => ({ data: d.date, onda_max: r1(Math.max(...d.hour.map(onda))) }));
  return {
    onda_m: Math.max(...vals), regioes: reg, regioes_iguais: new Set(vals).size === 1,
    agua_c: reg.leste.agua_c, mare: { eventos, fonte: 'WeatherAPI' }, dias,
  };
}

function estadoTransito(vel, livre, fechado) {
  if (fechado) return 'fechado';
  const r = livre ? vel / livre : 1;
  return r >= 0.85 ? 'livre' : r >= 0.6 ? 'moderado' : r >= 0.35 ? 'pesado' : 'parado';
}
async function lerTransito(E) {
  const leituras = await Promise.all(TRECHOS.map(async (t) => {
    try {
      const j = await json(`https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/14/json?point=${t.ponto[0]},${t.ponto[1]}&unit=KMPH&key=${E.TOMTOM_KEY}`, 8000);
      const f = j.flowSegmentData; const c = f.coordinates.coordinate;
      const km = c.reduce((s, p, i) => (i ? s + Math.hypot((p.latitude - c[i - 1].latitude) * 111.2, (p.longitude - c[i - 1].longitude) * 98.6) : 0), 0);
      const atraso = Math.max(0, f.currentTravelTime - f.freeFlowTravelTime);
      return {
        id: t.id, via: t.via, de: t.de, para: t.para, regiao: t.regiao, km: r1(km),
        vel: f.currentSpeed, vel_livre: f.freeFlowSpeed, tempo_s: f.currentTravelTime, tempo_livre_s: f.freeFlowTravelTime,
        atraso_min: Math.round(atraso / 60), estado: estadoTransito(f.currentSpeed, f.freeFlowSpeed, f.roadClosure),
        confianca: f.confidence, fechado: !!f.roadClosure,
        // traçado simplificado (até ~24 pontos) para desenhar a via no mapa do app
        linha: c.filter((_, i) => i % Math.max(1, Math.ceil(c.length / 24)) === 0 || i === c.length - 1)
          .map((p) => [Math.round(p.latitude * 1e4) / 1e4, Math.round(p.longitude * 1e4) / 1e4]),
      };
    } catch (e) { return { id: t.id, erro: String(e.message || e) }; }
  }));
  const ok = leituras.filter((x) => !x.erro);
  if (!ok.length) throw new Error('TomTom sem resposta em nenhum trecho');
  return { trechos: ok, falharam: leituras.filter((x) => x.erro).map((x) => x.id) };
}

const COR_INMET = { 'Perigo Potencial': 'amarelo', 'Perigo': 'laranja', 'Grande Perigo': 'vermelho' };
async function lerInmet(agora) {
  const a = await json('https://apiprevmet3.inmet.gov.br/avisos/ativos', 10000);
  const lista = [...(a.hoje || []), ...(a.futuro || [])].filter((x) => String(x.geocodes || '').split(',').includes(GEOCODE_FLORIPA));
  const vistos = new Set();
  return lista.map((x) => ({
    id: x.id_aviso, evento: x.descricao, nivel: COR_INMET[x.severidade] || 'amarelo',
    inicio: `${x.data_inicio.slice(0, 10)}T${x.hora_inicio === '24:00' ? '23:59' : x.hora_inicio}:00${TZ}`,
    fim: `${x.data_fim.slice(0, 10)}T${x.hora_fim === '24:00' ? '23:59' : x.hora_fim}:00${TZ}`,
  })).filter((x) => new Date(x.fim) > agora && !vistos.has(x.id) && vistos.add(x.id))
    .sort((p, q) => p.inicio.localeCompare(q.inicio));
}

// ---------- Supabase (REST com a chave secreta; só no servidor) ----------
function sb(E) {
  const url = (E.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const chave = (E.SUPABASE_SECRET_KEY || '').trim();
  if (!url || !chave) return null;
  return async (caminho, { method = 'GET', body, prefer } = {}) => {
    const r = await fetch(`${url}/rest/v1/${caminho}`, {
      method, signal: espera(8000),
      headers: { apikey: chave, 'content-type': 'application/json', 'user-agent': 'sc-explorer-coletor/1.0', ...(prefer ? { prefer } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(`supabase ${caminho.split('?')[0]} ${r.status}: ${(await r.text()).slice(0, 160)}`);
    return r.status === 204 ? null : r.json().catch(() => null);
  };
}

// Monta o estado. `anterior` (opcional) cobre as seções que falharem agora.
export async function montarEstado(E, { anterior = null, agora = new Date() } = {}) {
  const t0 = Date.now();
  const [clima, mar, transito, inmet] = await Promise.allSettled([lerClima(E, agora), lerMar(E, agora), lerTransito(E), lerInmet(agora)]);
  const falhas = {};
  const pegar = (nome, res, transformar = (v) => v) => {
    if (res.status === 'fulfilled') return { ...transformar(res.value), lido_em: agora.toISOString() };
    falhas[nome] = String(res.reason?.message || res.reason).slice(0, 200);
    return anterior?.[nome] || null;
  };
  const estado = {
    versao: 1, fonte: 'real', atualizado: agora.toISOString(),
    clima: pegar('clima', clima),
    mar: pegar('mar', mar),
    transito: pegar('transito', transito, (v) => ({ trechos: v.trechos, falharam: v.falharam })),
    avisos_inmet: inmet.status === 'fulfilled' ? inmet.value : (falhas.avisos_inmet = String(inmet.reason?.message || inmet.reason), anterior?.avisos_inmet || []),
    balneabilidade: anterior?.balneabilidade || null,
    falhas,
  };
  return { estado, ms: Date.now() - t0 };
}

// Rodada completa: lê o anterior, monta, grava estado + leituras + registro da coleta.
export async function coletar(E, { log = console.log } = {}) {
  const db = sb(E);
  let anterior = null;
  if (db) anterior = (await db('estado?id=eq.1&select=dados').catch(() => null))?.[0]?.dados || null;
  const { estado, ms } = await montarEstado(E, { anterior });
  const gravacao = { estado: false, leituras: 0 };
  if (db) {
    try {
      await db('estado', { method: 'POST', body: { id: 1, dados: estado, atualizado_em: estado.atualizado }, prefer: 'resolution=merge-duplicates,return=minimal' });
      gravacao.estado = true;
      const novas = (estado.transito?.trechos || []).filter((t) => estado.transito.lido_em === estado.atualizado)
        .map((t) => ({ trecho: t.id, lido_em: estado.atualizado, vel_kmh: t.vel, vel_livre_kmh: t.vel_livre, tempo_s: t.tempo_s, tempo_livre_s: t.tempo_livre_s, atraso_s: t.tempo_s - t.tempo_livre_s, confianca: t.confianca, fechado: t.fechado }));
      if (novas.length) { await db('leituras_transito', { method: 'POST', body: novas, prefer: 'return=minimal' }); gravacao.leituras = novas.length; }
      await db('coletas', { method: 'POST', body: { ok: !Object.keys(estado.falhas).length, duracao_ms: ms, erro: Object.keys(estado.falhas).length ? JSON.stringify(estado.falhas).slice(0, 500) : null, detalhes: gravacao }, prefer: 'return=minimal' });
      if (new Date().getUTCHours() === 7 && new Date().getUTCMinutes() < 12) {
        await db(`coletas?em=lt.${new Date(Date.now() - 30 * 864e5).toISOString()}`, { method: 'DELETE', prefer: 'return=minimal' }).catch(() => {});
      }
    } catch (e) { gravacao.erro = String(e.message || e); }
  } else gravacao.erro = 'Supabase não configurado (SUPABASE_URL/SUPABASE_SECRET_KEY)';
  log({ ms, falhas: estado.falhas, gravacao });
  return { estado, gravacao };
}
