import { rpc } from "@stellar/stellar-sdk";
import { rpcUrlForNetwork, networkPassphrase } from "./utils";

export function createRpcServer(network: "testnet" | "mainnet", rpcUrl?: string) {
  return new rpc.Server(rpcUrlForNetwork(network, rpcUrl));
}

export function getNetworkPassphrase(network: "testnet" | "mainnet") {
  return networkPassphrase(network);
}

