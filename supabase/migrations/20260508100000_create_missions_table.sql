-- Public enum for mission workflow; extend values as the product evolves.
create type public.mission_status as enum (
  'draft',
  'active',
  'paused',
  'completed',
  'cancelled'
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  status public.mission_status not null default 'draft'
);

comment on table public.missions is 'Mission records for the assistant pipeline (no user linkage yet).';

-- PostgREST / API access (adjust when authentication is wired up).
grant select,
insert,
update,
delete on table public.missions to anon,
authenticated,
service_role;

alter table public.missions enable row level security;

-- Open policies for local pipeline development; tighten with auth predicates later.
create policy missions_select on public.missions for select using (true);

create policy missions_insert on public.missions for insert with check (true);

create policy missions_update on public.missions for update using (true) with check (true);

create policy missions_delete on public.missions for delete using (true);
