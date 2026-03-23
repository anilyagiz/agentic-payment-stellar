const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
const MAINNET_RPC_URL = "https://mainnet.stellar.org";

export type StellarNetworkName = "testnet" | "mainnet";

export function resolveNetwork(): StellarNetworkName {
  return process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
}

export function resolveRpcUrl(network = resolveNetwork()): string {
  return process.env.STELLAR_RPC_URL ?? (network === "mainnet" ? MAINNET_RPC_URL : TESTNET_RPC_URL);
}

export function getApiKeyPepper(): string {
  return process.env.API_KEY_PEPPER ?? "local-dev-pepper";
}

export function getIndexerSecret(): string | null {
  return process.env.INDEXER_SECRET ?? null;
}

export function getSponsorSecret(): string | null {
  return process.env.SPONSOR_SECRET_KEY ?? null;
}

export function getDemoAgentSecret(): string | null {
  return process.env.DEMO_AGENT_SECRET_KEY ?? null;
}

export function getAgentSecret(): string | null {
  return process.env.AGENT_SECRET_KEY ?? process.env.DEMO_AGENT_SECRET_KEY ?? null;
}

export function getSalesEmail(): string {
  return process.env.NEXT_PUBLIC_SALES_EMAIL ?? "sales@stellaragent.dev";
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getRequiredEnvKeys() {
  return ["DATABASE_URL", "API_KEY_PEPPER", "INDEXER_SECRET", "SPONSOR_SECRET_KEY"] as const;
}

export function getMissingEnvKeys(keys = getRequiredEnvKeys()) {
  return keys.filter((key) => !process.env[key]);
}
