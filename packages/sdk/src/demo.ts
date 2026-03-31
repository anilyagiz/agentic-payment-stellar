import { StellarAgentConfig } from "./types";
import { AgentToolManifest, createAgentToolManifest, executeAgentTool, quotePayment, PaymentQuote } from "./tools";
import { PaymentResult } from "./types";
import { StellarAgentError } from "./errors";

export type DemoToolName = "quote_payment" | "pay" | "sponsored_pay";

export type AgentDemoInput = {
  task: string;
  amount: string;
  destination: string;
  memo?: string;
  useLlm?: boolean;
  llm?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
};

export type AgentDemoPlan = {
  source: "llm" | "heuristic";
  toolName: DemoToolName;
  rationale: string;
  input: Record<string, unknown>;
};

export type AgentDemoOutcome =
  | { kind: "quote"; quote: PaymentQuote }
  | { kind: "payment"; payment: PaymentResult }
  | { kind: "sponsored"; txHash: string }
  | { kind: "blocked"; reason: string };

export type AgentDemoRun = {
  manifest: AgentToolManifest;
  plan: AgentDemoPlan;
  outcome: AgentDemoOutcome;
};

type LlmPlanResponse = {
  toolName: DemoToolName;
  rationale: string;
  input?: Record<string, unknown>;
};

function stripCodeFences(input: string) {
  return input.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
}

function isToolName(value: unknown): value is DemoToolName {
  return value === "quote_payment" || value === "pay" || value === "sponsored_pay";
}

function createFallbackPlan(input: AgentDemoInput, config: StellarAgentConfig): AgentDemoPlan {
  const lowerTask = input.task.toLowerCase();
  const wantsSponsored = /sponsor|gasless|fee bump|fee-bump/.test(lowerTask);
  const wantsTransfer = /pay|send|transfer|move/.test(lowerTask);
  const canExecutePay = Boolean(config.secretKey);

  if (wantsSponsored) {
    return {
      source: "heuristic",
      toolName: "sponsored_pay",
      rationale: "The task asks for a gasless or sponsored flow.",
      input: {
        innerTxXdr: input.task,
        destination: input.destination,
        amount: input.amount,
        memo: input.memo
      }
    };
  }

  if (wantsTransfer && canExecutePay) {
    return {
      source: "heuristic",
      toolName: "pay",
      rationale: "The task is a direct transfer and a signing key is available.",
      input: {
        to: input.destination,
        amount: input.amount,
        ...(input.memo ? { memo: input.memo } : {})
      }
    };
  }

  return {
    source: "heuristic",
    toolName: "quote_payment",
    rationale: "Defaulting to a quote so the agent can estimate fees before execution.",
    input: {
      amount: input.amount
    }
  };
}

async function requestLlmPlan(
  manifest: AgentToolManifest,
  input: AgentDemoInput,
  llm: NonNullable<AgentDemoInput["llm"]>,
  config: StellarAgentConfig
): Promise<AgentDemoPlan> {
  if (!llm.apiKey) {
    return createFallbackPlan(input, config);
  }

  const endpoint = llm.baseUrl ?? "https://api.openai.com/v1/chat/completions";
  const model = llm.model ?? "gpt-4o-mini";
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llm.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a payment agent planner. Choose exactly one tool from the manifest and return strict JSON only."
          },
          {
            role: "user",
            content: JSON.stringify({
              task: input.task,
              amount: input.amount,
              destination: input.destination,
              memo: input.memo,
              manifest
            })
          }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return createFallbackPlan(input, config);
    }

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    return createFallbackPlan(input, config);
  }

  let parsed: Partial<LlmPlanResponse>;
  try {
    parsed = JSON.parse(stripCodeFences(content)) as Partial<LlmPlanResponse>;
  } catch {
    return createFallbackPlan(input, config);
  }
  if (!isToolName(parsed.toolName)) {
    return createFallbackPlan(input, config);
  }

  return {
    source: "llm",
    toolName: parsed.toolName,
    rationale: typeof parsed.rationale === "string" ? parsed.rationale : "LLM selected this tool.",
    input:
      parsed.input && typeof parsed.input === "object"
        ? parsed.input
        : parsed.toolName === "quote_payment"
          ? { amount: input.amount }
          : parsed.toolName === "sponsored_pay"
            ? {
                innerTxXdr: input.task,
                destination: input.destination,
                amount: input.amount,
                memo: input.memo
              }
            : {
                to: input.destination,
                amount: input.amount,
                ...(input.memo ? { memo: input.memo } : {})
              }
  } catch {
    return createFallbackPlan(input, config);
  } finally {
    clearTimeout(timeout);
  }
}

export async function runAgentDemo(input: AgentDemoInput, config: StellarAgentConfig): Promise<AgentDemoRun> {
  const manifest = createAgentToolManifest();
  const plan = input.useLlm
    ? await requestLlmPlan(manifest, input, input.llm ?? {}, config)
    : createFallbackPlan(input, config);

  try {
    const result = await executeAgentTool(plan.toolName, plan.input, config);
    if (plan.toolName === "quote_payment") {
      return { manifest, plan, outcome: { kind: "quote", quote: result as PaymentQuote } };
    }

    if (plan.toolName === "sponsored_pay") {
      return {
        manifest,
        plan,
        outcome: { kind: "sponsored", txHash: (result as { txHash: string; sponsored: boolean }).txHash }
      };
    }

    return { manifest, plan, outcome: { kind: "payment", payment: result as PaymentResult } };
  } catch (error) {
    return {
      manifest,
      plan,
      outcome: {
        kind: "blocked",
        reason: error instanceof Error ? error.message : "Agent execution failed"
      }
    };
  }
}

export class StellarAgentDemoClient {
  constructor(private readonly config: StellarAgentConfig) {}

  manifest() {
    return createAgentToolManifest();
  }

  async run(input: AgentDemoInput) {
    return runAgentDemo(input, this.config);
  }
}

export const runAgentTask = runAgentDemo;

export class StellarAgentAgentClient extends StellarAgentDemoClient {}
