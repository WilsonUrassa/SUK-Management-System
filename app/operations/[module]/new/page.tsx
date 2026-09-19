import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import { modules } from "../../../../lib/modules";
const fields:Record<string,{label:string;key:string;type:string}[]>={
school:[{label:"Admission number",key:"admission_no",type:"text"},{label:"Class",key:"class_name",type:"text"},{label:"Guardian",key:"guardian_name",type:"text"}],
restaurant:[{label:"Name",key:"name",type:"text"},{label:"Category",key:"category",type:"text"},{label:"Price",key:"price",type:"number"}],
office:[{label:"Title",key:"title",type:"text"},{label:"Description",key:"description",type:"text"},{label:"Priority",key:"priority",type:"text"}],
ngo:[{label:"Program name",key:"name",type:"text"},{label:"Objective",key:"objective",type:"text"},{label:"Location",key:"location",type:"text"}],
retail:[{label:"Total amount",key:"total_amount",type:"number"},{label:"Payment method",key:"payment_method",type:"text"}],
hotel:[{label:"Guest name",key:"full_name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Phone",key:"phone",type:"text"}],
clinic:[{label:"Patient name",key:"full_name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Phone",key:"phone",type:"text"}],
warehouse:[{label:"Item name",key:"name",type:"text"},{label:"SKU",key:"sku",type:"text"},{label:"Quantity",key:"quantity",type:"number"}],
"service-business":[{label:"Client name",key:"full_name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Phone",key:"phone",type:"text"}]
};
export default async function NewOperation({params,searchParams}:{params:Promise<{module:string}>,searchParams:Promise<{org?:string}>}) {
 const [p,q]=await Promise.all([params,searchParams]); const m=modules.find(x=>x.id===p.module);
 if(!m||!q.org)return <main className="main"><div className="card"><h1 className="title">Missing module or organization</h1></div></main>;
 const f=fields[p.module]||[];
 return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:760,margin:"0 auto"}}><div className="topbar"><div><div className="eyebrow">{m.name}</div><h1 className="title">Add record</h1><div className="subtitle">Create a new operational record.</div></div><Link className="button secondary" href={"/operations/"+p.module+"?org="+q.org}>Back</Link></div><form className="card" action={"/api/operations/"+p.module}><input type="hidden" name="organization_id" value={q.org}/>{f.map(x=><label key={x.key}>{x.label}<input required={x.key==="name"||x.key==="full_name"||x.key==="title"||x.key==="admission_no"} name={x.key} type={x.type}/></label>)}<button className="button" type="submit">Save record</button></form></main>;
}