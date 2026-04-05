import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";
import { prisma } from "@/lib/db";
import { generateApiKey } from "@/lib/auth";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";
import { CustomerStatus } from "@prisma/client";
import { upsertCustomer } from "@/lib/customers";

const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  company: z.string().min(1).max(120).optional(),
  plan: z.string().min(1).max(40).optional(),
  monthlyVolumeUsd: z.string().min(1).max(32).optional(),
  source: z.string().min(1).max(80).optional(),
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
  const rateLimit = await consumeRateLimit(clientKey, 8, 15 * 60 * 1000);
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

  let agent: { id: string; publicKey: string; createdAt: Date };
  try {
    agent = await prisma.agent.create({
      data: {
        name: payload.data.name.trim(),
        publicKey: payload.data.publicKey.trim(),
        apiKeyHash,
        apiKeyPrefix
      }
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Agent already registered for this public key" }, { status: 409 });
    }
    throw error;
  }

  try {
    await upsertCustomer({
      name: payload.data.name,
      email: payload.data.email,
      company: payload.data.company,
      plan: payload.data.plan,
      monthlyVolumeUsd: payload.data.monthlyVolumeUsd,
      status: CustomerStatus.active,
      source: payload.data.source ?? "registration",
      walletPublicKey: payload.data.publicKey,
      agentId: agent.id
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Customer record already exists for this wallet or email" }, { status: 409 });
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
