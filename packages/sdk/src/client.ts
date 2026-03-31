import { StellarAgentConfig, PaymentParams, PaymentResult } from "./types";
import { pay } from "./pay";
import { sponsoredPay } from "./feeBump";
import { createRpcServer } from "./rpc";
import { ensureSecretKey } from "./utils";
import { Keypair } from "@stellar/stellar-sdk";
import { createAgentToolManifest, executeAgentTool } from "./tools";
import { AgentToolManifest } from "./tools";
import { runAgentDemo, AgentDemoInput, AgentDemoRun } from "./demo";

export class StellarAgentClient {
  constructor(private readonly config: StellarAgentConfig) {}

  async pay(params: PaymentParams): Promise<PaymentResult> {
    return pay(params, this.config);
  }

  async sponsoredPay(innerTxXdr: string, sponsorSecret: string): Promise<string> {
    return sponsoredPay(innerTxXdr, sponsorSecret, this.config.network, this.config.rpcUrl);
  }

  tools(): AgentToolManifest {
    return createAgentToolManifest();
  }

  agentTools(): AgentToolManifest {
    return this.tools();
  }

  async runTool(
    toolName: "quote_payment" | "pay" | "sponsored_pay",
    input: Record<string, unknown>
  ) {
    return executeAgentTool(toolName, input, this.config);
  }

  async runAgentTask(input: AgentDemoInput): Promise<AgentDemoRun> {
    return runAgentDemo(input, this.config);
  }

  async balance(): Promise<string> {
    ensureSecretKey(this.config.secretKey);
    const keypair = Keypair.fromSecret(this.config.secretKey);
    const horizonUrl =
      this.config.network === "mainnet"
        ? "https://horizon.stellar.org"
        : "https://horizon-testnet.stellar.org";
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${horizonUrl}/accounts/${keypair.publicKey()}`, {
        signal: controller.signal
      });
      
      if (response.status === 404) {
        return "0";
      }
      
      if (!response.ok) {
        throw new Error(`Horizon API error: ${response.status} ${response.statusText}`);
      }
      
      const account = (await response.json()) as {
        balances?: Array<{ asset_type?: string; balance?: string }>;
      };
      const native = account.balances?.find((balance) => balance.asset_type === "native");
      return native?.balance ?? "0";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Balance check timed out after 10s");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
