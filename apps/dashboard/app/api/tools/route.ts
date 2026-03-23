import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";
import { createAgentToolManifest } from "stellaragent-sdk";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  const entitlements = getEntitlements(agent?.customer?.plan);
  const manifest = createAgentToolManifest();

  return NextResponse.json({
    authenticated: Boolean(agent),
    plan: entitlements.plan,
    entitlements,
    tools: manifest.tools.map((tool) => ({
      ...tool,
      locked: tool.tier === "pro" && !entitlements.sponsoredPay
    }))
  });
}
