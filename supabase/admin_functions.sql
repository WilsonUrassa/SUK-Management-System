-- Organization administration RPCs.
create or replace function public.organization_members_with_roles(org_id uuid)
returns table(member_id uuid,user_id uuid,full_name text,role_name text,is_active boolean)
language sql security definer stable set search_path=public
as $$
 select m.id,m.user_id,coalesce(p.full_name,'User'),coalesce(r.name,m.role),m.is_active
 from public.organization_members m
 left join public.profiles p on p.id=m.user_id
 left join public.member_roles mr on mr.member_id=m.id
 left join public.roles r on r.id=mr.role_id
 where m.organization_id=org_id and public.is_org_member(org_id)
 order by p.full_name;
$$;
revoke all on function public.organization_members_with_roles(uuid) from public;
grant execute on function public.organization_members_with_roles(uuid) to authenticated;

create or replace function public.create_role(org_id uuid, role_name text, role_description text default null)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare rid uuid;
begin
 if not public.has_org_role(org_id,'Owner') then raise exception 'Owner access required'; end if;
 if length(trim(role_name))<2 then raise exception 'Role name is required'; end if;
 insert into public.roles(organization_id,name,description) values(org_id,trim(role_name),role_description) returning id into rid;
 return rid;
end;
$$;
revoke all on function public.create_role(uuid,text,text) from public;
grant execute on function public.create_role(uuid,text,text) to authenticated;

create or replace function public.assign_role(org_id uuid, member_uuid uuid, role_uuid uuid)
returns void
language plpgsql security definer set search_path=public
as $$
begin
 if not public.has_org_role(org_id,'Owner') then raise exception 'Owner access required'; end if;
 if not exists(select 1 from public.organization_members where id=member_uuid and organization_id=org_id) then raise exception 'Member does not belong to organization'; end if;
 if not exists(select 1 from public.roles where id=role_uuid and organization_id=org_id) then raise exception 'Role does not belong to organization'; end if;
 insert into public.member_roles(member_id,role_id) values(member_uuid,role_uuid) on conflict do nothing;
end;
$$;
revoke all on function public.assign_role(uuid,uuid,uuid) from public;
grant execute on function public.assign_role(uuid,uuid,uuid) to authenticated;

create or replace function public.update_organization(org_id uuid, new_name text, new_currency text, new_timezone text)
returns void
language plpgsql security definer set search_path=public
as $$
begin
 if not public.has_org_role(org_id,'Owner') then raise exception 'Owner access required'; end if;
 update public.organizations
 set name=trim(new_name),currency=coalesce(nullif(trim(new_currency),''),currency),timezone=coalesce(nullif(trim(new_timezone),''),timezone),updated_at=now()
 where id=org_id;
end;
$$;
revoke all on function public.update_organization(uuid,text,text,text) from public;
grant execute on function public.update_organization(uuid,text,text,text) to authenticated;


create or replace function public.create_branch(
  org_id uuid,
  branch_name text,
  branch_code text default null,
  branch_address text default null,
  branch_phone text default null,
  branch_email text default null
)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare bid uuid;
begin
  if not public.has_org_role(org_id,'Owner') then raise exception 'Owner access required'; end if;
  if length(trim(branch_name)) < 2 then raise exception 'Branch name is required'; end if;
  insert into public.branches(organization_id,name,code,address,phone,email)
  values(
    org_id,trim(branch_name),nullif(trim(branch_code),''),
    nullif(trim(branch_address),''),nullif(trim(branch_phone),''),
    nullif(trim(branch_email),'')
  )
  returning id into bid;
  return bid;
end;
$$;
revoke all on function public.create_branch(uuid,text,text,text,text,text) from public;
grant execute on function public.create_branch(uuid,text,text,text,text,text) to authenticated;

create or replace function public.set_branch_status(org_id uuid, branch_uuid uuid, active boolean)
returns void
language plpgsql security definer set search_path=public
as $$
begin
  if not public.has_org_role(org_id,'Owner') then raise exception 'Owner access required'; end if;
  update public.branches set is_active=active where id=branch_uuid and organization_id=org_id;
  if not found then raise exception 'Branch does not belong to organization'; end if;
end;
$$;
revoke all on function public.set_branch_status(uuid,uuid,boolean) from public;
grant execute on function public.set_branch_status(uuid,uuid,boolean) to authenticated;


create or replace function public.write_audit_log(
  org_id uuid,
  action_name text,
  entity_name text default null,
  entity_uuid uuid default null,
  details jsonb default '{}'::jsonb
)
returns uuid
language plpgsql security definer set search_path=public
as $$
declare audit_id uuid;
begin
  if auth.uid() is null or not public.is_org_member(org_id) then
    raise exception 'Organization access denied';
  end if;
  if length(trim(action_name)) < 2 then raise exception 'Audit action is required'; end if;
  insert into public.audit_logs(organization_id,user_id,action,entity_type,entity_id,metadata)
  values(org_id,auth.uid(),trim(action_name),nullif(trim(entity_name),''),entity_uuid,coalesce(details,'{}'::jsonb))
  returning id into audit_id;
  return audit_id;
end;
$$;
revoke all on function public.write_audit_log(uuid,text,text,uuid,jsonb) from public;
grant execute on function public.write_audit_log(uuid,text,text,uuid,jsonb) to authenticated;


create or replace function public.organization_audit_logs(org_id uuid, result_limit integer default 100)
returns table(id uuid, action text, entity_type text, entity_id uuid, metadata jsonb, created_at timestamptz)
language sql security definer stable set search_path=public
as $$
  select a.id,a.action,a.entity_type,a.entity_id,a.metadata,a.created_at
  from public.audit_logs a
  where a.organization_id=org_id and public.has_org_permission(org_id,'audit.view')
  order by a.created_at desc
  limit greatest(1,least(coalesce(result_limit,100),500));
$$;
revoke all on function public.organization_audit_logs(uuid,integer) from public;
grant execute on function public.organization_audit_logs(uuid,integer) to authenticated;
