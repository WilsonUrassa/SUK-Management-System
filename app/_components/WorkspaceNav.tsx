import Link from "next/link";

export default function WorkspaceNav({org}:{org:string}) {
  const q=(path:string)=>path+"?org="+org;
  return <nav className="workspace-nav" aria-label="Workspace navigation">
    <Link href={q("/dashboard")}>Overview</Link>
    <Link href={q("/people")}>People</Link>
    <Link href={q("/finance")}>Finance</Link>
    <Link href={q("/inventory")}>Inventory</Link>
    <Link href={q("/operations")}>Operations</Link>
    <Link href={q("/reports")}>Reports</Link>
    <Link href={q("/settings")}>Settings</Link>
  </nav>;
}
