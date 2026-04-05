import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAgentDemo } from "stellaragent-sdk";
import { resolveNetwork, resolveRpcUrl, getDemoAgentSecret } from "@/lib/config";
import { getSponsorSecret } from "@/lib/config";
import { recordAgentEvent } from "@/lib/agent-events";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const AgentDemoSchema = z.object({
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
  const rateLimit = await consumeRateLimit(`agent-demo:${getClientIp(req)}`, 10, 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many demo requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
        }
      }
    );
  }

  const body = AgentDemoSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid payload", issues: body.error.flatten() }, { status: 400 });
  }

  const network = resolveNetwork();
  const demoSecret = getDemoAgentSecret();
  const sponsorSecret = getSponsorSecret() ?? undefined;

  const result = await runAgentDemo(
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
      secretKey: demoSecret ?? "",
      ...(sponsorSecret ? { sponsorSecret } : {}),
      network,
      rpcUrl: resolveRpcUrl(network)
    }
  );

  try {
    await recordAgentEvent({
      kind: "agent_demo",
      source: "demo",
      toolName: result.plan.toolName,
      status: result.outcome.kind,
      summary: `Demo run executed with ${result.plan.source} planning.`,
      network,
      txHash: result.outcome.kind === "payment" ? result.outcome.payment.txHash : result.outcome.kind === "sponsored" ? result.outcome.txHash : null,
      payload: {
        task: body.data.task,
        amount: body.data.amount,
        destination: body.data.destination,
        memo: body.data.memo ?? null,
        plan: result.plan,
        outcome: result.outcome
      }
    });
  } catch {
    // Demo audit logging is best effort.
  }

  return NextResponse.json({
    network,
    result
  });
}
