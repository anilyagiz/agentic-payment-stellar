import { CustomerStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { MetricsCard } from "@/components/MetricsCard";
import { CustomerTable } from "@/components/CustomerTable";

export const dynamic = "force-dynamic";

async function getCustomerSnapshot() {
  const [totalCustomers, activeCustomers, leads, trials, churned, recentCustomers] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: CustomerStatus.active } }),
    prisma.customer.count({ where: { status: CustomerStatus.lead } }),
    prisma.customer.count({ where: { status: CustomerStatus.trial } }),
    prisma.customer.count({ where: { status: CustomerStatus.churned } }),
    prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      take: 12,
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

  return {
    totalCustomers,
    activeCustomers,
    leads,
    trials,
    churned,
    recentCustomers
  };
}

export default async function CustomersPage() {
  const data = await getCustomerSnapshot();
  const targetCustomers = 30;
  const activeProgress = Math.min(100, (data.activeCustomers / targetCustomers) * 100);

  return (
    <>
      <section className="section grid grid--cards">
        <MetricsCard label="Total customers" value={data.totalCustomers} hint="Every captured lead and active account" />
        <MetricsCard label="Active customers" value={data.activeCustomers} hint="Customers live on the platform" />
        <MetricsCard label="Leads" value={data.leads} hint="Captured from pricing and onboarding" />
        <MetricsCard label="Trial / churn" value={`${data.trials} / ${data.churned}`} hint="Pipeline health and retention risk" />
      </section>

      <section className="section grid grid--two">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Customer growth target</h2>
              <p className="subtle">Use this page to push from leads to 30 active customers.</p>
            </div>
          </div>

          <div className="revenue-slider">
            <div className="revenue-slider__header">
              <div>
                <p className="metric-card__label">Active customer progress</p>
                <p className="metric-card__value">
                  {data.activeCustomers} / {targetCustomers}
                </p>
              </div>
              <div className="revenue-slider__chip">{activeProgress.toFixed(0)}% complete</div>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-track__fill" style={{ width: `${activeProgress}%` }} />
            </div>
            <p className="footer-note">Goal: 30 verified active customers, then expand into referrals and annual plans.</p>
          </div>

          <div className="stack">
            <div className="mini-card">
              <p className="mini-card__label">Growth motions</p>
              <p>Capture leads on pricing, convert through onboarding, and keep onboarding friction low.</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Conversion levers</p>
              <p>Use the Pro plan as the default recommendation and follow up on every lead that lands in the pipeline.</p>
            </div>
          </div>
        </article>

        <aside className="panel">
          <h3>Current customer mix</h3>
          <div className="stack">
            <div className="mini-card">
              <p className="mini-card__label">Lead capture</p>
              <p>{data.leads} leads ready for follow-up.</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Trials</p>
              <p>{data.trials} trial users in the funnel.</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Retention</p>
              <p>{data.churned} churned customers to win back or analyze.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="section panel">
        <div className="panel__header">
          <div>
            <h2>Customers</h2>
            <p className="subtle">Everything in one place so you can operate a real 30-customer pipeline.</p>
          </div>
        </div>
        <CustomerTable rows={data.recentCustomers} />
      </section>
    </>
  );
}
