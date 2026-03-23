import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      transactions: {
        select: { id: true },
        take: 1
      }
    }
  });

  return (
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
  );
}
