import { prisma } from "@/lib/db";
import { TransactionTable } from "@/components/TransactionTable";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { submittedAt: "desc" },
    take: 100
  });

  return (
    <section className="section panel">
      <div className="panel__header">
        <div>
          <h2>Transactions</h2>
          <p className="subtle">Stored transfers, confirmation state, and fee accounting.</p>
        </div>
      </div>
      <TransactionTable rows={transactions} />
    </section>
  );
}
