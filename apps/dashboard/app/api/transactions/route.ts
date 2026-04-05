import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // CRITICAL FIX: Add authentication
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only return transactions for the authenticated agent
  const transactions = await prisma.transaction.findMany({
    where: { agentId: agent.id },
    orderBy: { submittedAt: "desc" },
    take: 100
  });

  return NextResponse.json({ 
    agentId: agent.id,
    transactions 
  });
}
