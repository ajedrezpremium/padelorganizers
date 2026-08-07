-- PADELORGANIZERS.COM — corrección policies Ranked League
-- Añade INSERT en `leagues` (faltaba) para que el app pueda crear la liga de la temporada.
create policy "leagues_insert" on public.leagues for insert with check (true);