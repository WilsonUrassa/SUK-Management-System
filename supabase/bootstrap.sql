-- Secure organization bootstrap. Run after schema.sql and rbac.sql.
create or replace function public.create_organization(
  org_name text,
  org_type text,
  branch_name text default 'Main Branch',
  org_currency text default 'TZS',
  org_timezone text default 'Africa/Dar_es_Salaam'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org uuid;
  new_member uuid;
  owner_role uuid;
  module_key text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if length(trim(org_name)) < 2 then raise exception 'Organization name is required'; end if;

  insert into public.organizations(name,slug,organization_type,currency,timezone)
  values (
    trim(org_name),
    left(regexp_replace(lower(trim(org_name)),'[^a-z0-9]+','-','g'),60),
    trim(org_type), coalesce(nullif(trim(org_currency),''),'TZS'),
    coalesce(nullif(trim(org_timezone),''),'Africa/Dar_es_Salaam')
  )
  returning id into new_org;

  insert into public.organization_members(organization_id,user_id,role)
  values(new_org,auth.uid(),'owner')
  returning id into new_member;

  insert into public.roles(organization_id,name,description,is_system)
  values(new_org,'Owner','Full access to the organization',true)
  returning id into owner_role;

  insert into public.member_roles(member_id,role_id) values(new_member,owner_role);

  insert into public.profiles(id,full_name)
  values(auth.uid(),coalesce(auth.jwt()->'user_metadata'->>'full_name',''))
  on conflict(id) do update set full_name=excluded.full_name, updated_at=now();

  insert into public.branches(organization_id,name)
  values(new_org,coalesce(nullif(trim(branch_name),''),'Main Branch'));

  foreach module_key in array[
    'organizations','users','finance','hr','attendance','documents','reports','notifications'
  ] loop
    insert into public.organization_modules(organization_id,module_key) values(new_org,module_key);
  end loop;

  if org_type='School' then
    insert into public.organization_modules(organization_id,module_key) values(new_org,'school'),(new_org,'inventory');
  elsif org_type='Office / Company' then
    insert into public.organization_modules(organization_id,module_key) values(new_org,'office'),(new_org,'inventory'),(new_org,'customers');
  elsif org_type='Restaurant' then
    insert into public.organization_modules(organization_id,module_key) values(new_org,'restaurant'),(new_org,'inventory'),(new_org,'customers');
  elsif org_type='NGO / Nonprofit' then
    insert into public.organization_modules(organization_id,module_key) values(new_org,'ngo'),(new_org,'customers');
  elsif org_type='Retail / Shop' then
    insert into public.organization_modules(organization_id,module_key) values(new_org,'retail'),(new_org,'inventory'),(new_org,'customers');
  else
    insert into public.organization_modules(organization_id,module_key) values(new_org,'customers');
  end if;

  insert into public.role_permissions(role_id,permission_id)
  select owner_role,id from public.permissions
  on conflict do nothing;

  return new_org;
end;
$$;

revoke all on function public.create_organization(text,text,text,text,text) from public;
grant execute on function public.create_organization(text,text,text,text,text) to authenticated;

create or replace function public.my_organizations()
returns table(id uuid,name text,organization_type text,currency text,timezone text)
language sql security definer stable
set search_path=public
as $$
  select o.id,o.name,o.organization_type,o.currency,o.timezone
  from public.organizations o
  join public.organization_members m on m.organization_id=o.id
  where m.user_id=auth.uid() and m.is_active=true
  order by o.created_at desc;
$$;
revoke all on function public.my_organizations() from public;
grant execute on function public.my_organizations() to authenticated;
