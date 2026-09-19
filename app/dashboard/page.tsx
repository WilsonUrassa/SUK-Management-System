import Link from "next/link";

const cards = [
  ["People", "Users, employees, students and other members."],
  ["Finance", "Income, expenses, invoices, payments and budgets."],
  ["Inventory", "Products, stock, warehouses and suppliers."],
  ["Operations", "Industry-specific workflows for your organization."],
  ["Reports", "Management reports, exports and analytics."],
  ["Settings", "Organization, branches, roles and modules."]
];

export default function Dashboard({searchParams}:{searchParams:{type?:string}}) {
  const type = searchParams?.type || "Organization";
  return <main className="main" style={{marginLeft:0,width:"100%",maxWidth:1100,margin:"0 auto"}}>
    <div className="topbar">
      <div><div className="eyebrow">Workspace</div><h1 className="title">{type} dashboard</h1><div className="subtitle">Your central workspace for managing people, money, operations and records.</div></div>
      <Link className="button secondary" href="/">Platform home</Link>
    </div>
    <div className="grid">
      <div className="card"><div className="muted">Revenue</div><div className="metric">TZS 0</div></div>
      <div className="card"><div className="muted">Expenses</div><div className="metric">TZS 0</div></div>
      <div className="card"><div className="muted">People</div><div className="metric">0</div></div>
      <div className="card"><div className="muted">Stock items</div><div className="metric">0</div></div>
    </div>
    <section className="section"><div className="section-title">Management areas</div><div className="modules">{cards.map(([name,desc])=><div className="module" key={name}><h3>{name}</h3><p>{desc}</p></div>)}</div></section>
    <section className="section"><div className="card"><div className="section-title">Next implementation layer</div><p className="subtitle">Connect Supabase Auth and the organization tables, then replace these placeholder metrics with tenant-scoped live data.</p></div></section>
  </main>
}