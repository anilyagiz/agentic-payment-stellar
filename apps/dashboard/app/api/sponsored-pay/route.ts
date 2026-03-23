import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sponsoredPay } from "stellaragent-sdk";
import { authenticateApiKey } from "@/lib/auth";
import { resolveNetwork } from "@/lib/stellar";

const SponsoredPaySchema = z.object({
  innerTxXdr: z.string().min(1),
  network: z.enum(["testnet", "mainnet"]).optional()
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = SponsoredPaySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload", issues: body.error.flatten() }, { status: 400 });
  }

  const network = body.data.network ?? resolveNetwork();
  const sponsorSecret = process.env.SPONSOR_SECRET_KEY;
  if (!sponsorSecret) {
    return NextResponse.json({ error: "Sponsor secret is not configured" }, { status: 500 });
  }

  const txHash = await sponsoredPay(body.data.innerTxXdr, sponsorSecret, network);

  return NextResponse.json({
    txHash,
    sponsored: true,
    agentId: agent.id
  });
}
