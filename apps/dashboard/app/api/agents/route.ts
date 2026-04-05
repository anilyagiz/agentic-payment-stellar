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

  const agents = await prisma.agent.findMany({
    where: { id: agent.id },
    select: {
      id: true,
      name: true,
      publicKey: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      apiKeyPrefix: true,
      apiKeyHash: false
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ agents });
}
