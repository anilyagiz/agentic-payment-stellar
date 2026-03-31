import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const rawLimit = url.searchParams.get("limit");
  const parsedLimit = rawLimit ? parseInt(rawLimit, 10) : 20;
  const limit = Math.min(Number.isNaN(parsedLimit) ? 20 : parsedLimit, 100);

  if (!agent.id) {
    return NextResponse.json({ error: "Invalid agent state" }, { status: 500 });
  }

  const events = await prisma.agentEvent.findMany({
    where: { agentId: agent.id },
    orderBy: { createdAt: "desc" },
    take: limit
  });

  return NextResponse.json({
    agentId: agent.id,
    events
  });
}
