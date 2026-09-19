import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
export default async function Reports({searchParams}:{searchParams:Promise<{org?:string}>}) {
 const p=await searchParams,s=await createClient(),{data:orgs}=await s.rpc("my_organizations"),o=orgs?.find((x:{id:string})=>x.id===p.org)||orgs?.[0];
 if(!o)return <main className="main"><div className="card"><h1 className="title">Reports</h1><Link className="button" href="/onboarding">Create organization</Link></div></main>;
 const [{data:people},{data:finance},{data:inventory}]=await Promise.all([
  s.from("people").select("id").eq("organization_id",o.id),
  s.from("finance_transactions").select("transaction_type,amount").eq("organization_id",o.id),
  s.from("inventory_items").select("quantity,unit_cost").eq("organization_id",o.id)
 ]);
 const income=(finance||[]).filter((x:{transaction_type:string})=>x.transaction_type==="income").reduce((a,x:{amount:number})=>a+Number(x.amount),0);
 const expense=(finance||[]).filter((x:{transaction_type:string})=>x.transaction_type==="expense").reduce((a,x:{amount:number})=>a+Number(x.amount),0);
 const stock=(inventory||[]).reduce((a,x:{quantity:number,unit_cost:number})=>a+Number(x.quantity)*Number(x.unit_cost),0);
 return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:1100,margin:"0 auto"}}><div className="topbar"><div><div className="eyebrow">Reports</div><h1 className="title">{o.name}</h1><div className="subtitle">Current management overview.</div></div><Link className="button secondary" href={"/dashboard?org="+o.id}>Dashboard</Link></div><div className="grid"><div className="card"><div className="muted">People</div><div className="metric">{people?.length||0}</div></div><div className="card"><div className="muted">Income</div><div className="metric">{o.currency} {income.toLocaleString()}</div></div><div className="card"><div className="muted">Expenses</div><div className="metric">{o.currency} {expense.toLocaleString()}</div></div><div className="card"><div className="muted">Stock value</div><div className="metric">{o.currency} {stock.toLocaleString()}</div></div></div></main>;
}