import { prisma } from "@/lib/db";
import { MetricsCard } from "@/components/MetricsCard";
import { TransactionTable } from "@/components/TransactionTable";

async function getTotals() {
  const [transactions, agents, earnings, recentTransactions] = await Promise.all([
    prisma.transaction.count(),
    prisma.agent.count(),
    prisma.platformEarning.findMany({ select: { amount: true } }),
    prisma.transaction.findMany({
      orderBy: { submittedAt: "desc" },
      take: 8
    })
  ]);

  const totalEarnings = earnings.reduce((sum, row) => sum + Number(row.amount), 0);
  const activeAgents = await prisma.transaction.groupBy({
    by: ["agentId"],
    where: {
      submittedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  });

  return {
    transactions,
    agents,
    totalEarnings,
    activeAgents: activeAgents.length,
    recentTransactions
  };
}

export default async function DashboardOverviewPage() {
  const data = await getTotals();

  return (
    <>
      <section className="section grid grid--cards">
        <MetricsCard label="Total transactions" value={data.transactions} hint="All recorded transfers" />
        <MetricsCard label="Registered agents" value={data.agents} hint="Agents with API keys" />
        <MetricsCard label="Platform earnings (XLM)" value={data.totalEarnings.toFixed(7)} hint="Accumulated fee revenue" />
        <MetricsCard label="Active agents, 7d" value={data.activeAgents} hint="Recent sender activity" />
      </section>

      <section className="section grid grid--two">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Recent transactions</h2>
              <p className="subtle">Latest indexed activity from the platform database.</p>
            </div>
          </div>
          <TransactionTable rows={data.recentTransactions} />
        </article>

        <aside className="panel">
          <h3>Production checklist</h3>
          <div className="stack">
            <div className="mini-card">
              <p className="mini-card__label">Secrets</p>
              <p>API keys are hashed. Wallet secrets should stay server-side or in the agent runtime.</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Fees</p>
              <p>Fee math uses stroops and basis points, avoiding floating-point drift.</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Network</p>
              <p>Testnet and mainnet are selected via environment variables and RPC endpoints.</p>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
