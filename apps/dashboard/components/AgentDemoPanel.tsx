"use client";

import { FormEvent, useState } from "react";

type AgentDemoOutcome =
  | { kind: "quote"; quote: { amount: string; feeBps: number; fee: string; netAmount: string; total: string } }
  | { kind: "payment"; payment: { txHash: string; amount: string; fee: string; status?: string } }
  | { kind: "sponsored"; txHash: string }
  | { kind: "blocked"; reason: string };

type AgentDemoResponse = {
  network: string;
  result: {
    manifest: {
      tools: Array<{ name: string; tier: string; description: string }>;
      openCore: { coreTools: string[]; paidTools: string[] };
    };
    plan: {
      source: "llm" | "heuristic";
      toolName: string;
      rationale: string;
      input: Record<string, unknown>;
    };
    outcome: AgentDemoOutcome;
  };
};

async function postJson<T>(path: string, body: Record<string, string | boolean | undefined>) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload && payload.error
      ? payload.error
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function AgentDemoPanel() {
  const [task, setTask] = useState("Pay 0.5 XLM to the creator wallet and quote fees first.");
  const [amount, setAmount] = useState("0.5");
  const [destination, setDestination] = useState("");
  const [memo, setMemo] = useState("Demo payment");
  const [useLlm, setUseLlm] = useState(true);
  const [llmApiKey, setLlmApiKey] = useState("");
  const [llmModel, setLlmModel] = useState("gpt-4o-mini");
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<AgentDemoResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await postJson<AgentDemoResponse>("/api/agent-demo", {
        task,
        amount,
        destination,
        memo,
        useLlm,
        llmApiKey: llmApiKey || undefined,
        llmModel
      });
      setResult(response);
      setStatus(`Ran ${response.result.plan.source} planner on ${response.network}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Agent demo failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section grid grid--two">
      <article className="panel">
        <div className="panel__header">
          <div>
            <p className="launchpad__eyebrow">Agent demo</p>
            <h2>LLM plan, tool manifest, and payment execution</h2>
            <p className="subtle">
              Give the agent a goal. The planner chooses a tool from the manifest, then the SDK executes the request.
            </p>
          </div>
        </div>

        <form className="launchpad__form" onSubmit={handleSubmit}>
          <label className="launchpad__field">
            <span>Task</span>
            <textarea
              className="launchpad__input"
              value={task}
              onChange={(event) => setTask(event.currentTarget.value)}
              rows={4}
            />
          </label>
          <label className="launchpad__field">
            <span>Amount</span>
            <input className="launchpad__input" value={amount} onChange={(event) => setAmount(event.currentTarget.value)} />
          </label>
          <label className="launchpad__field">
            <span>Destination</span>
            <input
              className="launchpad__input"
              value={destination}
              onChange={(event) => setDestination(event.currentTarget.value)}
              placeholder="G... recipient public key"
            />
          </label>
          <label className="launchpad__field">
            <span>Memo</span>
            <input className="launchpad__input" value={memo} onChange={(event) => setMemo(event.currentTarget.value)} />
          </label>
          <label className="launchpad__field">
            <span>OpenAI API key</span>
            <input
              className="launchpad__input"
              type="password"
              value={llmApiKey}
              onChange={(event) => setLlmApiKey(event.currentTarget.value)}
              placeholder="Optional - falls back to heuristic planning"
            />
          </label>
          <label className="launchpad__field">
            <span>Model</span>
            <input className="launchpad__input" value={llmModel} onChange={(event) => setLlmModel(event.currentTarget.value)} />
          </label>
          <label className="launchpad__field" style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
            <input type="checkbox" checked={useLlm} onChange={(event) => setUseLlm(event.currentTarget.checked)} />
            <span>Use LLM planner</span>
          </label>

          <div className="launchpad__result-actions">
            <button className="button button--primary" type="submit" disabled={loading}>
              {loading ? "Running..." : "Run demo"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setTask("Quote a payment, then send 0.5 XLM to the destination wallet.");
                setAmount("0.5");
                setMemo("Demo payment");
                setUseLlm(true);
              }}
            >
              Load sample
            </button>
          </div>
        </form>

        {status ? <p className="revenue-panel__status">{status}</p> : null}
      </article>

      <aside className="panel">
        <div className="panel__header">
          <div>
            <h3>Execution result</h3>
            <p className="subtle">This is the output your agent runtime would inspect after tool execution.</p>
          </div>
        </div>

        {result ? (
          <div className="stack">
            <div className="mini-card">
              <p className="mini-card__label">Planner</p>
              <p>{result.result.plan.source} selected <strong>{result.result.plan.toolName}</strong></p>
              <p className="footer-note">{result.result.plan.rationale}</p>
            </div>

            <div className="mini-card">
              <p className="mini-card__label">Manifest</p>
              <p>{result.result.manifest.openCore.coreTools.join(", ")}</p>
              <p className="footer-note">Paid tools: {result.result.manifest.openCore.paidTools.join(", ")}</p>
            </div>

            <div className="mini-card">
              <p className="mini-card__label">Outcome</p>
              {result.result.outcome.kind === "quote" ? (
                <div className="stack">
                  <p>Fee: {result.result.outcome.quote.fee}</p>
                  <p>Net: {result.result.outcome.quote.netAmount}</p>
                  <p>Total: {result.result.outcome.quote.total}</p>
                </div>
              ) : result.result.outcome.kind === "payment" ? (
                <div className="stack">
                  <p>Tx hash: {result.result.outcome.payment.txHash}</p>
                  <p>Fee: {result.result.outcome.payment.fee}</p>
                  <p>Status: {result.result.outcome.payment.status ?? "submitted"}</p>
                </div>
              ) : result.result.outcome.kind === "sponsored" ? (
                <div className="stack">
                  <p>Sponsored tx hash: {result.result.outcome.txHash}</p>
                </div>
              ) : (
                <p>{result.result.outcome.reason}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mini-card">
            <p className="mini-card__label">Ready</p>
            <p>Run the demo to see the planner choose a tool and the SDK execute it.</p>
          </div>
        )}
      </aside>
    </section>
  );
}
