"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";
import { defaultModules } from "../../lib/organization";

const types = ["School","Office / Company","Restaurant","NGO / Nonprofit","Retail / Shop","Hotel","Clinic","Warehouse","Service Business","Other"];

export default function Onboarding() {
  const [name,setName]=useState("");
  const [type,setType]=useState("Office / Company");
  const [branch,setBranch]=useState("Main Branch");
  const [currency,setCurrency]=useState("TZS");
  const [timezone,setTimezone]=useState("Africa/Dar_es_Salaam");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){ window.location.href="/login"; return; }

    const {data,error}=await supabase.rpc("create_organization",{
      org_name:name, org_type:type, branch_name:branch,
      org_currency:currency, org_timezone:timezone
    });
    setLoading(false);
    if(error){setMessage(error.message);return;}
    window.location.href="/dashboard?org="+encodeURIComponent(data);
  }

  const enabled=defaultModules(type);

  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:850,margin:"0 auto"}}>
    <div className="topbar">
      <div><div className="eyebrow">Getting started</div><h1 className="title">Create your organization</h1><div className="subtitle">This workspace becomes the central home for your people, finance and operations.</div></div>
      <Link className="button secondary" href="/">Back</Link>
    </div>
    <form className="card" onSubmit={submit}>
      <div className="form-grid">
        <label>Organization name<input required minLength={2} value={name} onChange={e=>setName(e.target.value)} placeholder="Example: SUK Technologies" /></label>
        <label>Organization type<select value={type} onChange={e=>setType(e.target.value)}>{types.map(t=><option key={t}>{t}</option>)}</select></label>
        <label>First branch / location<input required value={branch} onChange={e=>setBranch(e.target.value)} /></label>
        <label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value)}><option>TZS</option><option>USD</option><option>EUR</option><option>GBP</option></select></label>
        <label>Timezone<select value={timezone} onChange={e=>setTimezone(e.target.value)}><option>Africa/Dar_es_Salaam</option><option>UTC</option></select></label>
      </div>
      <div className="setup-preview">
        <div className="section-title">Recommended modules</div>
        <p className="subtitle">{enabled.join(" • ")}</p>
      </div>
      <button className="button" disabled={loading}>{loading?"Creating workspace...":"Create organization"}</button>
      {message && <p className="subtitle" style={{marginTop:12}}>{message}</p>}
    </form>
  </main>;
}