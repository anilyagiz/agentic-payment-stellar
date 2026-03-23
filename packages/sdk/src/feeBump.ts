import { BASE_FEE, Keypair, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { StellarAgentError } from "./errors";
import { createRpcServer, getNetworkPassphrase } from "./rpc";
import { ensureSecretKey } from "./utils";

export async function sponsoredPay(
  innerTxXdr: string,
  sponsorSecret: string,
  network: "testnet" | "mainnet",
  rpcUrl?: string
): Promise<string> {
  ensureSecretKey(sponsorSecret);
  const sponsor = Keypair.fromSecret(sponsorSecret);
  const server = createRpcServer(network, rpcUrl);

  const innerTx = new Transaction(innerTxXdr, getNetworkPassphrase(network));
  const feeBid = Number(BASE_FEE) * (innerTx.operations.length + 1);

  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    sponsor,
    String(feeBid),
    innerTx,
    getNetworkPassphrase(network)
  );

  feeBumpTx.sign(sponsor);

  const sent = await server.sendTransaction(feeBumpTx);
  if (sent.status !== "PENDING") {
    throw new StellarAgentError("SUBMISSION_FAILED", `Fee bump submission failed: ${sent.status}`);
  }

  const confirmed = await server.pollTransaction(sent.hash, {
    attempts: 5,
    sleepStrategy: () => 1000
  });

  if (confirmed.status !== "SUCCESS") {
    throw new StellarAgentError("TX_FAILED", `Fee bump completed with status: ${confirmed.status}`);
  }

  return confirmed.txHash;
}
