// Motor de dicas por regras (sem IA): gatilho ativo > dica de sempre; prioridade 1 > 5;
// dica já vista nas últimas 24 h neste aparelho perde pontos. Só 'confirmada' entra (NO_AR).
import { NO_AR } from '../conteudo/dicas.js';
import { prefs } from '../prefs.js';
import { variaveis } from './variaveis.js';

const preencher = (s, vars) => (s || '').replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));

export function dicasDoMomento(estado, { limite = 99, regiao = null } = {}) {
  const v = variaveis(estado, prefs.idioma);
  const l = prefs.idioma;
  const lista = [];
  for (const d of NO_AR) {
    if (d.regiao && regiao && d.regiao !== regiao) continue;
    let ativa = false;
    if (d.quando) { try { ativa = !!d.quando(v); } catch { ativa = false; } if (!ativa) continue; }
    let pontos = (ativa ? 100 : 0) + (6 - d.prio) * 10;
    if (prefs.vistas[d.id] && Date.now() - prefs.vistas[d.id] < 864e5) pontos -= 25;
    lista.push({
      id: d.id, cat: d.cat, prio: d.prio, ativa, aviso: d.aviso && ativa, fonte: d.fonte, pontos,
      titulo: preencher(d.titulo?.[l] || d.titulo?.es || '', v.txt),
      texto: preencher(d[l] || d.es, v.txt),
    });
  }
  return lista.sort((a, b) => b.pontos - a.pontos).slice(0, limite);
}
