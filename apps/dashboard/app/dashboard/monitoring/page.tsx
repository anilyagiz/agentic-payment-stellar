import { prisma } from "@/lib/db";
import { MetricsCard } from "@/components/MetricsCard";

export const dynamic = "force-dynamic";

async function getMonitoringSnapshot() {
  const [totalTransactions, confirmedTransactions, failedTransactions, backlogTransactions, recentTransactions] =
    await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "confirmed" } }),
      prisma.transaction.count({ where: { status: "failed" } }),
      prisma.transaction.count({ where: { status: { in: ["pending", "submitted"] } } }),
      prisma.transaction.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          txHash: true,
          status: true,
          network: true,
          updatedAt: true
        }
      })
    ]);

  const failureRate = totalTransactions > 0 ? (failedTransactions / totalTransactions) * 100 : 0;

  return {
    totalTransactions,
    confirmedTransactions,
    failedTransactions,
    backlogTransactions,
    failureRate,
    recentTransactions
  };
}

export default async function MonitoringPage() {
  const data = await getMonitoringSnapshot();

  return (
    <>
      <section className="section grid grid--cards">
        <MetricsCard label="Total transactions" value={data.totalTransactions} hint="Indexed payment activity" />
        <MetricsCard label="Failed transactions" value={data.failedTransactions} hint={`${data.failureRate.toFixed(1)}% failure rate`} />
        <MetricsCard label="Backlog" value={data.backlogTransactions} hint="Pending or submitted for reconciliation" />
        <MetricsCard label="Confirmed" value={data.confirmedTransactions} hint="Finalized in the application database" />
      </section>

      <section className="section grid grid--two">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Operational status</h2>
              <p className="subtle">Use this view to keep the submission alive after launch.</p>
            </div>
          </div>

          <div className="stack">
            <div className="mini-card">
              <p className="mini-card__label">Indexer health</p>
              <p>Run `POST /api/sync` on a schedule and keep the backlog near zero.</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Transaction health</p>
              <p>Alert when failed transactions rise above the target threshold or when confirmation stalls.</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Revenue health</p>
              <p>Watch fee income and plan upgrades together so the pricing funnel stays aligned with actual usage.</p>
            </div>
          </div>
        </article>

        <aside className="panel">
          <h3>Recent transaction signals</h3>
          <div className="stack">
            {data.recentTransactions.map((row) => (
              <div key={row.txHash} className="mini-card">
                <p className="mini-card__label">
                  {row.network} • {row.status}
                </p>
                <p>{row.txHash.slice(0, 12)}…</p>
                <p className="footer-note">Updated {row.updatedAt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="section panel">
        <h3>Monitoring checklist</h3>
        <div className="stack">
          <div className="mini-card">
            <p className="mini-card__label">Dashboards</p>
            <p>Metrics live in `/dashboard`; monitoring lives in `/dashboard/monitoring`.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Alerts</p>
            <p>Page on rising failures, stalled indexing, or RPC failures.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Logging</p>
            <p>Capture API responses and reconciliation exceptions before every release.</p>
          </div>
        </div>
      </section>
    </>
  );
}
