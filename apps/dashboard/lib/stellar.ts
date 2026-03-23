import { Api, Server } from "@stellar/stellar-sdk/rpc";
import { Networks, Transaction } from "@stellar/stellar-sdk";

export type NetworkName = "testnet" | "mainnet";

export function resolveNetwork(): NetworkName {
  return process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
}

export function rpcUrlFor(network: NetworkName) {
  return process.env.STELLAR_RPC_URL ?? (network === "mainnet"
    ? "https://mainnet.stellar.org"
    : "https://soroban-testnet.stellar.org");
}

export function networkPassphraseFor(network: NetworkName) {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

export function rpcServer() {
  const network = resolveNetwork();
  return new Server(rpcUrlFor(network));
}

export async function submitAndPoll(tx: Transaction) {
  const server = rpcServer();
  const reply = await server.sendTransaction(tx);
  if (reply.status !== "PENDING") {
    throw new Error(`Submission failed with status ${reply.status}`);
  }

  return server.pollTransaction(reply.hash, {
    attempts: 5,
    sleepStrategy: (_iter: number) => 1000
  });
}

export function isFinalStatus(status: string) {
  return (
    status === Api.GetTransactionStatus.SUCCESS ||
    status === Api.GetTransactionStatus.FAILED ||
    status === Api.GetTransactionStatus.NOT_FOUND
  );
}
