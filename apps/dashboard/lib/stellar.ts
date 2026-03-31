import { Api, Server } from "@stellar/stellar-sdk/rpc";
import { Networks, Transaction } from "@stellar/stellar-sdk";
import { resolveNetwork as resolveDashboardNetwork, resolveRpcUrl } from "./config";

export type NetworkName = "testnet" | "mainnet";

export function resolveNetwork(): NetworkName {
  return resolveDashboardNetwork();
}

export function rpcUrlFor(network: NetworkName) {
  return resolveRpcUrl(network);
}

export function networkPassphraseFor(network: NetworkName) {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

export function rpcServer() {
  const network = resolveNetwork();
  return new Server(rpcUrlFor(network));
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

export async function submitAndPoll(tx: Transaction) {
  const server = rpcServer();
  
  const reply = await retryWithBackoff(async () => {
    return await server.sendTransaction(tx);
  }, 3, 500);
  
  if (reply.status !== "PENDING") {
    throw new Error(`Submission failed with status ${reply.status}`);
  }

  return server.pollTransaction(reply.hash, {
    attempts: 10,
    sleepStrategy: (iter: number) => Math.min(1000 * Math.pow(1.5, iter), 10000)
  });
}

export function isFinalStatus(status: string) {
  return (
    status === Api.GetTransactionStatus.SUCCESS ||
    status === Api.GetTransactionStatus.FAILED ||
    status === Api.GetTransactionStatus.NOT_FOUND
  );
}
