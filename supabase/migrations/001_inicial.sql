-- SC Explorer · 001 · estrutura inicial (2026-11-23)
-- estado: 1 linha com o último retrato (clima, mar, maré, trânsito, avisos). O app lê só esta tabela.
-- leituras_transito: histórico da TomTom, base das dicas que "aprendem" (média por trecho, hora e dia).
-- coletas: registro de cada rodada do coletor (para saber se parou).

create table if not exists public.estado (
  id smallint primary key default 1 check (id = 1),
  dados jsonb not null,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.leituras_transito (
  id bigserial primary key,
  trecho text not null,
  lido_em timestamptz not null default now(),
  vel_kmh integer,
  vel_livre_kmh integer,
  tempo_s integer,
  tempo_livre_s integer,
  atraso_s integer,
  confianca numeric(4,3),
  fechado boolean not null default false
);
create index if not exists leituras_transito_trecho_lido on public.leituras_transito (trecho, lido_em desc);

create table if not exists public.coletas (
  id bigserial primary key,
  em timestamptz not null default now(),
  ok boolean not null,
  duracao_ms integer,
  erro text,
  detalhes jsonb
);
create index if not exists coletas_em on public.coletas (em desc);

-- RLS: o público (chave publishable) só LÊ o estado. O resto só a chave secreta do coletor acessa.
alter table public.estado enable row level security;
alter table public.leituras_transito enable row level security;
alter table public.coletas enable row level security;

drop policy if exists "estado: leitura pública" on public.estado;
create policy "estado: leitura pública" on public.estado for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.estado from anon, authenticated;
revoke all on public.leituras_transito, public.coletas from anon, authenticated;
revoke all on sequence public.leituras_transito_id_seq, public.coletas_id_seq from anon, authenticated;
