import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "@stellar/stellar-sdk";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authenticateApiKey } from "@/lib/auth";
import { networkPassphraseFor, resolveNetwork, submitAndPoll } from "@/lib/stellar";

const PaySchema = z.object({
  signedTransactionXdr: z.string().min(1),
  destination: z.string().min(1),
  amount: z.string().min(1),
  fee: z.string().min(1),
  memo: z.string().max(28).optional(),
  network: z.enum(["testnet", "mainnet"]).optional()
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = PaySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload", issues: body.error.flatten() }, { status: 400 });
  }

  const network = body.data.network ?? resolveNetwork();
  const tx = new Transaction(body.data.signedTransactionXdr, networkPassphraseFor(network));
  const source = tx.sourceAccount.accountId();

  if (source !== agent.publicKey) {
    return NextResponse.json({ error: "Transaction source does not match agent" }, { status: 403 });
  }

  const confirmed = await submitAndPoll(tx);

  const transaction = await prisma.transaction.upsert({
    where: { txHash: confirmed.hash },
    create: {
      agentId: agent.id,
      txHash: confirmed.hash,
      sourceAccount: source,
      destination: body.data.destination,
      amount: body.data.amount,
      fee: body.data.fee,
      memo: body.data.memo ?? null,
      network,
      status: confirmed.status === "SUCCESS" ? "confirmed" : "failed",
      operationCount: Number(tx.operations.length),
      confirmedAt: confirmed.status === "SUCCESS" ? new Date() : null
    },
    update: {
      status: confirmed.status === "SUCCESS" ? "confirmed" : "failed",
      confirmedAt: confirmed.status === "SUCCESS" ? new Date() : null
    }
  });

  return NextResponse.json({
    txHash: transaction.txHash,
    status: transaction.status,
    network
  });
}
