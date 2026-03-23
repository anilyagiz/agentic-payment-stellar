import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [transactionCount, agentCount, earnings, activeAgents] = await Promise.all([
    prisma.transaction.count(),
    prisma.agent.count(),
    prisma.platformEarning.findMany({ select: { amount: true } }),
    prisma.transaction.groupBy({
      by: ["agentId"],
      where: {
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const totalEarnings = earnings.reduce((sum, row) => sum + Number(row.amount), 0);

  return NextResponse.json({
    totalTransactions: transactionCount,
    totalAgents: agentCount,
    totalEarningsXLM: totalEarnings.toFixed(7),
    activeAgentsLast7Days: activeAgents.length
  });
}
