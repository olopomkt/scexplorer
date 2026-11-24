// Roda o coletor neste computador (npm run coletar), com as chaves do .env.
// Grava no Supabase (se as tabelas existirem) e também em public/dev-estado.json, que o app usa
// em modo de desenvolvimento quando o banco ainda não responde. Esse arquivo não vai para o GitHub.
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { coletar } from '../netlify/lib/coletor.mjs';

const { estado, gravacao } = await coletar(process.env, { log: () => {} });
const destino = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'dev-estado.json');
await writeFile(destino, JSON.stringify(estado, null, 1));
const c = estado.clima, m = estado.mar;
console.log(`clima: ${c?.temp}° ${c?.cond} · UV máx ${c?.uv_max_hoje} · chuva 6h ${c?.chuva_prob_6h}% · sol ${c?.astro?.nascer}–${c?.astro?.por} · lua ${c?.astro?.lua}`);
console.log(`mar: onda ${m?.onda_m} m · água ${m?.agua_c}° · marés ${m?.mare?.eventos?.length} · regiões iguais: ${m?.regioes_iguais}`);
console.log(`trânsito: ${(estado.transito?.trechos || []).map((t) => `${t.id} ${t.estado}${t.atraso_min ? ` +${t.atraso_min}` : ''}`).join(' · ')}`);
console.log(`INMET: ${estado.avisos_inmet.map((a) => `${a.evento} (${a.nivel})`).join(' · ') || 'nenhum'}`);
console.log('falhas:', JSON.stringify(estado.falhas), '· banco:', JSON.stringify(gravacao));
