import { prisma } from "@/lib/db";
import { MetricsCard } from "@/components/MetricsCard";
import { TransactionTable } from "@/components/TransactionTable";
import { CustomerTable } from "@/components/CustomerTable";
import { CustomerStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

async function getTotals() {
  const [transactions, agents, customers, activeCustomers, earnings, recentTransactions, recentCustomers] = await Promise.all([
    prisma.transaction.count(),
    prisma.agent.count(),
    prisma.customer.count(),
    prisma.customer.count({ where: { status: CustomerStatus.active } }),
    prisma.platformEarning.findMany({ select: { amount: true } }),
    prisma.transaction.findMany({
      orderBy: { submittedAt: "desc" },
      take: 8
    }),
    prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        plan: true,
        status: true,
        source: true,
        monthlyVolumeUsd: true,
        walletPublicKey: true,
        updatedAt: true
      }
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
    customers,
    activeCustomers,
    totalEarnings,
    activeAgents: activeAgents.length,
    recentTransactions,
    recentCustomers
  };
}

export default async function DashboardOverviewPage() {
  const data = await getTotals();

  return (
    <>
      <section className="section grid grid--cards">
        <MetricsCard label="Total transactions" value={data.transactions} hint="All recorded transfers" />
        <MetricsCard label="Registered agents" value={data.agents} hint="Agents with API keys" />
        <MetricsCard label="Total customers" value={data.customers} hint="Leads and active accounts" />
        <MetricsCard label="Active customers" value={data.activeCustomers} hint="Customers ready for expansion" />
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

      <section className="section panel">
        <div className="panel__header">
          <div>
            <h2>Recent customers</h2>
            <p className="subtle">This list helps you work the 30-customer target as a real pipeline, not a vanity number.</p>
          </div>
        </div>
        <CustomerTable rows={data.recentCustomers} />
      </section>
    </>
  );
}
