import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiKey } from "@/lib/auth";
import { resolveNetwork, resolveRpcUrl, getAgentSecret, getSponsorSecret } from "@/lib/config";
import { hasFeature } from "@/lib/entitlements";
import { runAgentTask } from "stellaragent-sdk";

export const dynamic = "force-dynamic";

const AgentPaySchema = z.object({
  task: z.string().min(8).max(240),
  amount: z.string().min(1).max(32),
  destination: z.string().min(1).max(120),
  memo: z.string().max(28).optional(),
  useLlm: z.boolean().optional(),
  llmApiKey: z.string().min(1).optional(),
  llmBaseUrl: z.string().url().optional(),
  llmModel: z.string().min(1).optional()
});

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const agent = await authenticateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasFeature(agent.customer?.plan, "core-payments")) {
    return NextResponse.json({ error: "Payment execution is not enabled for this plan" }, { status: 402 });
  }

  const body = AgentPaySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload", issues: body.error.flatten() }, { status: 400 });
  }

  const network = resolveNetwork();
  const agentSecret = getAgentSecret();
  if (!agentSecret) {
    return NextResponse.json({ error: "Agent secret is not configured" }, { status: 500 });
  }

  const sponsorSecret = getSponsorSecret() ?? undefined;
  const result = await runAgentTask(
    {
      task: body.data.task,
      amount: body.data.amount,
      destination: body.data.destination,
      ...(body.data.memo ? { memo: body.data.memo } : {}),
      ...(typeof body.data.useLlm === "boolean" ? { useLlm: body.data.useLlm } : {}),
      ...(body.data.llmApiKey || body.data.llmBaseUrl || body.data.llmModel
        ? {
            llm: {
              ...(body.data.llmApiKey ? { apiKey: body.data.llmApiKey } : {}),
              ...(body.data.llmBaseUrl ? { baseUrl: body.data.llmBaseUrl } : {}),
              ...(body.data.llmModel ? { model: body.data.llmModel } : {})
            }
          }
        : {})
    },
    {
      secretKey: agentSecret,
      ...(sponsorSecret ? { sponsorSecret } : {}),
      network,
      rpcUrl: resolveRpcUrl(network)
    }
  );

  return NextResponse.json({
    agentId: agent.id,
    network,
    result
  });
}
