import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
const tables:Record<string,string>={school:"school_students",restaurant:"restaurant_menu_items",office:"office_tasks",ngo:"ngo_programs",retail:"retail_sales",hotel:"people",clinic:"people",warehouse:"inventory_items","service-business":"people"};
export async function POST(req:Request,{params}:{params:Promise<{module:string}>}) {
 const {module}=await params,table=tables[module],s=await createClient();
 if(!table)return NextResponse.json({error:"Unknown module"},{status:404});
 const user=await s.auth.getUser(); if(user.error||!user.data.user)return NextResponse.redirect(new URL("/login",req.url));
 const body=await req.formData(),org=String(body.get("organization_id")||"");
 const {data:orgs}=await s.rpc("my_organizations"); if(!orgs?.some((x:{id:string})=>x.id===org))return NextResponse.json({error:"Organization access denied"},{status:403});
 const allowed:Record<string,string[]>={school:["admission_no","class_name","guardian_name"],restaurant:["name","category","price"],office:["title","description","priority"],ngo:["name","objective","location"],retail:["total_amount","payment_method"],hotel:["full_name","email","phone"],clinic:["full_name","email","phone"],warehouse:["name","sku","quantity"],"service-business":["full_name","email","phone"]};
 const data:any={organization_id:org}; for(const k of allowed[module]||[]){const v=body.get(k); if(v!==null&&String(v)!=="")data[k]=v;}
 for(const k of ["price","total_amount","quantity"])if(k in data)data[k]=Number(data[k]);
 const {error}=await s.from(table).insert(data); if(error)return new NextResponse(error.message,{status:400});
 return NextResponse.redirect(new URL("/operations/"+module+"?org="+org,req.url),303);
}