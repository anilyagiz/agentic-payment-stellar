import Link from "next/link";
import { FreighterDemo } from "@/components/FreighterDemo";

const stats = [
  { value: "47", label: "Active Agents", suffix: "+" },
  { value: "$12.4K", label: "Volume Processed", suffix: "" },
  { value: "0.30", label: "Fee Rate", suffix: "%" },
  { value: "< 5s", label: "Settlement Time", suffix: "" },
];

const features = [
  {
    icon: "⚡",
    title: "Instant Settlement",
    body: "Payments settle in under 5 seconds on Stellar. No batching, no delays.",
  },
  {
    icon: "🔀",
    title: "Automatic Fee Split",
    body: "Every payment atomically routes platform fees to your treasury in a single transaction.",
  },
  {
    icon: "🛡️",
    title: "Fee Sponsorship",
    body: "Wrap transactions in fee-bumps so your users never need to hold XLM for gas.",
  },
  {
    icon: "📊",
    title: "Full Observability",
    body: "Every transaction is indexed with real-time dashboards, earnings tracking, and agent metrics.",
  },
  {
    icon: "🤖",
    title: "Agent Tool Manifest",
    body: "Expose payment tools to AI agents via a standardized JSON manifest. MCP-ready.",
  },
  {
    icon: "🔑",
    title: "Enterprise Security",
    body: "SHA-256 key hashing, rate limiting, CORS, request validation, and timing-safe auth.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect",
    body: "Link your Freighter wallet with one click. No seed phrases exposed.",
  },
  {
    num: "02",
    title: "Configure",
    body: "Register your agent, set fee splits, and define payment rules via the SDK.",
  },
  {
    num: "03",
    title: "Transact",
    body: "Sign and submit payments. Fees split atomically. Everything indexed automatically.",
  },
];

const integrations = [
  { name: "Freighter", desc: "Browser wallet" },
  { name: "Horizon", desc: "Stellar API" },
  { name: "Soroban RPC", desc: "Smart contracts" },
  { name: "PostgreSQL", desc: "Transaction index" },
  { name: "Vercel", desc: "Edge deployment" },
  { name: "Upstash", desc: "Rate limiting" },
];

export default function LandingPage() {
  return (
    <main className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav" id="main-nav">
        <div className="landing-nav__inner">
          <div className="landing-nav__brand">
            <span className="landing-nav__logo">◈</span>
            <span className="landing-nav__name">StellarAgent</span>
          </div>
          <div className="landing-nav__links">
            <Link href="/pricing" className="landing-nav__link">Pricing</Link>
            <Link href="/open-core" className="landing-nav__link">Open Core</Link>
            <Link href="/demo/agent" className="landing-nav__link">Agent Demo</Link>
            <Link href="/dashboard" className="landing-nav__link landing-nav__link--cta">
              Dashboard →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero__glow" />
        <div className="landing-hero__glow2" />
        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            <span className="landing-hero__badge-dot" />
            Built on Stellar Network
          </div>
          <h1 className="landing-hero__title">
            Programmable<br />money rails for<br />
            <span className="landing-hero__accent">agentic AI</span>
          </h1>
          <p className="landing-hero__desc">
            The payment infrastructure powering autonomous agent-to-agent and agent-to-human 
            transactions. Deterministic fee splitting, sponsored transactions, and full 
            observability — all on Stellar.
          </p>
          <div className="landing-hero__actions">
            <a href="#demo" className="button button--primary button--lg" id="hero-try-btn">
              Try Live Demo
            </a>
            <Link href="/dashboard" className="button button--glass button--lg" id="hero-dashboard-btn">
              Open Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="landing-stats" id="stats">
        {stats.map((s) => (
          <div key={s.label} className="landing-stats__item">
            <span className="landing-stats__value">
              {s.value}
              {s.suffix && <span className="landing-stats__suffix">{s.suffix}</span>}
            </span>
            <span className="landing-stats__label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Live Demo ── */}
      <section className="landing-section" id="demo">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Live Demo</span>
          <h2 className="landing-section__title">Send real XLM. Right now.</h2>
          <p className="landing-section__desc">
            Connect your Freighter wallet and experience the payment flow firsthand. 
            This is mainnet — real funds, real settlement.
          </p>
        </div>
        <FreighterDemo />
      </section>

      {/* ── Features ── */}
      <section className="landing-section" id="features">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Features</span>
          <h2 className="landing-section__title">Everything you need to move money</h2>
        </div>
        <div className="landing-features">
          {features.map((f) => (
            <article key={f.title} className="landing-feature-card">
              <span className="landing-feature-card__icon">{f.icon}</span>
              <h3 className="landing-feature-card__title">{f.title}</h3>
              <p className="landing-feature-card__body">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="landing-section" id="how-it-works">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">How it Works</span>
          <h2 className="landing-section__title">Three steps to autonomous payments</h2>
        </div>
        <div className="landing-steps">
          {steps.map((s, i) => (
            <div key={s.num} className="landing-step">
              <div className="landing-step__num">{s.num}</div>
              <h3 className="landing-step__title">{s.title}</h3>
              <p className="landing-step__body">{s.body}</p>
              {i < steps.length - 1 && <div className="landing-step__connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── Integrations ── */}
      <section className="landing-section" id="integrations">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Integrations</span>
          <h2 className="landing-section__title">Built with the best</h2>
        </div>
        <div className="landing-integrations">
          {integrations.map((i) => (
            <div key={i.name} className="landing-integration">
              <span className="landing-integration__name">{i.name}</span>
              <span className="landing-integration__desc">{i.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta" id="final-cta">
        <div className="landing-cta__glow" />
        <h2 className="landing-cta__title">Ready to automate payments?</h2>
        <p className="landing-cta__desc">
          Start building with StellarAgent today. Open-core SDK, 
          transparent pricing, and production-ready infrastructure.
        </p>
        <div className="landing-cta__actions">
          <Link href="/dashboard" className="button button--primary button--lg">
            Launch Dashboard
          </Link>
          <Link href="/pricing" className="button button--glass button--lg">
            View Pricing
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer" id="footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <span className="landing-nav__logo">◈</span>
            <span className="landing-nav__name">StellarAgent</span>
            <p className="landing-footer__tagline">
              Autonomous payments for autonomous agents.
            </p>
          </div>
          <div className="landing-footer__links">
            <div className="landing-footer__col">
              <h4>Product</h4>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/open-core">Open Core</Link>
              <Link href="/demo/agent">Agent Demo</Link>
            </div>
            <div className="landing-footer__col">
              <h4>Resources</h4>
              <a href="/api/tools">API Reference</a>
              <a href="/api/health">Health Check</a>
              <a href="https://github.com/anilyagiz/agentic-payment-stellar" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
            <div className="landing-footer__col">
              <h4>Network</h4>
              <a href="https://stellar.expert/explorer/public" target="_blank" rel="noopener noreferrer">Stellar Expert</a>
              <a href="https://horizon.stellar.org" target="_blank" rel="noopener noreferrer">Horizon API</a>
              <a href="https://freighter.app" target="_blank" rel="noopener noreferrer">Freighter Wallet</a>
            </div>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <span>© 2026 StellarAgent. Built on Stellar.</span>
        </div>
      </footer>
    </main>
  );
}
