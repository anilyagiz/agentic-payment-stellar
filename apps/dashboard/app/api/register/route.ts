import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/auth";

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
  const payload = RegisterSchema.safeParse(await req.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload", issues: payload.error.flatten() }, { status: 400 });
  }

  const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();

  const agent = await prisma.agent.create({
    data: {
      name: payload.data.name,
      publicKey: payload.data.publicKey,
      apiKeyHash,
      apiKeyPrefix
    }
  });

  return NextResponse.json({
    agentId: agent.id,
    apiKey,
    publicKey: agent.publicKey,
    createdAt: agent.createdAt
  });
}
