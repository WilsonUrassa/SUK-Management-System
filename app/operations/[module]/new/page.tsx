import Link from "next/link";
import { modules } from "../../../../lib/modules";

const fields:Record<string,{label:string;key:string;type:string;required?:boolean}[]>={
 school:[{label:"Admission number",key:"admission_no",type:"text",required:true},{label:"Class",key:"class_name",type:"text"},{label:"Guardian",key:"guardian_name",type:"text"}],
 restaurant:[{label:"Name",key:"name",type:"text",required:true},{label:"Category",key:"category",type:"text"},{label:"Price",key:"price",type:"number",required:true}],
 office:[{label:"Title",key:"title",type:"text",required:true},{label:"Description",key:"description",type:"text"},{label:"Priority",key:"priority",type:"text"}],
 ngo:[{label:"Program name",key:"name",type:"text",required:true},{label:"Objective",key:"objective",type:"text"},{label:"Location",key:"location",type:"text"}],
 retail:[{label:"Total amount",key:"total_amount",type:"number",required:true},{label:"Payment method",key:"payment_method",type:"text"}],
 hotel:[{label:"Check-in",key:"check_in",type:"date",required:true},{label:"Check-out",key:"check_out",type:"date",required:true},{label:"Status",key:"status",type:"text"}],
 clinic:[{label:"Provider",key:"provider_name",type:"text"},{label:"Appointment time",key:"appointment_at",type:"datetime-local",required:true},{label:"Status",key:"status",type:"text"}],
 warehouse:[{label:"Movement type",key:"movement_type",type:"text",required:true},{label:"Quantity",key:"quantity",type:"number",required:true},{label:"Reference",key:"reference",type:"text"}],
 "service-business":[{label:"Job title",key:"title",type:"text",required:true},{label:"Description",key:"description",type:"text"},{label:"Scheduled time",key:"scheduled_at",type:"datetime-local"},{label:"Amount",key:"amount",type:"number"}]
};

export default async function NewOperation({params,searchParams}:{params:Promise<{module:string}>,searchParams:Promise<{org?:string}>}) {
 const [p,q]=await Promise.all([params,searchParams]); const m=modules.find(x=>x.id===p.module);
 if(!m||!q.org)return <main className="main"><div className="card"><h1 className="title">Missing module or organization</h1></div></main>;
 const f=fields[p.module]||[];
 return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:760,margin:"0 auto"}}><div className="topbar"><div><div className="eyebrow">{m.name}</div><h1 className="title">Add record</h1><div className="subtitle">Create a professional operational record for this organization.</div></div><Link className="button secondary" href={"/operations/"+p.module+"?org="+q.org}>Back</Link></div><form className="card" action={"/api/operations/"+p.module}><input type="hidden" name="organization_id" value={q.org}/>{f.map(x=><label key={x.key}>{x.label}<input required={x.required} name={x.key} type={x.type}/></label>)}<button className="button" type="submit">Save record</button></form></main>;
}