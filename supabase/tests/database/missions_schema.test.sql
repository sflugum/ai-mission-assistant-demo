create extension if not exists pgtap with schema extensions;

begin;

select plan(1);

select ok(
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'missions'
  ),
  'public.missions exists (apply migrations with supabase db reset or migration up)'
);

select * from finish();

rollback;
