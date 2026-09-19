"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";

export default function NewBranch({searchParams}:{searchParams:Promise<{org?:string}>}) {
  const router=useRouter();
  const [org,setOrg]=useState("");
  const [name,setName]=useState("");
  const [code,setCode]=useState("");
  const [address,setAddress]=useState("");
  const [phone,setPhone]=useState("");
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  useEffect(() => {
    let active=true;
    searchParams.then(params => {
      if(active) setOrg(params.org || "");
    });
    return () => { active=false; };
  }, [searchParams]);

  async function submit(e:FormEvent) {
    e.preventDefault();
    if(!org) {
      setMessage("An organization is required.");
      return;
    }
    setLoading(true);
    setMessage("");
    const supabase=createClient();
    const {error}=await supabase.rpc("create_branch",{
      org_id:org,
      branch_name:name,
      branch_code:code,
      branch_address:address,
      branch_phone:phone,
      branch_email:email
    });
    setLoading(false);
    if(error){setMessage(error.message);return;}
    router.push("/settings?org="+encodeURIComponent(org));
    router.refresh();
  }

  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:760,margin:"0 auto"}}>
    <div className="topbar">
      <div><div className="eyebrow">Settings</div><h1 className="title">Add branch</h1><div className="subtitle">Create another location under this organization.</div></div>
    </div>
    <form className="card" onSubmit={submit}>
      <div className="form-grid">
        <label>Branch name<input value={name} onChange={e=>setName(e.target.value)} required /></label>
        <label>Branch code<input value={code} onChange={e=>setCode(e.target.value)} placeholder="Optional" /></label>
        <label>Address<input value={address} onChange={e=>setAddress(e.target.value)} /></label>
        <label>Phone<input value={phone} onChange={e=>setPhone(e.target.value)} /></label>
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      </div>
      {message&&<p className="subtitle">{message}</p>}
      <div style={{display:"flex",gap:8}}>
        <button className="button" type="submit" disabled={loading||!org}>{loading?"Creating...":"Create branch"}</button>
        <button className="button secondary" type="button" onClick={()=>router.push(org?"/settings?org="+encodeURIComponent(org):"/settings")}>Cancel</button>
      </div>
    </form>
  </main>;
}
