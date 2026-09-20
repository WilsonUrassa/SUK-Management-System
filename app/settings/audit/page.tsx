import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

export default async function AuditPage({searchParams}:{searchParams:Promise<{org?:string}>}) {
  const p=await searchParams;
  const s=await createClient();
  const {data:orgs}=await s.rpc("my_organizations");
  const o=orgs?.find((x:{id:string})=>x.id===p.org)||orgs?.[0];
  if(!o) return <main className="main"><div className="card"><h1 className="title">Audit history</h1><p className="subtitle">Create an organization first.</p><Link className="button" href="/onboarding">Create organization</Link></div></main>;\n  const {data:canView}=await s.rpc("has_org_permission",{org_id:o.id,permission_key:"audit.view"}); if(!canView) return <main className="main"><div className="card"><h1 className="title">Access denied</h1><p className="subtitle">You do not have permission to view this area.</p></div></main>;
  const {data:logs,error}=await s.rpc("organization_audit_logs",{org_id:o.id,result_limit:100});
  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:1100,margin:"0 auto"}}>
    <div className="topbar"><div><div className="eyebrow">Administration</div><h1 className="title">Audit history</h1><div className="subtitle">A chronological record of important workspace actions.</div></div><Link className="button secondary" href={"/settings?org="+o.id}>Settings</Link></div>
    <div className="card">
      {error?<p className="subtitle">Audit history is not available until the latest Supabase SQL migrations are applied.</p>:logs?.length?<div className="table">{logs.map((x:{id:string,action:string,entity_type:string|null,created_at:string,metadata:Record<string,unknown>|null})=><div className="table-row" key={x.id}><strong>{x.action}</strong><span>{x.entity_type||"Workspace"}</span><span>{x.metadata?JSON.stringify(x.metadata):"—"}</span><span>{new Date(x.created_at).toLocaleString()}</span></div>)}</div>:<p className="subtitle">No audit events have been recorded yet.</p>}
    </div>
  </main>;
}
