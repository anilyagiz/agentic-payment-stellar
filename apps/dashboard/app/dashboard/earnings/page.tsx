import { prisma } from "@/lib/db";
import { EarningsChart } from "@/components/EarningsChart";

export const dynamic = "force-dynamic";

function groupByDay(items: { amount: string; createdAt: Date }[]) {
  const buckets = new Map<string, number>();
  for (const item of items) {
    const day = item.createdAt.toISOString().slice(0, 10);
    buckets.set(day, (buckets.get(day) ?? 0) + Number(item.amount));
  }

  return [...buckets.entries()].map(([day, earnings]) => ({ day, earnings }));
}

export default async function EarningsPage() {
  const earnings = await prisma.platformEarning.findMany({
    orderBy: { createdAt: "asc" },
    take: 365
  });
  const data = groupByDay(earnings);
  const total = earnings.reduce((sum, row) => sum + Number(row.amount), 0);

  return (
    <section className="section grid grid--two">
      <article className="panel">
        <div className="panel__header">
          <div>
            <h2>Platform earnings</h2>
            <p className="subtle">Daily fee revenue across indexed transactions.</p>
          </div>
        </div>
        <EarningsChart data={data} />
      </article>

      <aside className="panel">
        <h3>Total earned</h3>
        <p className="metric-card__value" style={{ marginBottom: 12 }}>{total.toFixed(7)} XLM</p>
        <div className="stack">
          <div className="mini-card">
            <p className="mini-card__label">Indexing model</p>
            <p>Revenue is persisted as a canonical DB record for fast dashboard aggregation.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Suggested cron</p>
            <p>Run a reconcile job every few minutes to update transaction status from RPC.</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
