import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-shell">
      <header className="nav">
        <div className="brand">
          <span className="brand__name">StellarAgent</span>
          <span className="brand__tagline">Operational command center</span>
        </div>
        <nav className="nav__links">
          <Link className="pill" href={"/pricing" as const}>Pricing</Link>
          <Link className="pill" href={{ pathname: "/open-core" }}>Open core</Link>
          <Link className="pill" href={{ pathname: "/demo/agent" }}>Agent demo</Link>
          <Link className="pill" href="/dashboard">Overview</Link>
          <Link className="pill" href={{ pathname: "/dashboard/customers" }}>Customers</Link>
          <Link className="pill" href={"/dashboard/monitoring" as const}>Monitoring</Link>
          <Link className="pill" href="/dashboard/transactions">Transactions</Link>
          <Link className="pill" href="/dashboard/agents">Agents</Link>
          <Link className="pill" href="/dashboard/earnings">Earnings</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
