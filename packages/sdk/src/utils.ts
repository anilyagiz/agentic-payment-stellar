import { Keypair, Networks, StrKey } from "@stellar/stellar-sdk";
import { StellarAgentError } from "./errors";

export function isValidPublicKey(value: string): boolean {
  return StrKey.isValidEd25519PublicKey(value);
}

export function ensurePublicKey(value: string, label = "public key"): string {
  if (!isValidPublicKey(value)) {
    throw new StellarAgentError("INVALID_ADDRESS", `Invalid ${label}`);
  }

  return value;
}

export function ensureSecretKey(value: string): string {
  try {
    Keypair.fromSecret(value);
    return value;
  } catch {
    throw new StellarAgentError("INVALID_SECRET", "Invalid secret key");
  }
}

export function networkPassphrase(network: "testnet" | "mainnet"): string {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

export function rpcUrlForNetwork(network: "testnet" | "mainnet", rpcUrl?: string): string {
  if (rpcUrl) return rpcUrl;
  return network === "mainnet"
    ? "https://mainnet.stellar.org"
    : "https://soroban-testnet.stellar.org";
}
