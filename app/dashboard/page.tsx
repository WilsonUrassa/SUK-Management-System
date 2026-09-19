import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { modules } from "../../lib/modules";

const coreCards = [
  ["People","Manage employees, students, members, clients and contacts.","/people","people"],
  ["Finance","Track income, expenses and financial activity.","/finance","finance"],
  ["Inventory","Manage products, stock, warehouses and suppliers.","/inventory","inventory"],
  ["Reports","View management information and performance reports.","/reports","reports"],
  ["Settings","Manage your organization, branches, users and configuration.","/settings","settings"],
];

export default async function Dashboard({searchParams}:{searchParams:Promise<{org?:string}>}) {
  const params=await searchParams;
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:700,margin:"0 auto"}}><div className="card"><h1 className="title">Sign in required</h1><p className="subtitle">Please sign in to access your workspace.</p><Link className="button" href="/login">Sign in</Link></div></main>;

  const {data:orgs}=await supabase.rpc("my_organizations");
  const selected=orgs?.find((o:{id:string})=>o.id===params.org) ?? orgs?.[0];
  if(!selected) return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:700,margin:"0 auto"}}><div className="card"><div className="eyebrow">Workspace</div><h1 className="title">Create your organization</h1><p className="subtitle">Set up your organization to create your professional management workspace.</p><Link className="button" href="/onboarding">Create organization</Link></div></main>;

  const [{data:branches},{data:enabled}]=await Promise.all([
    supabase.from("branches").select("id,name").eq("organization_id",selected.id).eq("is_active",true).order("name"),
    supabase.from("organization_modules").select("module_key").eq("organization_id",selected.id).eq("enabled",true).order("module_key")
  ]);

  const keys=new Set((enabled||[]).map((m:{module_key:string})=>m.module_key));
  const industry=modules.filter(m=>m.category==="industry"&&keys.has(m.id));
  const [{count:peopleCount},{data:finance},{data:stock}]=await Promise.all([
    supabase.from("people").select("id",{count:"exact",head:true}).eq("organization_id",selected.id).eq("active",true),
    supabase.from("finance_transactions").select("transaction_type,amount").eq("organization_id",selected.id),
    supabase.from("inventory_items").select("quantity,unit_cost").eq("organization_id",selected.id).eq("active",true)
  ]);
  const income=(finance||[]).filter((x:{transaction_type:string})=>x.transaction_type==="income").reduce((n,x)=>n+Number(x.amount||0),0);
  const expense=(finance||[]).filter((x:{transaction_type:string})=>x.transaction_type==="expense").reduce((n,x)=>n+Number(x.amount||0),0);
  const stockValue=(stock||[]).reduce((n,x)=>n+Number(x.quantity||0)*Number(x.unit_cost||0),0);

  const visibleCore=coreCards.filter(([,,,key])=>key==="settings"||keys.has(key as string));
  return <main className="main workspace-main">
    <div className="workspace-header">
      <div>
        <div className="eyebrow">Organization workspace</div>
        <div className="workspace-title-row"><div className="org-avatar">{selected.name.slice(0,1).toUpperCase()}</div><div><h1 className="title">{selected.name}</h1><div className="subtitle">{selected.organization_type} · {selected.currency} · {selected.timezone}</div></div></div>
      </div>
      <div className="workspace-actions">
        <Link className="button secondary" href="/onboarding">Add organization</Link>
        <form action="/auth/signout" method="post"><button className="button secondary" type="submit">Sign out</button></form>
      </div>
    </div>

    {orgs && orgs.length>1&&<section className="card workspace-switcher"><div><div className="section-title">Your organizations</div><div className="muted">Switch between organizations you manage.</div></div><div className="org-switch-list">{orgs.map((o:{id:string,name:string,organization_type:string})=><Link className={o.id===selected.id?"org-switch active":"org-switch"} href={"/dashboard?org="+o.id} key={o.id}><span className="org-switch-avatar">{o.name.slice(0,1).toUpperCase()}</span><span><strong>{o.name}</strong><small>{o.organization_type}</small></span></Link>)}</div></section>}

    <div className="workspace-strip">
      <div><span>Active branch</span><strong>{branches?.[0]?.name || "Main Branch"}</strong></div>
      <div><span>Modules</span><strong>{enabled?.length || 0} active</strong></div>
      <div><span>People</span><strong>{peopleCount || 0}</strong></div>
      <div><span>Balance</span><strong>{selected.currency} {income-expense}</strong></div>
    </div>

    <section className="section"><div className="section-heading"><div><div className="section-title">Your management workspace</div><div className="muted">Everything below is configured for {selected.name}.</div></div></div>
      <div className="modules workspace-modules">{visibleCore.map(([name,desc,href])=><Link className="module professional-module" href={href+"?org="+selected.id} key={name}><div><h3>{name}</h3><p>{desc}</p></div><span className="module-arrow">→</span></Link>)}</div>
    </section>

    {industry.length>0&&<section className="section"><div className="section-heading"><div><div className="section-title">Industry operations</div><div className="muted">Specialized tools enabled for this organization.</div></div><Link className="button secondary" href={"/operations?org="+selected.id}>View all</Link></div>
      <div className="modules workspace-modules">{industry.map(m=><Link className="module professional-module" key={m.id} href={"/operations/"+m.id+"?org="+selected.id}><div><h3>{m.name}</h3><p>{m.description}</p></div><span className="module-arrow">→</span></Link>)}</div>
    </section>}

    <section className="section"><div className="section-heading"><div><div className="section-title">Key figures</div><div className="muted">Current figures for this organization.</div></div></div>
      <div className="grid">
        {keys.has("finance")&&<div className="card metric-card"><div className="muted">Income</div><div className="metric">{selected.currency} {income.toLocaleString()}</div></div>}
        {keys.has("finance")&&<div className="card metric-card"><div className="muted">Expenses</div><div className="metric">{selected.currency} {expense.toLocaleString()}</div></div>}
        {keys.has("inventory")&&<div className="card metric-card"><div className="muted">Stock value</div><div className="metric">{selected.currency} {stockValue.toLocaleString()}</div></div>}
        <div className="card metric-card"><div className="muted">Active branches</div><div className="metric">{branches?.length||0}</div></div>
      </div>
    </section>
  </main>;
}