-- PhraseDuel — Supabase schema + seed
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).

-- 1. Tables -----------------------------------------------------------------

create table if not exists public.household (
  id           text primary key default 'main',
  passcode     text not null default '1234',
  p1_name      text not null default 'Player 1',
  p1_lang      text not null default 'Shona',
  p2_name      text not null default 'Player 2',
  p2_lang      text not null default 'Setswana',
  p1_score     integer not null default 0,
  p2_score     integer not null default 0,
  jar_count    integer not null default 0,
  streak       integer not null default 0,
  last_active  date
);

create table if not exists public.phrases (
  id          uuid primary key default gen_random_uuid(),
  english     text not null,
  shona       text not null default '',
  setswana    text not null default '',
  created_at  timestamptz not null default now()
);

-- 2. Open access (single shared household, no per-user auth) -----------------
-- The UI gates on a shared passcode; the anon key is safe to ship publicly.

alter table public.household enable row level security;
alter table public.phrases   enable row level security;

drop policy if exists "open household" on public.household;
drop policy if exists "open phrases"   on public.phrases;

create policy "open household" on public.household
  for all using (true) with check (true);
create policy "open phrases" on public.phrases
  for all using (true) with check (true);

-- 3. Realtime ---------------------------------------------------------------

alter publication supabase_realtime add table public.household;
alter publication supabase_realtime add table public.phrases;

-- 4. Seed the household (change the passcode to whatever you like!) ----------

insert into public.household (id, passcode, p1_name, p1_lang, p2_name, p2_lang)
values ('main', '1234', 'Me', 'Setswana', 'My love', 'Shona')
on conflict (id) do nothing;

-- 5. Seed starter phrases ---------------------------------------------------

insert into public.phrases (english) values
  ('Good morning'),
  ('Have you eaten?'),
  ('I''m tired'),
  ('Where are you?'),
  ('I love you'),
  ('Let''s go'),
  ('How was your day?'),
  ('I''m on my way')
on conflict do nothing;
