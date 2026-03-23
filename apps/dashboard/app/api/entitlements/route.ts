import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/auth";
import { getEntitlements } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);

  return NextResponse.json({
    authenticated: Boolean(agent),
    entitlements: getEntitlements(agent?.customer?.plan)
  });
}
