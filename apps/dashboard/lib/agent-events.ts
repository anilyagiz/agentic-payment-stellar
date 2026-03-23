import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export type AgentEventInput = {
  agentId?: string | null;
  kind: string;
  source: string;
  toolName: string;
  status: string;
  summary: string;
  network?: string | null;
  txHash?: string | null;
  payload?: unknown;
};

export async function recordAgentEvent(input: AgentEventInput) {
  const payload =
    input.payload === undefined
      ? undefined
      : (JSON.parse(JSON.stringify(input.payload)) as Prisma.InputJsonValue);

  return prisma.agentEvent.create({
    data: {
      agentId: input.agentId ?? null,
      kind: input.kind,
      source: input.source,
      toolName: input.toolName,
      status: input.status,
      summary: input.summary,
      network: input.network ?? null,
      txHash: input.txHash ?? null,
      ...(payload !== undefined ? { payload } : {})
    }
  });
}
