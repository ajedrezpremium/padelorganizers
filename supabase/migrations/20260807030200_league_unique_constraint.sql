-- PADELORGANIZERS.COM — constraint único para upsert de Ranked League
-- El app usa `upsert(..., { onConflict: 'league_id,player_name' })` al unirse a la liga.
-- Sin un índice único PostgREST devuelve 42P10. Se añade aquí.
alter table public.league_entries
  add constraint uq_league_entries_league_player unique (league_id, player_name);