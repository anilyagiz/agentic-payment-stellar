export type StellarNetwork = "testnet" | "mainnet";

export interface StellarAgentConfig {
  secretKey: string;
  network: StellarNetwork;
  rpcUrl?: string;
  feePercent?: number;
  feeBps?: number;
  feeDestination?: string;
  memoPrefix?: string;
}

export interface PaymentParams {
  to: string;
  amount: string;
  asset?: "XLM";
  memo?: string;
  agentId?: string;
}

export interface PaymentResult {
  success: boolean;
  txHash: string;
  amount: string;
  fee: string;
  timestamp: string;
  ledger?: number;
  status?: string;
}

export interface SponsoredPayParams {
  innerTxXdr: string;
  sponsorSecret: string;
  network: StellarNetwork;
}
