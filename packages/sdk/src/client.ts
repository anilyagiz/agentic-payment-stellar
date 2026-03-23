import { StellarAgentConfig, PaymentParams, PaymentResult } from "./types";
import { pay } from "./pay";
import { sponsoredPay } from "./feeBump";
import { createRpcServer } from "./rpc";
import { ensureSecretKey } from "./utils";
import { Keypair } from "@stellar/stellar-sdk";

export class StellarAgentClient {
  constructor(private readonly config: StellarAgentConfig) {}

  async pay(params: PaymentParams): Promise<PaymentResult> {
    return pay(params, this.config);
  }

  async sponsoredPay(innerTxXdr: string, sponsorSecret: string): Promise<string> {
    return sponsoredPay(innerTxXdr, sponsorSecret, this.config.network, this.config.rpcUrl);
  }

  async balance(): Promise<string> {
    ensureSecretKey(this.config.secretKey);
    const server = createRpcServer(this.config.network, this.config.rpcUrl);
    const keypair = Keypair.fromSecret(this.config.secretKey);
    const account = await server.getAccount(keypair.publicKey());
    const native = account.balances.find((balance) => balance.asset_type === "native");
    return native?.balance ?? "0";
  }
}

