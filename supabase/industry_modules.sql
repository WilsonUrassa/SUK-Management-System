-- First operational industry schemas.
create table if not exists public.school_students (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 person_id uuid references public.people(id) on delete set null, admission_no text not null, class_name text, guardian_name text,
 enrollment_date date default current_date, status text not null default 'active', created_at timestamptz not null default now(),
 unique(organization_id,admission_no)
);
create table if not exists public.restaurant_menu_items (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, category text, price numeric(14,2) not null default 0, is_available boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.office_tasks (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 title text not null, description text, status text not null default 'todo', priority text not null default 'normal',
 due_date date, assigned_to uuid references public.people(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.ngo_programs (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, description text, objective text, location text, start_date date, end_date date,
 status text not null default 'planned', created_at timestamptz not null default now()
);
create table if not exists public.retail_sales (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 branch_id uuid references public.branches(id) on delete set null, customer_id uuid references public.people(id) on delete set null,
 total_amount numeric(14,2) not null default 0, payment_method text, sale_date timestamptz not null default now()
);
create index if not exists school_students_org_idx on public.school_students(organization_id);
create index if not exists restaurant_menu_org_idx on public.restaurant_menu_items(organization_id);
create index if not exists office_tasks_org_idx on public.office_tasks(organization_id);
create index if not exists ngo_programs_org_idx on public.ngo_programs(organization_id);
create index if not exists retail_sales_org_idx on public.retail_sales(organization_id);
alter table public.school_students enable row level security;
alter table public.restaurant_menu_items enable row level security;
alter table public.office_tasks enable row level security;
alter table public.ngo_programs enable row level security;
alter table public.retail_sales enable row level security;
create policy "members view school students" on public.school_students for select using(public.is_org_member(organization_id));
create policy "members manage school students" on public.school_students for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members view restaurant menu" on public.restaurant_menu_items for select using(public.is_org_member(organization_id));
create policy "members manage restaurant menu" on public.restaurant_menu_items for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members view office tasks" on public.office_tasks for select using(public.is_org_member(organization_id));
create policy "members manage office tasks" on public.office_tasks for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members view ngo programs" on public.ngo_programs for select using(public.is_org_member(organization_id));
create policy "members manage ngo programs" on public.ngo_programs for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members view retail sales" on public.retail_sales for select using(public.is_org_member(organization_id));
create policy "members manage retail sales" on public.retail_sales for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
