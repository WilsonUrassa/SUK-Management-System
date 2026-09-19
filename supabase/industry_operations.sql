-- Professional operational schemas for industry modules.
create table if not exists public.school_classes (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, academic_year text, teacher_name text, capacity integer, created_at timestamptz not null default now(),
 unique(organization_id,name,academic_year)
);
create table if not exists public.restaurant_tables (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 name text not null, seats integer not null default 2, status text not null default 'available', created_at timestamptz not null default now()
);
create table if not exists public.restaurant_orders (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 table_id uuid references public.restaurant_tables(id) on delete set null, customer_id uuid references public.people(id) on delete set null,
 status text not null default 'open', total_amount numeric(14,2) not null default 0, payment_method text, ordered_at timestamptz not null default now()
);
create table if not exists public.hotel_rooms (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 room_number text not null, room_type text, rate numeric(14,2) not null default 0, status text not null default 'available', created_at timestamptz not null default now(),
 unique(organization_id,room_number)
);
create table if not exists public.hotel_bookings (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 room_id uuid references public.hotel_rooms(id) on delete set null, guest_id uuid references public.people(id) on delete set null,
 check_in date not null, check_out date not null, status text not null default 'reserved', total_amount numeric(14,2) not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.clinic_appointments (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 patient_id uuid references public.people(id) on delete set null, provider_name text, appointment_at timestamptz not null,
 status text not null default 'scheduled', notes text, created_at timestamptz not null default now()
);
create table if not exists public.warehouse_movements (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 branch_id uuid references public.branches(id) on delete set null, item_id uuid references public.inventory_items(id) on delete cascade,
 movement_type text not null, quantity numeric(14,2) not null default 0, reference text, movement_at timestamptz not null default now()
);
create table if not exists public.service_jobs (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade,
 client_id uuid references public.people(id) on delete set null, title text not null, description text, status text not null default 'open',
 scheduled_at timestamptz, amount numeric(14,2) not null default 0, created_at timestamptz not null default now()
);
create index if not exists school_classes_org_idx on public.school_classes(organization_id);
create index if not exists restaurant_tables_org_idx on public.restaurant_tables(organization_id);
create index if not exists restaurant_orders_org_idx on public.restaurant_orders(organization_id);
create index if not exists hotel_rooms_org_idx on public.hotel_rooms(organization_id);
create index if not exists hotel_bookings_org_idx on public.hotel_bookings(organization_id);
create index if not exists clinic_appointments_org_idx on public.clinic_appointments(organization_id);
create index if not exists warehouse_movements_org_idx on public.warehouse_movements(organization_id);
create index if not exists service_jobs_org_idx on public.service_jobs(organization_id);
alter table public.school_classes enable row level security;
alter table public.restaurant_tables enable row level security;
alter table public.restaurant_orders enable row level security;
alter table public.hotel_rooms enable row level security;
alter table public.hotel_bookings enable row level security;
alter table public.clinic_appointments enable row level security;
alter table public.warehouse_movements enable row level security;
alter table public.service_jobs enable row level security;
create policy "members manage school classes" on public.school_classes for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members manage restaurant tables" on public.restaurant_tables for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members manage restaurant orders" on public.restaurant_orders for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members manage hotel rooms" on public.hotel_rooms for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members manage hotel bookings" on public.hotel_bookings for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members manage clinic appointments" on public.clinic_appointments for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members manage warehouse movements" on public.warehouse_movements for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
create policy "members manage service jobs" on public.service_jobs for all using(public.is_org_member(organization_id)) with check(public.is_org_member(organization_id));
