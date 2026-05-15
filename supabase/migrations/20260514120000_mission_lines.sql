-- Normalized storage for persisted mission analysis lines (action plan, risks, tools).
create type public.mission_line_category as enum (
  'action_plan',
  'risk',
  'tool'
);

comment on type public.mission_line_category is 'Bucket for each stored analysis line; extend via new enum value + migration.';

create table public.mission_lines (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  category public.mission_line_category not null,
  sort_order integer not null,
  line_text text not null,
  constraint mission_lines_mission_category_order_unique unique (mission_id, category, sort_order)
);

comment on table public.mission_lines is 'Per-mission analysis lines keyed by category; cascade-deleted with parent mission.';
comment on column public.mission_lines.mission_id is 'Parent mission row.';
comment on column public.mission_lines.category is 'Which column this line belonged to in the UI.';
comment on column public.mission_lines.sort_order is 'Display order within the category (0-based).';
comment on column public.mission_lines.line_text is 'Single bullet/line text as shown to the user.';

create index mission_lines_mission_id_idx on public.mission_lines (mission_id);

grant usage on type public.mission_line_category to anon,
  authenticated,
  service_role;

grant select,
insert,
update,
delete on table public.mission_lines to anon,
  authenticated,
  service_role;

alter table public.mission_lines enable row level security;

-- Open policies for local pipeline development; tighten with auth predicates later.
create policy mission_lines_select on public.mission_lines for select using (true);

create policy mission_lines_insert on public.mission_lines for insert with check (true);

create policy mission_lines_update on public.mission_lines for update using (true) with check (true);

create policy mission_lines_delete on public.mission_lines for delete using (true);
