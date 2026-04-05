import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [transactionCount, earnings] = await Promise.all([
    prisma.transaction.count({ where: { agentId: agent.id } }),
    prisma.platformEarning.findMany({ 
      where: { txHash: { in: await prisma.transaction.findMany({ where: { agentId: agent.id }, select: { txHash: true } }).then(txs => txs.map(t => t.txHash)) } },
      select: { amount: true } 
    })
  ]);

  const totalEarnings = earnings.reduce((sum, row) => sum + Number(row.amount), 0);

  return NextResponse.json({
    agentId: agent.id,
    totalTransactions: transactionCount,
    totalEarningsXLM: totalEarnings.toFixed(7)
  });
}
