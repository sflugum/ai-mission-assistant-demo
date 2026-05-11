-- Track last modification time for mission list ordering and UI.
alter table public.missions
  add column if not exists updated_at timestamptz not null default now();

update public.missions
set updated_at = created_at;

create or replace function public.set_missions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists missions_set_updated_at on public.missions;

create trigger missions_set_updated_at
  before update on public.missions
  for each row
  execute function public.set_missions_updated_at();
