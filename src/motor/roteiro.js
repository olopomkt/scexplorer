// Roteiro por regras (sem IA). O dia tem 5 momentos; o tempo decide o modo; cada momento pontua os
// lugares da base pelo horário, estilo, região e distância da parada anterior. Mesmos dados → mesmo roteiro.
import { PRAIAS, LUGARES, distKm } from '../conteudo/lugares.js';

export const ESTILOS = {
  clasico: { es: 'Clásico', pt: 'Clássico', en: 'Classic', tags: ['familia', 'agitado', 'gastronomico', 'romantico'] },
  tranquilo: { es: 'Tranquilo', pt: 'Tranquilo', en: 'Relaxed', tags: ['tranquilo', 'familia', 'romantico'] },
  aventura: { es: 'Aventura', pt: 'Aventura', en: 'Adventure', tags: ['aventura', 'surf'] },
  sabores: { es: 'Sabores', pt: 'Sabores', en: 'Flavors', tags: ['gastronomico', 'romantico'] },
};

const comoLugar = (p) => ({ ...p, tipo: p.tipo || 'praia', momentos: p.momentos || ['manha', 'tarde'], chuva: !!p.chuva, tags: p.tags || [] });
const TODOS = [...PRAIAS.map(comoLugar), ...LUGARES.map(comoLugar)];

// dia = { data, prob, mm, uv, max } (previsão do dia) · por = "18:49"
export function montarRoteiro({ dia, estilo = 'clasico', por = '18:50', chuvaForcada = false } = {}) {
  const chuva = chuvaForcada || (dia && (dia.prob >= 50 || dia.mm >= 5));
  const uvAlto = dia && dia.uv >= 8;
  const tags = ESTILOS[estilo]?.tags || ESTILOS.clasico.tags;
  const usados = new Set();
  const [ph, pm] = (por || '18:50').split(':').map(Number);
  const porMin = ph * 60 + pm;
  const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const momentos = chuva
    ? [['manha', 9 * 60 + 30], ['almoco', 12 * 60 + 30], ['tarde', 15 * 60], ['noite', 19 * 60 + 30]]
    : [['manha', 9 * 60], ['almoco', 12 * 60 + 30], ['tarde', 15 * 60 + 30], ['por', porMin - 40], ['noite', 20 * 60 + 30]];
  const paradas = [];
  let anterior = null;
  for (const [mom, min] of momentos) {
    let melhor = null, melhorP = -Infinity;
    for (const l of TODOS) {
      if (usados.has(l.id) || usados.has(l.nome)) continue;
      if (chuva && !l.chuva) continue;
      const serve = mom === 'manha' && l.tipo === 'praia' && !chuva ? true : l.momentos.includes(mom);
      if (!serve) continue;
      if (mom === 'almoco' && l.tipo !== 'gastronomia') continue;
      if (mom === 'por' && !(l.oeste || ['mirante', 'passeio'].includes(l.tipo))) continue;
      if (mom === 'noite' && !['gastronomia', 'passeio', 'mirante', 'compras'].includes(l.tipo)) continue;
      let p = 10;
      p += tags.filter((x) => l.tags.includes(x)).length * 6;
      if (l.tipo === 'praia') p += (l.pop || 0.5) * 8 * (estilo === 'tranquilo' ? -0.5 : 1);
      if (mom === 'tarde' && uvAlto && l.tipo === 'praia') p -= 6; // sol forte à tarde: menos praia, mais sombra
      if (mom === 'por' && l.oeste) p += 12;
      if (estilo === 'aventura' && ['aventura', 'trilha'].includes(l.tipo)) p += 10;
      if (estilo === 'sabores' && l.tipo === 'gastronomia') p += 10;
      if (anterior) p -= distKm(anterior, l) * 0.9;
      if (p > melhorP) { melhorP = p; melhor = l; }
    }
    if (!melhor) { paradas.push({ momento: mom, hora: fmt(min), vazio: true }); continue; }
    usados.add(melhor.id); usados.add(melhor.nome);
    paradas.push({ momento: mom, hora: fmt(min), lugar: melhor, km: anterior ? Math.round(distKm(anterior, melhor)) : null });
    anterior = melhor;
  }
  return { chuva, estilo, paradas };
}
