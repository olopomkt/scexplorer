// Aplica as migrations de supabase/migrations em ordem, cada uma numa transação.
// Uso: npm run migrar            (aplica as que faltam)
//      npm run migrar -- --seco  (mostra o que aplicaria e desfaz)
// Lê DATABASE_URL do .env. Se a conexão direta (IPv6) falhar, troque pela do pooler (porta 5432).
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const seco = process.argv.includes('--seco');
const pasta = join(dirname(fileURLToPath(import.meta.url)), '..', 'supabase', 'migrations');
const url = (process.env.DATABASE_URL || '').trim();
if (!url) { console.error('DATABASE_URL vazia no .env'); process.exit(1); }

const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
await c.connect();
await c.query('create table if not exists public._migrations (nome text primary key, aplicada_em timestamptz not null default now())');
await c.query('alter table public._migrations enable row level security');
const feitas = new Set((await c.query('select nome from public._migrations')).rows.map((r) => r.nome));
const arquivos = (await readdir(pasta)).filter((f) => f.endsWith('.sql')).sort();
let n = 0;
for (const f of arquivos) {
  if (feitas.has(f)) continue;
  const sql = await readFile(join(pasta, f), 'utf8');
  await c.query('begin');
  try {
    await c.query(sql);
    await c.query('insert into public._migrations (nome) values ($1)', [f]);
    await c.query(seco ? 'rollback' : 'commit');
    console.log(seco ? `[seco] ok, desfeita: ${f}` : `aplicada: ${f}`);
    n++;
  } catch (e) {
    await c.query('rollback');
    console.error(`FALHOU ${f}: ${e.message}`);
    await c.end();
    process.exit(1);
  }
}
if (n && !seco) await c.query("notify pgrst, 'reload schema'");
console.log(n ? `${n} migration(s) ${seco ? 'testada(s)' : 'aplicada(s)'}.` : 'Nada a aplicar.');
await c.end();
