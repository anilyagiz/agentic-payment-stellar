import { pay } from "./pay";
import { sponsoredPay } from "./feeBump";
import { StellarAgentConfig, PaymentParams, PaymentResult } from "./types";
import { calculateFeeStroops, formatStroops, parseXlmToStroops } from "./amount";
import { StellarAgentError } from "./errors";

export type ToolTier = "core" | "pro";

export type ToolParameterSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: boolean;
};

export type AgentToolDefinition = {
  name: string;
  description: string;
  tier: ToolTier;
  parameters: ToolParameterSchema;
};

export type PaymentQuote = {
  amount: string;
  feeBps: number;
  fee: string;
  netAmount: string;
  total: string;
};

export type AgentToolManifest = {
  tools: AgentToolDefinition[];
  openCore: {
    coreTools: string[];
    paidTools: string[];
  };
};

export function quotePayment(amount: string, feeBps = 30): PaymentQuote {
  const fee = calculateFeeStroops(amount, feeBps);
  const total = parseXlmToStroops(amount);
  const net = total - fee;

  return {
    amount,
    feeBps,
    fee: formatStroops(fee),
    netAmount: formatStroops(net),
    total: formatStroops(total)
  };
}

export function createAgentToolManifest(): AgentToolManifest {
  return {
    tools: [
      {
        name: "quote_payment",
        description: "Estimate the platform fee and net amount for an XLM payment before execution.",
        tier: "core",
        parameters: {
          type: "object",
          properties: {
            amount: { type: "string", description: "XLM amount, for example 12.5" },
            feeBps: { type: "number", description: "Optional basis points fee override" }
          },
          required: ["amount"],
          additionalProperties: false
        }
      },
      {
        name: "pay",
        description: "Submit a signed native XLM payment transaction and index it on the platform.",
        tier: "core",
        parameters: {
          type: "object",
          properties: {
            to: { type: "string", description: "Recipient public key" },
            amount: { type: "string", description: "XLM amount to send" },
            memo: { type: "string", description: "Optional memo text" },
            asset: { type: "string", enum: ["XLM"], description: "Supported asset type" }
          },
          required: ["to", "amount"],
          additionalProperties: false
        }
      },
      {
        name: "sponsored_pay",
        description: "Wrap an inner transaction in a fee-bump transaction so the platform pays fees.",
        tier: "pro",
        parameters: {
          type: "object",
          properties: {
            innerTxXdr: { type: "string", description: "Signed inner transaction XDR" }
          },
          required: ["innerTxXdr"],
          additionalProperties: false
        }
      }
    ],
    openCore: {
      coreTools: ["quote_payment", "pay"],
      paidTools: ["sponsored_pay"]
    }
  };
}

export async function executeAgentTool(
  toolName: "quote_payment" | "pay" | "sponsored_pay",
  input: Record<string, unknown>,
  config: StellarAgentConfig
): Promise<PaymentResult | PaymentQuote | { txHash: string; sponsored: boolean }> {
  switch (toolName) {
    case "quote_payment":
      return quotePayment(String(input.amount ?? "0"), Number(input.feeBps ?? config.feeBps ?? 30));
    case "pay":
      return pay(
        {
          to: String(input.to ?? ""),
          amount: String(input.amount ?? ""),
          ...(typeof input.memo === "string" ? { memo: input.memo } : {}),
          ...(input.asset === "XLM" ? { asset: "XLM" as const } : {})
        } satisfies PaymentParams,
        config
      );
    case "sponsored_pay":
      if (!config.sponsorSecret) {
        throw new StellarAgentError("MISSING_SPONSOR", "sponsorSecret is required for sponsored payments");
      }
      return {
        txHash: await sponsoredPay(String(input.innerTxXdr ?? ""), config.sponsorSecret, config.network, config.rpcUrl),
        sponsored: true
      };
  }
}
