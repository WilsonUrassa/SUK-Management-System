import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { modules } from "../../../lib/modules";

const configs:Record<string,{table:string;title:string;columns:string[];links:string[]}>={
 school:{table:"school_students",title:"Students",columns:["admission_no","class_name","guardian_name","status"],links:["Add student"]},
 restaurant:{table:"restaurant_menu_items",title:"Menu items",columns:["name","category","price","is_available"],links:["Add menu item"]},
 office:{table:"office_tasks",title:"Tasks",columns:["title","status","priority","due_date"],links:["Add task"]},
 ngo:{table:"ngo_programs",title:"Programs",columns:["name","location","status","start_date"],links:["Add program"]},
 retail:{table:"retail_sales",title:"Sales",columns:["total_amount","payment_method","sale_date"],links:["Record sale"]},
 hotel:{table:"hotel_bookings",title:"Bookings",columns:["check_in","check_out","status","total_amount"],links:["Add booking"]},
 clinic:{table:"clinic_appointments",title:"Appointments",columns:["provider_name","appointment_at","status"],links:["Add appointment"]},
 warehouse:{table:"warehouse_movements",title:"Stock movements",columns:["movement_type","quantity","reference","movement_at"],links:["Record movement"]},
 "service-business":{table:"service_jobs",title:"Jobs",columns:["title","status","scheduled_at","amount"],links:["Add job"]}
};

export default async function ModuleOperation({params,searchParams}:{params:Promise<{module:string}>,searchParams:Promise<{org?:string}>}) {
 const [p,q]=await Promise.all([params,searchParams]),s=await createClient(),{data:orgs}=await s.rpc("my_organizations"),o=orgs?.find((x:{id:string})=>x.id===q.org)||orgs?.[0],m=modules.find(x=>x.id===p.module),cfg=configs[p.module];
 if(!o||!m||!cfg)return <main className="main"><div className="card"><h1 className="title">Module not found</h1><Link className="button" href="/dashboard">Dashboard</Link></div></main>;
 const {data:enabled}=await s.from("organization_modules").select("module_key").eq("organization_id",o.id).eq("module_key",m.id).eq("enabled",true).maybeSingle();
 if(!enabled)return <main className="main"><div className="card"><h1 className="title">Module not enabled</h1><Link className="button" href={"/settings?org="+o.id}>Settings</Link></div></main>;
 const {data:rows,error}=await s.from(cfg.table).select("*").eq("organization_id",o.id).order("created_at",{ascending:false}).limit(50);
 return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:1150,margin:"0 auto"}}><div className="topbar"><div><div className="eyebrow">Industry module</div><h1 className="title">{m.name}</h1><div className="subtitle">{o.name}</div></div><div style={{display:"flex",gap:8}}><Link className="button" href={"/operations/"+m.id+"/new?org="+o.id}>{cfg.links[0]}</Link><Link className="button secondary" href={"/operations?org="+o.id}>Operations</Link></div></div><div className="card"><div className="section-title">{cfg.title}</div>{error?<p className="subtitle">{error.message}</p>:rows?.length?<div className="table">{rows.map((row:any)=><div className="table-row" key={row.id}>{cfg.columns.map(c=><span key={c}>{row[c]===null||row[c]===undefined?"—":typeof row[c]==="boolean"?(row[c]?"Yes":"No"):String(row[c])}</span>)}</div>)}</div>:<p className="subtitle">No records yet. Use the action above to add the first record.</p>}</div></main>;
}