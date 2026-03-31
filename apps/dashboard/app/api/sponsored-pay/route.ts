import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { xdr } from "@stellar/stellar-sdk";
import { sponsoredPay } from "stellaragent-sdk";
import { authenticateApiKey } from "@/lib/auth";
import { resolveNetwork } from "@/lib/stellar";
import { getSponsorSecret } from "@/lib/config";
import { hasFeature } from "@/lib/entitlements";

function isValidXdr(value: string): boolean {
  try {
    xdr.TransactionEnvelope.fromXDR(value, "base64");
    return true;
  } catch {
    return false;
  }
}

const SponsoredPaySchema = z.object({
  innerTxXdr: z.string().refine(isValidXdr, {
    message: "Invalid XDR format - must be valid base64 encoded transaction envelope"
  }),
  network: z.enum(["testnet", "mainnet"]).optional()
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasFeature(agent.customer?.plan, "sponsored-pay")) {
    return NextResponse.json(
      {
        error: "Sponsored payments are a paid feature",
        upgrade: "Pro"
      },
      { status: 402 }
    );
  }

  const body = SponsoredPaySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload", issues: body.error.flatten() }, { status: 400 });
  }

  const network = body.data.network ?? resolveNetwork();
  const sponsorSecret = getSponsorSecret();
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
