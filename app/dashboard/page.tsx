import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

const cards = [
  ["People","Users, employees, students and other members.","/people"],
  ["Finance","Income, expenses, invoices, payments and budgets.","/finance"],
  ["Inventory","Products, stock, warehouses and suppliers.","/inventory"],
  ["Operations","Industry-specific workflows for your organization.","/operations"],
  ["Reports","Management reports, exports and analytics.","/reports"],
  ["Settings","Organization, branches, roles and modules.","/settings"]
];

export default async function Dashboard({searchParams}:{searchParams:Promise<{org?:string}>}) {
  const params=await searchParams;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:700,margin:"0 auto"}}><div className="card"><h1 className="title">Sign in required</h1><p className="subtitle">Please sign in to access your workspace.</p><Link className="button" href="/login">Sign in</Link></div></main>;

  const {data:orgs}=await supabase.rpc("my_organizations");
  const selected=orgs?.find((o:{id:string})=>o.id===params.org) ?? orgs?.[0];

  if(!selected) return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:700,margin:"0 auto"}}><div className="card"><div className="eyebrow">Workspace</div><h1 className="title">Create your organization</h1><p className="subtitle">You do not have an organization yet. Create one to start managing your operations.</p><Link className="button" href="/onboarding">Create organization</Link></div></main>;

  const {data:branches}=await supabase.from("branches").select("id,name").eq("organization_id",selected.id).eq("is_active",true);
  const {data:modules}=await supabase.from("organization_modules").select("module_key").eq("organization_id",selected.id).eq("enabled",true);

  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:1180,margin:"0 auto"}}>
    <div className="topbar"><div><div className="eyebrow">Workspace</div><h1 className="title">{selected.name}</h1><div className="subtitle">{selected.organization_type} • {selected.currency} • {selected.timezone}</div></div><div style={{display:"flex",gap:8}}><Link className="button secondary" href="/onboarding">New organization</Link><form action="/auth/signout" method="post"><button className="button secondary" type="submit">Sign out</button></form></div></div>
    <div className="grid">
      <div className="card"><div className="muted">Organization</div><div className="metric">1</div></div>
      <div className="card"><div className="muted">Branches</div><div className="metric">{branches?.length ?? 0}</div></div>
      <div className="card"><div className="muted">Active modules</div><div className="metric">{modules?.length ?? 0}</div></div>
      <div className="card"><div className="muted">Workspace</div><div className="metric">Ready</div></div>
    </div>
    <section className="section"><div className="section-title">Management areas</div><div className="modules">{cards.map(([name,desc,href])=><Link className="module" href={href+"?org="+selected.id} key={name}><h3>{name}</h3><p>{desc}</p></Link>)}</div></section>
    <section className="section"><div className="card"><div className="section-title">Active modules</div><p className="subtitle">{modules?.map((m:{module_key:string})=>m.module_key).join(" • ") || "No modules enabled"}</p></div></section>
  </main>;
}