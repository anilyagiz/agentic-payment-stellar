import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/auth";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  publicKey: z.string().refine((value) => {
    try {
      Keypair.fromPublicKey(value);
      return true;
    } catch {
      return false;
    }
  }, "Invalid Stellar public key")
});

export async function POST(req: NextRequest) {
  const clientKey = `register:${getClientIp(req)}`;
  const rateLimit = consumeRateLimit(clientKey, 8, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const payload = RegisterSchema.safeParse(await req.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload", issues: payload.error.flatten() }, { status: 400 });
  }

  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();

  let agent;
  try {
    agent = await prisma.agent.create({
      data: {
        name: payload.data.name.trim(),
        publicKey: payload.data.publicKey.trim(),
        apiKeyHash,
        apiKeyPrefix
      }
    });
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Agent already registered for this public key" }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({
    agentId: agent.id,
    apiKey,
    publicKey: agent.publicKey,
    createdAt: agent.createdAt
  });
}
