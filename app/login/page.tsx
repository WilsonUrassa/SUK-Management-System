"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    const {error}=await createClient().auth.signInWithPassword({email,password});
    setLoading(false);
    if(error) { setMessage(error.message); return; }
    window.location.href="/dashboard";
  }

  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:520,margin:"0 auto"}}>
    <div className="topbar"><div><div className="eyebrow">SUK Management System</div><h1 className="title">Sign in</h1><div className="subtitle">Access your organization workspace.</div></div><Link className="button secondary" href="/">Home</Link></div>
    <form className="card" onSubmit={submit}>
      <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
      <button className="button" disabled={loading}>{loading?"Signing in...":"Sign in"}</button>
      {message && <p className="subtitle" style={{marginTop:12}}>{message}</p>}
      <p className="subtitle" style={{marginTop:16}}>Need an account? <Link href="/signup" style={{color:"#1769e0"}}>Create one</Link></p>
    </form>
  </main>;
}
