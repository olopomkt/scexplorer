// Confere o dicionário: lista os textos passados a t('…') no código que ainda não têm tradução.
// Uso: node scripts/conferir-traducoes.mjs   (sai com erro se faltar algo)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const { D } = await import('../src/conteudo/textos.js');
const usados = new Set();
const varrer = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) varrer(p);
    else if (p.endsWith('.js')) {
      const s = readFileSync(p, 'utf8');
      for (const m of s.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) usados.add(m[1].replace(/\\'/g, "'"));
      for (const m of s.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) usados.add(m[1]);
    }
  }
};
varrer(raiz);
// Textos que chegam ao t() por variável (mapas de rótulos).
const EXTRAS = ['Despejado', 'Parcialmente nublado', 'Nublado', 'Neblina', 'Lluvia débil', 'Lluvia', 'Tormenta', 'Extremo', 'Muy alto', 'Alto', 'Moderado', 'Bajo',
  'Baja', 'Media', 'Alta', 'Libre', 'Lento', 'Detenido', 'Cerrado', 'Peligro potencial', 'Peligro', 'Gran peligro',
  'Nueva', 'Creciente', 'Cuarto creciente', 'Gibosa creciente', 'Llena', 'Gibosa menguante', 'Cuarto menguante', 'Menguante',
  'Mañana', 'Almuerzo', 'Tarde', 'Atardecer', 'Noche', 'Calmo', 'Agitado', 'Pleamar', 'Bajamar', 'Apta', 'No apta',
  'Centro', 'Norte de la Isla', 'Aeropuerto', 'Isla', 'Continente', 'Inicio', 'Bienvenida', 'Playa', 'Mapa de ocupación', 'Tránsito', 'Clima y mar',
  'Itinerarios', 'Día de lluvia', 'Consejos', 'Avisos', 'Explorar', 'Perfil', 'Panel principal', 'Playas', 'Mapa', 'Oscuro', 'Claro', 'Automático',
  'Bomberos y guardavidas', 'Ambulancia (SAMU)', 'Policía Militar', 'Defensa Civil', 'Flujo libre', 'Flujo moderado', 'Flujo lento',
  'Lluvia y tormentas', 'UV alto y calor', 'Tránsito en los tramos', 'Mar agitado y viento', 'cerrado', 'lento'];
EXTRAS.forEach((x) => usados.add(x));
const MESMO = new Set(['UV', 'Mar']); // iguais nos três idiomas
const falta = [...usados].filter((k) => !D[k] && !MESMO.has(k)).sort();
const sobra = Object.keys(D).filter((k) => !usados.has(k));
console.log(`${usados.size} textos usados · ${Object.keys(D).length} no dicionário · ${falta.length} sem tradução`);
if (falta.length) console.log('FALTA:\n' + falta.map((x) => `  ${JSON.stringify(x)}`).join('\n'));
if (sobra.length && process.argv.includes('--sobra')) console.log('SOBRA:\n' + sobra.join('\n'));
process.exit(falta.length ? 1 : 0);
