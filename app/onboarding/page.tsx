import Link from "next/link";
import { defaultModules, slugify } from "../../lib/organization";

const types = ["School","Office / Company","Restaurant","NGO / Nonprofit","Retail / Shop","Hotel","Clinic","Warehouse","Service Business","Other"];

export default function Onboarding() {
  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:1100,margin:"0 auto"}}>
    <div className="topbar">
      <div><div className="eyebrow">Getting started</div><h1 className="title">Create your organization</h1><div className="subtitle">Choose a starting profile. The platform will activate a practical set of modules for it.</div></div>
      <Link className="button secondary" href="/">Back</Link>
    </div>
    <div className="card" style={{marginBottom:18}}>
      <div className="section-title">Setup flow</div>
      <p className="subtitle">1. Choose organization type → 2. Create workspace → 3. Configure branches, users and modules → 4. Start operations.</p>
    </div>
    <div className="modules">{types.map(t => {
      const enabled = defaultModules(t);
      return <div className="module" key={t}>
        <h3>{t}</h3>
        <p>Recommended modules: {enabled.join(", ")}.</p>
        <div style={{marginTop:14}}><Link className="button" href={"/dashboard?type="+encodeURIComponent(t)+"&slug="+encodeURIComponent(slugify(t))}>Use this profile</Link></div>
      </div>;
    })}</div>
  </main>
}