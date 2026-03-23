import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { resolveNetwork } from "@/lib/config";

export async function POST(req: NextRequest) {
  const rateLimit = consumeRateLimit(`wallet-create:${getClientIp(req)}`, 4, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many wallet creation attempts" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const network = resolveNetwork();
  if (network !== "testnet") {
    return NextResponse.json({ error: "Wallet bootstrap is testnet-only" }, { status: 400 });
  }

  const keypair = Keypair.random();
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(`https://friendbot.stellar.org/?addr=${keypair.publicKey()}`, {
      signal: controller.signal
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Friendbot funding failed", status: response.status },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Friendbot is unavailable" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  return NextResponse.json({
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    network,
    warning: "Store the secret key securely. This is returned once."
  });
}
