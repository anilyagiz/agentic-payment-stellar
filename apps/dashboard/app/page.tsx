import Link from "next/link";
import { OnboardingPanel } from "@/components/OnboardingPanel";

const highlights = [
  { title: "RPC submission", body: "Modern Stellar RPC flow with sendTransaction + pollTransaction." },
  { title: "Fee split", body: "Native XLM payments automatically route platform fees to treasury." },
  { title: "Fee sponsorship", body: "Fee-bump support for gasless onboarding and sponsored flows." },
  { title: "Indexed activity", body: "Transactions, earnings, and agent activity are persisted in PostgreSQL." }
];

export default function LandingPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero__eyebrow">StellarAgent • Autonomous payments for autonomous agents</div>
        <h1>Programmable money rails for agentic workflows.</h1>
        <p>
          Build agent-to-agent and agent-to-user payment flows on Stellar with deterministic fee splitting,
          operational observability, and sponsored transactions for zero-XLM onboarding.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" href="/dashboard">Open dashboard</Link>
          <Link className="button button--secondary" href={"/pricing" as const}>View pricing</Link>
          <a className="button button--secondary" href="/api/health">Health check</a>
        </div>
      </section>

      <OnboardingPanel />

      <section className="section grid grid--cards">
        {highlights.map((item) => (
          <article key={item.title} className="metric-card">
            <p className="metric-card__label">{item.title}</p>
            <p className="metric-card__value" style={{ fontSize: "1.25rem", lineHeight: 1.35 }}>{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
