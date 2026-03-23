import Link from "next/link";
import { MonetizationPanel } from "@/components/MonetizationPanel";

const plans = [
  {
    name: "Starter",
    price: "$0",
    note: "For pilots and personal projects",
    highlight: "1 agent",
    features: ["1 agent", "0.75% take rate", "Testnet onboarding", "Community support"]
  },
  {
    name: "Pro",
    price: "$99",
    note: "Recommended for teams shipping revenue",
    highlight: "Best value",
    features: ["10 agents", "0.50% take rate", "Dashboard analytics", "Priority email support"]
  },
  {
    name: "Scale",
    price: "$399",
    note: "For high-volume operations",
    highlight: "Unlimited agents",
    features: ["Unlimited agents", "0.30% take rate", "Sponsorship flows", "Dedicated onboarding"]
  }
];

export default function PricingPage() {
  return (
    <main className="page-shell">
      <section className="hero hero--pricing">
        <div className="hero__eyebrow">Pricing • Monetization</div>
        <h1>Make the platform pay for itself.</h1>
        <p>
          The commercial model is simple: low-friction self-serve onboarding, then a subscription plus a transaction take rate
          as agents scale up. That gives you MRR on day one and upside with usage.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" href="/#launchpad">Start onboarding</Link>
          <Link className="button button--secondary" href="/dashboard">Open dashboard</Link>
          <Link className="button button--secondary" href={{ pathname: "/open-core" }}>Open-core model</Link>
        </div>
      </section>

      <section className="section grid grid--cards">
        {plans.map((plan) => (
          <article key={plan.name} className={`metric-card pricing-summary ${plan.highlight === "Best value" ? "pricing-summary--featured" : ""}`}>
            <p className="pricing-summary__eyebrow">{plan.highlight}</p>
            <p className="metric-card__label">{plan.name}</p>
            <p className="metric-card__value">{plan.price}<span className="pricing-summary__period">/mo</span></p>
            <p className="metric-card__hint">{plan.note}</p>
            <ul className="pricing-summary__list">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <MonetizationPanel />

      <section className="section panel">
        <h3>Why this pricing model works</h3>
        <div className="stack">
          <div className="mini-card">
            <p className="mini-card__label">Value metric</p>
            <p>Charge for active agents and payment volume so price rises with customer success.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Upsell path</p>
            <p>Starter gets adoption. Pro captures teams. Scale captures enterprises and higher volume.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Conversion path</p>
            <p>Each CTA goes to onboarding or sales. There is no dead-end page traffic.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
