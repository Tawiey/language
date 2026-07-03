-- PhraseDuel — Voice notes migration
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Adds an audio column per language and a public storage bucket for the notes.

-- 1. Audio columns on phrases ----------------------------------------------
alter table public.phrases
  add column if not exists shona_audio text,
  add column if not exists setswana_audio text;

-- 2. Public storage bucket for the recordings ------------------------------
insert into storage.buckets (id, name, public)
values ('phrase-audio', 'phrase-audio', true)
on conflict (id) do update set public = true;

-- 3. Open access to the bucket (matches the app's single-household model) ---
drop policy if exists "phrase-audio read"   on storage.objects;
drop policy if exists "phrase-audio insert" on storage.objects;
drop policy if exists "phrase-audio update" on storage.objects;
drop policy if exists "phrase-audio delete" on storage.objects;

create policy "phrase-audio read" on storage.objects
  for select using (bucket_id = 'phrase-audio');
create policy "phrase-audio insert" on storage.objects
  for insert with check (bucket_id = 'phrase-audio');
create policy "phrase-audio update" on storage.objects
  for update using (bucket_id = 'phrase-audio') with check (bucket_id = 'phrase-audio');
create policy "phrase-audio delete" on storage.objects
  for delete using (bucket_id = 'phrase-audio');
