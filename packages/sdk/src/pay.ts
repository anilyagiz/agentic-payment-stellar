import { Asset, BASE_FEE, Keypair, Memo, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import { PaymentParams, PaymentResult, StellarAgentConfig } from "./types";
import { calculateFeeStroops, formatStroops, netAmountStroops } from "./amount";
import { StellarAgentError } from "./errors";
import { createRpcServer, getNetworkPassphrase } from "./rpc";
import { ensurePublicKey, ensureSecretKey } from "./utils";

const DEFAULT_FEE_DESTINATION = "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGYWDHEUCG5RCUD3YXPQV3";

function resolveFeeBps(config: StellarAgentConfig): number {
  if (typeof config.feePercent === "number") {
    return Math.round(config.feePercent * 100);
  }
  if (typeof config.feeBps === "number") return config.feeBps;
  return 30;
}

export async function pay(params: PaymentParams, config: StellarAgentConfig): Promise<PaymentResult> {
  if (params.asset && params.asset !== "XLM") {
    throw new StellarAgentError(
      "UNSUPPORTED_ASSET",
      "Classic split payments currently support only native XLM transfers"
    );
  }

  ensureSecretKey(config.secretKey);
  const sourceKeypair = Keypair.fromSecret(config.secretKey);
  const sourcePublicKey = sourceKeypair.publicKey();
  const destination = ensurePublicKey(params.to, "destination");
  const feeDestination = ensurePublicKey(config.feeDestination ?? DEFAULT_FEE_DESTINATION, "fee destination");
  const server = createRpcServer(config.network, config.rpcUrl);

  const sourceAccount = await server.getAccount(sourcePublicKey);
  const feeBps = resolveFeeBps(config);
  const feeStroops = calculateFeeStroops(params.amount, feeBps);
  const netStroops = netAmountStroops(params.amount, feeBps);

  const transaction = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(config.network)
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: formatStroops(netStroops)
      })
    )
    .addOperation(
      Operation.payment({
        destination: feeDestination,
        asset: Asset.native(),
        amount: formatStroops(feeStroops)
      })
    )
    .addMemo(
      params.memo ? Memo.text(params.memo.slice(0, 28)) : Memo.none()
    )
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeypair);

  const sent = await server.sendTransaction(transaction);
  if (sent.status !== "PENDING") {
    throw new StellarAgentError("SUBMISSION_FAILED", `Transaction submission failed: ${sent.status}`);
  }

  const confirmed = await server.pollTransaction(sent.hash, {
    attempts: 5,
    sleepStrategy: () => 1000
  });

  if (confirmed.status !== "SUCCESS") {
    throw new StellarAgentError("TX_FAILED", `Transaction completed with status: ${confirmed.status}`);
  }

  return {
    success: true,
    txHash: confirmed.hash,
    amount: formatStroops(netStroops),
    fee: formatStroops(feeStroops),
    timestamp: new Date().toISOString(),
    ledger: confirmed.latestLedger,
    status: confirmed.status
  };
}
