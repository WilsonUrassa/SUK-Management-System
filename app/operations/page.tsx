import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { modules } from "../../lib/modules";
export default async function Operations({searchParams}:{searchParams:Promise<{org?:string}>}) {
 const p=await searchParams,s=await createClient(),{data:orgs}=await s.rpc("my_organizations"),o=orgs?.find((x:{id:string})=>x.id===p.org)||orgs?.[0];
 if(!o)return <main className="main"><div className="card"><h1 className="title">Operations</h1><Link className="button" href="/onboarding">Create organization</Link></div></main>;
 const {data:enabled}=await s.from("organization_modules").select("module_key").eq("organization_id",o.id).eq("enabled",true);
 const keys=new Set((enabled||[]).map((x:{module_key:string})=>x.module_key));
 const industry=modules.filter(m=>m.category==="industry"&&keys.has(m.id));
 return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:1100,margin:"0 auto"}}><div className="topbar"><div><div className="eyebrow">Operations</div><h1 className="title">{o.name}</h1><div className="subtitle">Industry-specific workflows enabled for this organization.</div></div><Link className="button secondary" href={"/dashboard?org="+o.id}>Dashboard</Link></div><div className="modules">{industry.map(m=><Link className="module" key={m.id} href={"/operations/"+m.id+"?org="+o.id}><h3>{m.name}</h3><p>{m.description}</p></Link>)}</div></main>;
}