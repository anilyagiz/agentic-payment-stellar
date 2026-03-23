import Link from "next/link";
import { AgentDemoPanel } from "@/components/AgentDemoPanel";

export default function AgentDemoPage() {
  return (
    <main className="page-shell">
      <section className="hero hero--pricing">
        <div className="hero__eyebrow">Demo day • AI agent</div>
        <h1>Watch a planner choose a payment tool, then execute it.</h1>
        <p>
          This is the live demo path for the product: an LLM reads the tool manifest, selects a tool, and the SDK runs the
          payment or quote against Stellar.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" href={"/open-core" as const}>Open-core model</Link>
          <Link className="button button--secondary" href={"/dashboard" as const}>Open dashboard</Link>
        </div>
      </section>

      <AgentDemoPanel />

      <section className="section panel">
        <h3>How the demo maps to the product</h3>
        <div className="stack">
          <div className="mini-card">
            <p className="mini-card__label">Step 1</p>
            <p>The agent receives the manifest and task instructions.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Step 2</p>
            <p>The planner chooses quote, pay, or sponsored pay.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Step 3</p>
            <p>The SDK executes the tool and returns a result the agent can inspect.</p>
          </div>
          <div className="mini-card">
            <p className="mini-card__label">Live testnet</p>
            <p>Create a funded recipient wallet inside the demo, then run the payment flow against Stellar testnet.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
