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
