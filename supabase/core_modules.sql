-- Core management data model. Run after schema.sql and rbac.sql.
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  person_type text not null default 'contact',
  full_name text not null,
  email text,
  phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  transaction_type text not null check (transaction_type in ('income','expense')),
  category text not null,
  description text,
  amount numeric(14,2) not null check (amount >= 0),
  transaction_date date not null default current_date,
  reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  sku text,
  name text not null,
  category text,
  unit text not null default 'piece',
  quantity numeric(14,3) not null default 0,
  reorder_level numeric(14,3) not null default 0,
  unit_cost numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists people_org_idx on public.people(organization_id);
create index if not exists finance_org_date_idx on public.finance_transactions(organization_id,transaction_date);
create index if not exists inventory_org_idx on public.inventory_items(organization_id);

alter table public.people enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.inventory_items enable row level security;

create policy "members can view people" on public.people for select using (public.is_org_member(organization_id));
create policy "members can add people" on public.people for insert with check (public.is_org_member(organization_id));
create policy "members can update people" on public.people for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "members can view finance" on public.finance_transactions for select using (public.is_org_member(organization_id));
create policy "members can add finance" on public.finance_transactions for insert with check (public.is_org_member(organization_id));
create policy "members can update finance" on public.finance_transactions for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "members can view inventory" on public.inventory_items for select using (public.is_org_member(organization_id));
create policy "members can add inventory" on public.inventory_items for insert with check (public.is_org_member(organization_id));
create policy "members can update inventory" on public.inventory_items for update using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
