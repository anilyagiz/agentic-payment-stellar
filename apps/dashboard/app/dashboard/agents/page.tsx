import { prisma } from "@/lib/db";
import { AgentEventTable } from "@/components/AgentEventTable";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const [agents, events] = await Promise.all([
    prisma.agent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        transactions: {
          select: { id: true },
          take: 1
        }
      }
    }),
    prisma.agentEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        agentId: true,
        kind: true,
        source: true,
        toolName: true,
        status: true,
        summary: true,
        network: true,
        txHash: true,
        createdAt: true
      }
    })
  ]);

  return (
    <>
      <section className="section grid grid--cards">
        {agents.map((agent) => (
          <article key={agent.id} className="metric-card">
            <div className="metric-card__glow" />
            <p className="metric-card__label">{agent.name}</p>
            <p className="metric-card__value" style={{ fontSize: "1.1rem", lineHeight: 1.45 }}>
              {agent.publicKey.slice(0, 10)}…{agent.publicKey.slice(-8)}
            </p>
            <p className="metric-card__hint">
              {agent.transactions.length} recent transaction(s) • {agent.active ? "active" : "inactive"}
            </p>
          </article>
        ))}
      </section>

      <section className="section panel">
        <div className="panel__header">
          <div>
            <h2>Agent event history</h2>
            <p className="subtle">Audit trail for demo runs, payment requests, and tool executions.</p>
          </div>
        </div>
        <AgentEventTable rows={events} />
      </section>
    </>
  );
}
