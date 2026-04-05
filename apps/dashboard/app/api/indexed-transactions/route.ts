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

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20") || 20, 100);

  const transactions = await prisma.transaction.findMany({
    where: { agentId: agent.id },
    orderBy: { submittedAt: "desc" },
    take: limit
  });

  return NextResponse.json({
    agentId: agent.id,
    count: transactions.length,
    transactions
  });
}
