// Lotação ESTIMADA das praias (fórmula inicial, sem medição; a calibrar com a observação do dono).
// Curva típica de praia por hora × fim de semana × temporada × tempo naquela hora × trânsito da região
// × popularidade da praia. Resultado 0–100 → baixa (<40), média (<70), alta.
import { PRAIAS } from '../conteudo/lugares.js';
import { partesSP } from '../i18n.js';

const CURVA = { 7: 5, 8: 12, 9: 24, 10: 42, 11: 60, 12: 70, 13: 76, 14: 82, 15: 85, 16: 80, 17: 66, 18: 45, 19: 22, 20: 8 };
const TEMPORADA = { 12: 1, 1: 1.05, 2: 1, 3: 0.75, 11: 0.7, 4: 0.45, 10: 0.45 };
// Feriados nacionais e da temporada que lotam as praias (lista fixa; revisar a cada ano).
const FERIADOS = ['2026-12-25', '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-23'];

export const nivel = (p) => (p < 40 ? 'baixa' : p < 70 ? 'media' : 'alta');

function fatorTempo(hx) {
  if (!hx) return 1;
  let f = 1;
  if (hx.prob >= 60 || hx.mm >= 1) f *= 0.35;
  else if (hx.prob >= 40) f *= 0.7;
  if (['nublado', 'neblina'].includes(hx.cond)) f *= 0.75;
  if (hx.temp < 21) f *= 0.55; else if (hx.temp < 24) f *= 0.8; else if (hx.temp >= 29) f *= 1.08;
  return f;
}

// Horas de hoje com a previsão de cada uma (para a curva da tela de detalhe).
function previsaoDaHora(estado, data, h) {
  return (estado?.clima?.horas || []).find((x) => x.t.slice(0, 10) === data && +x.t.slice(11, 13) === h);
}

function fatorTransito(estado, regiao) {
  const tr = (estado?.transito?.trechos || []).filter((x) => x.regiao === regiao);
  if (!tr.length) return 1;
  const pesado = tr.some((x) => ['pesado', 'parado'].includes(x.estado));
  const moderado = tr.some((x) => x.estado === 'moderado');
  return pesado ? 1.12 : moderado ? 1.05 : 1;
}

export function estimar(estado, praia, h = partesSP().h) {
  const p = partesSP();
  const base = CURVA[h] ?? 0;
  if (!base) return 0;
  const fimDeSemana = p.dow === 0 || p.dow === 6 || FERIADOS.includes(p.data);
  // previsão daquela hora; para a hora atual, na falta dela, a hora mais próxima da previsão + o tempo de agora
  const hx = previsaoDaHora(estado, p.data, h) || (h === p.h && estado?.clima ? { ...(estado.clima.horas?.[0] || { prob: 0, mm: 0 }), cond: estado.clima.cond, temp: estado.clima.temp ?? 25 } : null);
  const v = base * (fimDeSemana ? 1.15 : 0.85) * (TEMPORADA[p.mes] ?? 0.35) * fatorTempo(hx) * (h === p.h ? fatorTransito(estado, praia.regiao) : 1) * praia.pop;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function lotacaoAgora(estado) {
  return PRAIAS.map((pr) => { const v = estimar(estado, pr); return { ...pr, valor: v, nivel: nivel(v) }; });
}

// Curva de 8h a 20h de hoje para uma praia.
export function curvaDoDia(estado, praia) {
  const out = [];
  for (let h = 8; h <= 20; h++) out.push({ h, v: estimar(estado, praia, h) });
  return out;
}

export function nivelRegiao(estado, regiao) {
  const lista = lotacaoAgora(estado).filter((x) => x.regiao === regiao);
  const media = lista.reduce((s, x) => s + x.valor, 0) / (lista.length || 1);
  // a região vale o que valem as praias mais cheias dela
  const top = lista.sort((a, b) => b.valor - a.valor).slice(0, 3);
  const v = Math.round((media + top.reduce((s, x) => s + x.valor, 0) / (top.length || 1)) / 2);
  return { valor: v, nivel: nivel(v) };
}
