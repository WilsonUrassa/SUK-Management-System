import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
const tables:Record<string,string>={school:"school_students",restaurant:"restaurant_menu_items",office:"office_tasks",ngo:"ngo_programs",retail:"retail_sales",hotel:"hotel_bookings",clinic:"clinic_appointments",warehouse:"warehouse_movements","service-business":"service_jobs"};
export async function POST(req:Request,{params}:{params:Promise<{module:string}>}) {
 const {module}=await params,table=tables[module],s=await createClient();
 if(!table)return NextResponse.json({error:"Unknown module"},{status:404});
 const user=await s.auth.getUser(); if(user.error||!user.data.user)return NextResponse.redirect(new URL("/login",req.url));
 const body=await req.formData(),org=String(body.get("organization_id")||"");
 const {data:orgs}=await s.rpc("my_organizations"); if(!orgs?.some((x:{id:string})=>x.id===org))return NextResponse.json({error:"Organization access denied"},{status:403});
 const {data:enabledModule,error:moduleError}=await s.from("organization_modules").select("module_key").eq("organization_id",org).eq("module_key",module).eq("enabled",true).maybeSingle();
 if(moduleError||!enabledModule)return NextResponse.json({error:"This module is not enabled for the organization"},{status:403});
 const {data:canManage}=await s.rpc("has_org_permission",{org_id:org,permission_key:"operations.manage"}); if(!canManage)return NextResponse.json({error:"You do not have permission to manage operations"},{status:403});
 const allowed:Record<string,string[]>={school:["admission_no","class_name","guardian_name"],restaurant:["name","category","price"],office:["title","description","priority"],ngo:["name","objective","location"],retail:["total_amount","payment_method"],hotel:["check_in","check_out","status"],clinic:["provider_name","appointment_at","status"],warehouse:["movement_type","quantity","reference"],"service-business":["title","description","status","scheduled_at","amount"]};
 const data:any={organization_id:org}; for(const k of allowed[module]||[]){const v=body.get(k); if(v!==null&&String(v)!=="")data[k]=v;}
 for(const k of ["price","total_amount","quantity","amount"])if(k in data)data[k]=Number(data[k]);
 const {error}=await s.from(table).insert(data); if(error)return new NextResponse(error.message,{status:400});
 return NextResponse.redirect(new URL("/operations/"+module+"?org="+org,req.url),303);
}