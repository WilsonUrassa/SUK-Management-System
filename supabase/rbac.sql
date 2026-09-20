-- SUK Management System: foundation RBAC + tenant bootstrap
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique(organization_id,name)
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key(role_id,permission_id)
);

create table if not exists public.member_roles (
  member_id uuid not null references public.organization_members(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key(member_id,role_id)
);

alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.member_roles enable row level security;

create or replace function public.has_org_role(org_id uuid, role_name text)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(
    select 1
    from public.organization_members m
    join public.member_roles mr on mr.member_id=m.id
    join public.roles r on r.id=mr.role_id
    where m.organization_id=org_id
      and m.user_id=auth.uid()
      and m.is_active=true
      and r.name=role_name
  );
$$;

create policy "members can view roles" on public.roles
for select using (public.is_org_member(organization_id));

create policy "authenticated users can view permissions" on public.permissions
for select using (auth.uid() is not null);

create policy "members can view role permissions" on public.role_permissions
for select using (
  exists(
    select 1 from public.roles r
    where r.id=role_id and public.is_org_member(r.organization_id)
  )
);

create policy "members can view member roles" on public.member_roles
for select using (
  exists(
    select 1
    from public.organization_members m
    where m.id=member_id and public.is_org_member(m.organization_id)
  )
);

insert into public.permissions(key,description) values
('organization.view','View organization'),
('organization.manage','Manage organization settings'),
('users.view','View users'),
('users.manage','Manage users and roles'),
('finance.view','View finance records'),
('finance.manage','Manage finance records'),
('inventory.view','View inventory'),
('inventory.manage','Manage inventory'),
('reports.view','View reports'),
('reports.export','Export reports')
on conflict(key) do nothing;

create index if not exists roles_org_idx on public.roles(organization_id);
create index if not exists role_permissions_permission_idx on public.role_permissions(permission_id);


create or replace function public.has_org_permission(org_id uuid, permission_key text)
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists(
    select 1
    from public.organization_members m
    join public.member_roles mr on mr.member_id=m.id
    join public.role_permissions rp on rp.role_id=mr.role_id
    join public.permissions p on p.id=rp.permission_id
    where m.organization_id=org_id
      and m.user_id=auth.uid()
      and m.is_active=true
      and p.key=permission_key
  )
  or public.has_org_role(org_id,'Owner');
$$;

revoke all on function public.has_org_permission(uuid,text) from public;
grant execute on function public.has_org_permission(uuid,text) to authenticated;

insert into public.permissions(key,description) values
('operations.view','View industry operations'),
('operations.manage','Manage industry operations'),
('branches.view','View branches'),
('branches.manage','Manage branches'),
('audit.view','View audit history'),
('people.view','View people records'),
('people.manage','Manage people records')
on conflict(key) do nothing;
