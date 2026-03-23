import { NextRequest, NextResponse } from "next/server";
import { Api } from "@stellar/stellar-sdk/rpc";
import { prisma } from "@/lib/db";
import { rpcServer, resolveNetwork } from "@/lib/stellar";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-indexer-secret");
  if (!secret || secret !== process.env.INDEXER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const network = resolveNetwork();
  const server = rpcServer();
  const pending = await prisma.transaction.findMany({
    where: { status: { in: ["pending", "submitted"] } },
    take: 50
  });

  const updates: Array<{ txHash: string; status: string }> = [];

  for (const row of pending) {
    try {
      const tx = await server.getTransaction(row.txHash);
      const nextStatus = tx.status === Api.GetTransactionStatus.SUCCESS ? "confirmed" : "failed";
      await prisma.transaction.update({
        where: { txHash: row.txHash },
        data: {
          status: nextStatus,
          confirmedAt: nextStatus === "confirmed" ? new Date() : row.confirmedAt
        }
      });

      if (nextStatus === "confirmed") {
        await prisma.platformEarning.upsert({
          where: { txHash: row.txHash },
          create: {
            txHash: row.txHash,
            amount: row.fee,
            network
          },
          update: {}
        });
      }

      updates.push({ txHash: row.txHash, status: nextStatus });
    } catch {
      updates.push({ txHash: row.txHash, status: "unresolved" });
    }
  }

  return NextResponse.json({
    network,
    reconciled: updates.length,
    updates
  });
}
