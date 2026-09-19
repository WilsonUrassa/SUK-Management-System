"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function Signup() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    const {data,error}=await createClient().auth.signUp({email,password,options:{data:{full_name:name}}});
    setLoading(false);
    if(error) { setMessage(error.message); return; }
    setMessage(data.session ? "Account created. You can continue to setup your organization." : "Account created. Check your email to confirm your account.");
  }

  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:520,margin:"0 auto"}}>
    <div className="topbar"><div><div className="eyebrow">SUK Management System</div><h1 className="title">Create account</h1><div className="subtitle">Create the account that will manage your organization.</div></div><Link className="button secondary" href="/">Home</Link></div>
    <form className="card" onSubmit={submit}>
      <label>Full name<input required value={name} onChange={e=>setName(e.target.value)} /></label>
      <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <button className="button" disabled={loading}>{loading?"Creating...":"Create account"}</button>
      {message && <p className="subtitle" style={{marginTop:12}}>{message}</p>}
      <p className="subtitle" style={{marginTop:16}}>Already registered? <Link href="/login" style={{color:"#1769e0"}}>Sign in</Link></p>
    </form>
  </main>;
}
