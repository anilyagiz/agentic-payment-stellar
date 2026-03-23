"use client";

import { FormEvent, useState } from "react";

type PricingPlan = {
  name: string;
  price: number;
  feeBps: number;
  agents: string;
  description: string;
};

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: 0,
    feeBps: 75,
    agents: "1 agent",
    description: "For pilots, proofs of concept, and single-workflow automations."
  },
  {
    name: "Pro",
    price: 99,
    feeBps: 50,
    agents: "10 agents",
    description: "For teams shipping production workflows and monetizing payments."
  },
  {
    name: "Scale",
    price: 399,
    feeBps: 30,
    agents: "Unlimited agents",
    description: "For high-volume operators that need priority support and tighter margins."
  }
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function calculateRevenue(plan: PricingPlan, monthlyVolumeUsd: number) {
  const usageRevenue = monthlyVolumeUsd * (plan.feeBps / 10_000);
  return plan.price + usageRevenue;
}

export function MonetizationPanel() {
  const defaultPlan = plans[1]!;
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(defaultPlan);
  const [monthlyVolumeUsd, setMonthlyVolumeUsd] = useState(25_000);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [targetVolume, setTargetVolume] = useState("25000");
  const [leadStatus, setLeadStatus] = useState<string | null>(null);

  const projectedMonthlyRevenue = calculateRevenue(selectedPlan, monthlyVolumeUsd);
  const projectedAnnualRevenue = projectedMonthlyRevenue * 12;
  const salesEmail = process.env.NEXT_PUBLIC_SALES_EMAIL ?? "sales@stellaragent.dev";

  function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(`StellarAgent ${selectedPlan.name} plan inquiry`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company}`,
        `Interested plan: ${selectedPlan.name}`,
        `Estimated monthly volume: ${formatUsd(Number(targetVolume) || 0)}`,
        "",
        "Please reply with a plan recommendation and onboarding steps."
      ].join("\n")
    );

    setLeadStatus("Opening your email client with a prefilled request.");
    window.location.href = `mailto:${salesEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="section grid grid--two">
      <article className="panel revenue-panel">
        <div className="panel__header">
          <div>
            <p className="launchpad__eyebrow">Monetization</p>
            <h2>Price on value, not on vague usage.</h2>
            <p className="subtle">
              Charge a subscription plus a transaction take rate. That gives you predictable MRR and upside as customers scale.
            </p>
          </div>
        </div>

        <div className="pricing-grid">
          {plans.map((plan) => {
            const active = plan.name === selectedPlan.name;

            return (
              <button
                key={plan.name}
                type="button"
                className={`pricing-card ${active ? "pricing-card--active" : ""}`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="pricing-card__top">
                  <div>
                    <p className="pricing-card__name">{plan.name}</p>
                    <p className="pricing-card__price">
                      {formatUsd(plan.price)}
                      <span>/mo</span>
                    </p>
                  </div>
                  {plan.name === "Pro" ? <span className="pricing-card__badge">Best value</span> : null}
                </div>
                <p className="pricing-card__copy">{plan.description}</p>
                <ul className="pricing-card__list">
                  <li>{plan.agents}</li>
                  <li>{(plan.feeBps / 100).toFixed(2)}% take rate</li>
                  <li>API key hashing and server-side validation</li>
                </ul>
              </button>
            );
          })}
        </div>

        <div className="revenue-slider">
          <div className="revenue-slider__header">
            <div>
              <p className="metric-card__label">Monthly payment volume</p>
              <p className="metric-card__value">{formatUsd(monthlyVolumeUsd)}</p>
            </div>
            <div className="revenue-slider__chip">{selectedPlan.name} selected</div>
          </div>
          <input
            className="revenue-slider__input"
            type="range"
            min={0}
            max={500_000}
            step={1_000}
            value={monthlyVolumeUsd}
            onChange={(event) => setMonthlyVolumeUsd(Number(event.currentTarget.value))}
          />
          <div className="revenue-slider__ticks">
            <span>$0</span>
            <span>$250k</span>
            <span>$500k+</span>
          </div>
        </div>

        <div className="revenue-stats">
          <div className="mini-card">
            <p className="mini-card__label">Projected MRR</p>
            <p className="metric-card__value">{formatUsd(projectedMonthlyRevenue)}</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Projected ARR</p>
            <p className="metric-card__value">{formatUsd(projectedAnnualRevenue)}</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Recommended motion</p>
            <p className="revenue-panel__text">
              Start self-serve on Starter, then upsell Pro once the customer crosses meaningful payment volume.
            </p>
          </div>
        </div>
      </article>

      <aside className="panel revenue-panel">
        <div className="panel__header">
          <div>
            <p className="launchpad__eyebrow">Sales funnel</p>
            <h3>Turn interest into a qualified lead.</h3>
            <p className="subtle">
              No dead-end CTA. Every pricing page click should either start onboarding or create a sales conversation.
            </p>
          </div>
        </div>

        <form className="lead-form" onSubmit={handleLeadSubmit}>
          <label className="launchpad__field">
            <span>Name</span>
            <input className="launchpad__input" value={name} onChange={(event) => setName(event.currentTarget.value)} placeholder="Your name" />
          </label>
          <label className="launchpad__field">
            <span>Email</span>
            <input className="launchpad__input" type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} placeholder="you@company.com" />
          </label>
          <label className="launchpad__field">
            <span>Company</span>
            <input className="launchpad__input" value={company} onChange={(event) => setCompany(event.currentTarget.value)} placeholder="Company name" />
          </label>
          <label className="launchpad__field">
            <span>Estimated monthly volume</span>
            <input
              className="launchpad__input"
              value={targetVolume}
              onChange={(event) => setTargetVolume(event.currentTarget.value)}
              placeholder="25000"
            />
          </label>

          <div className="lead-form__cta">
            <button className="button button--primary" type="submit">
              Request {selectedPlan.name}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setSelectedPlan(defaultPlan);
                setLeadStatus("Pro is the default recommended plan.");
              }}
            >
              Reset to Pro
            </button>
          </div>
        </form>

        <div className="revenue-benefits">
          <div className="mini-card">
            <p className="mini-card__label">Why this works</p>
            <p>Subscription revenue covers support and infrastructure. The take rate scales with customer success.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Next step</p>
            <p>Use the onboarding flow to spin up a wallet, then route paid transactions through the platform fee engine.</p>
          </div>
        </div>

        {leadStatus ? <p className="revenue-panel__status">{leadStatus}</p> : null}
      </aside>
    </section>
  );
}
