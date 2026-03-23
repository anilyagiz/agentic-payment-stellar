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
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20") || 20, 100);

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
