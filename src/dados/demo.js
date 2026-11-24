// Modo demo: um dia de verão plausível montado em volta da hora atual. Só aparece quando não há
// dado real (ou com ?demo na URL) e a tela mostra "Datos de ejemplo".
import { TRECHOS_DEMO } from './trechos-demo.js';

export function estadoDemo() {
  const agora = new Date();
  const sp = new Date(agora.getTime() - 3 * 36e5); // relógio de Florianópolis
  const data = sp.toISOString().slice(0, 10);
  const h0 = sp.getUTCHours();
  const iso = (d, h, m = 0) => `${d}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00-03:00`;
  const amanha = new Date(sp.getTime() + 864e5).toISOString().slice(0, 10);
  const depois = new Date(sp.getTime() + 2 * 864e5).toISOString().slice(0, 10);
  const horas = [];
  for (let i = 0; i < 25; i++) {
    const hh = (h0 + i) % 24, d = h0 + i < 24 ? data : amanha;
    const dia = hh >= 6 && hh < 19;
    const temp = Math.round(22 + 6 * Math.sin(((hh - 9) / 24) * 2 * Math.PI));
    const prob = hh >= 17 && hh <= 20 && d === data ? 70 : 10;
    horas.push({ t: iso(d, hh), temp, prob, mm: prob > 50 ? 1.2 : 0, uv: dia ? Math.max(0, Math.round(11 * Math.sin(((hh - 6) / 13) * Math.PI))) : 0, cond: prob > 50 ? 'chuva' : dia ? 'parcial' : 'despejado', icone: prob > 50 ? 'chuva' : dia ? 'sol-nuvem' : 'lua' });
  }
  const linha = (a, b) => Array.from({ length: 8 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / 7, a[1] + ((b[1] - a[1]) * i) / 7]);
  const trechos = TRECHOS_DEMO.map((t) => ({ ...t, linha: linha(t.a, t.b), a: undefined, b: undefined }));
  return {
    versao: 1, fonte: 'demo', atualizado: agora.toISOString(),
    clima: {
      temp: 27, sensacao: 29, cond: 'parcial', icone: h0 >= 6 && h0 < 19 ? 'sol-nuvem' : 'lua-nuvem', dia: h0 >= 6 && h0 < 19,
      uv: 7, vento_kmh: 16, vento_dir: 'NE', rajada_kmh: 28, umidade: 72, nuvens: 40, max: 29, min: 21,
      uv_max_hoje: 11, pico_uv: [11, 15], pico_calor: [13, 16], chuva_prob_6h: 70, chuva_prox_6h_mm: 3.5, chuva_24h_passadas_mm: 0,
      horas, lido_em: agora.toISOString(),
      dias: [
        { data, max: 29, min: 21, prob: 70, mm: 4, uv: 11, cond: 'parcial', icone: 'sol-nuvem' },
        { data: amanha, max: 30, min: 22, prob: 10, mm: 0, uv: 11, cond: 'despejado', icone: 'sol' },
        { data: depois, max: 24, min: 20, prob: 80, mm: 12, uv: 6, cond: 'chuva', icone: 'chuva' },
      ],
      astro: { nascer: '05:13', por: '18:50', lua: 'gibosa_crescente', lua_ilum: 90, amanha: { nascer: '05:12', por: '18:51' } },
    },
    mar: {
      onda_m: 1.2, regioes_iguais: false, agua_c: 21, lido_em: agora.toISOString(),
      regioes: { norte: { onda_m: 0.6, agua_c: 22 }, leste: { onda_m: 1.2, agua_c: 21 }, sul: { onda_m: 1.6, agua_c: 20 } },
      mare: { fonte: 'demo', eventos: [
        { t: iso(data, 4, 12), tipo: 'alta', m: 0.8 }, { t: iso(data, 10, 25), tipo: 'baixa', m: 0.2 },
        { t: iso(data, 16, 37), tipo: 'alta', m: 0.8 }, { t: iso(data, 22, 50), tipo: 'baixa', m: 0.3 },
        { t: iso(amanha, 5, 0), tipo: 'alta', m: 0.8 }, { t: iso(amanha, 11, 10), tipo: 'baixa', m: 0.2 },
      ] },
      dias: [{ data, onda_max: 1.3 }, { data: amanha, onda_max: 1.1 }, { data: depois, onda_max: 1.8 }],
    },
    transito: { lido_em: agora.toISOString(), trechos },
    avisos_inmet: [], balneabilidade: null, falhas: {},
  };
}
