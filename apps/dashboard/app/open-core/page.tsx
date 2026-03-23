import Link from "next/link";
import { createAgentToolManifest } from "stellaragent-sdk";

const manifest = createAgentToolManifest();

const coreModules = [
  "Payment relay and fee math",
  "API key authentication and hashing",
  "Transaction indexing and monitoring",
  "Customer and lead pipeline",
  "Tool manifest discovery for AI agents"
];

const paidModules = [
  "Sponsored payments / fee bump support",
  "Hosted analytics and dashboarding",
  "Team administration and audit export",
  "Priority support and onboarding",
  "Managed infrastructure and SLA"
];

export default function OpenCorePage() {
  return (
    <main className="page-shell">
      <section className="hero hero--pricing">
        <div className="hero__eyebrow">Open-core model</div>
        <h1>Open the core, monetize the control plane.</h1>
        <p>
          The payment rail stays open source so agents can pay and transact. The hosted layer is where you charge for
          sponsored transactions, analytics, team controls, and managed operations.
        </p>
        <div className="hero__actions">
          <Link className="button button--primary" href="/pricing">See pricing</Link>
          <Link className="button button--secondary" href="/dashboard">Open dashboard</Link>
          <Link className="button button--secondary" href={{ pathname: "/demo/agent" }}>Run agent demo</Link>
          <a className="button button--secondary" href="/api/tools">Tool manifest</a>
        </div>
      </section>

      <section className="section grid grid--two">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Free core</h2>
              <p className="subtle">This is the open-source product surface that drives adoption.</p>
            </div>
          </div>
          <div className="stack">
            {coreModules.map((item) => (
              <div className="mini-card" key={item}>
                <p className="mini-card__label">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h2>Paid expansion</h2>
              <p className="subtle">These are the features that turn usage into revenue.</p>
            </div>
          </div>
          <div className="stack">
            {paidModules.map((item) => (
              <div className="mini-card" key={item}>
                <p className="mini-card__label">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="section panel">
        <div className="panel__header">
          <div>
            <h2>Agent tools</h2>
            <p className="subtle">AI agents can discover exactly what they can call and which tools are locked behind paid plans.</p>
          </div>
        </div>
        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Tier</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {manifest.tools.map((tool) => (
                <tr key={tool.name}>
                  <td>{tool.name}</td>
                  <td>{tool.tier}</td>
                  <td>{tool.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
