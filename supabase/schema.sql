create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organization_type text not null,
  currency text not null default 'TZS',
  timezone text not null default 'Africa/Dar_es_Salaam',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  address text,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(organization_id, name)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(organization_id,user_id)
);

create table if not exists public.organization_modules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  module_key text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique(organization_id,module_key)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_modules enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_org_member(org_id uuid)
returns boolean language sql security definer stable set search_path = public
as $$ select exists(select 1 from public.organization_members m where m.organization_id=org_id and m.user_id=auth.uid() and m.is_active=true); $$;

create policy "members can view organizations" on public.organizations for select using (public.is_org_member(id));
create policy "members can view branches" on public.branches for select using (public.is_org_member(organization_id));
create policy "members can view modules" on public.organization_modules for select using (public.is_org_member(organization_id));
create policy "members can view audit logs" on public.audit_logs for select using (public.is_org_member(organization_id));
create policy "users can view own profile" on public.profiles for select using (id=auth.uid());
create policy "users can update own profile" on public.profiles for update using (id=auth.uid());

create index if not exists organization_members_user_idx on public.organization_members(user_id);
create index if not exists branches_org_idx on public.branches(organization_id);
create index if not exists modules_org_idx on public.organization_modules(organization_id);
create index if not exists audit_org_idx on public.audit_logs(organization_id);
