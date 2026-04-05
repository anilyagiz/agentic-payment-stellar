"use client";

import { useState, useCallback } from "react";

/* ---- Stellar SDK (works in browser) ---- */
import {
  Keypair,
  Asset,
  BASE_FEE,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
  Horizon,
} from "@stellar/stellar-sdk";

/* ---- Freighter ---- */
import {
  isConnected as freighterIsConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

const PLATFORM_FEE_DESTINATION =
  "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGYWDHEUCG5RCUD3YXPQV3";
const FEE_BPS = 30; // 0.30%
const HORIZON_URL = "https://horizon.stellar.org";
const NETWORK_PASSPHRASE = Networks.PUBLIC;

type TxState =
  | { step: "idle" }
  | { step: "connecting" }
  | { step: "connected"; publicKey: string }
  | { step: "signing" }
  | { step: "submitting" }
  | { step: "success"; hash: string; publicKey: string }
  | { step: "error"; message: string; publicKey?: string };

export function FreighterDemo() {
  const [state, setState] = useState<TxState>({ step: "idle" });
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  /* ---- connect wallet ---- */
  const connect = useCallback(async () => {
    setState({ step: "connecting" });
    try {
      const connected = await freighterIsConnected();
      if (!connected.isConnected) {
        setState({
          step: "error",
          message:
            "Freighter extension not found. Install it from freighter.app",
        });
        return;
      }
      const publicKey = await requestAccess();
      if (!publicKey || typeof publicKey !== "object" || !("address" in publicKey)) {
        setState({ step: "error", message: "Wallet access denied" });
        return;
      }
      setState({ step: "connected", publicKey: publicKey.address });
    } catch (e: any) {
      setState({ step: "error", message: e?.message ?? "Connection failed" });
    }
  }, []);

  /* ---- send payment ---- */
  const send = useCallback(async () => {
    if (state.step !== "connected" && state.step !== "success" && state.step !== "error") return;
    const publicKey =
      state.step === "connected"
        ? state.publicKey
        : state.step === "success"
        ? state.publicKey
        : (state as any).publicKey;
    if (!publicKey) return;

    if (!to || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setState({ step: "error", message: "Enter a valid recipient and amount", publicKey });
      return;
    }

    setState({ step: "signing" });

    try {
      const server = new Horizon.Server(HORIZON_URL);
      const sourceAccount = await server.loadAccount(publicKey);

      const totalStroops = BigInt(Math.round(Number(amount) * 1e7));
      const feeStroops = (totalStroops * BigInt(FEE_BPS)) / 10000n;
      const netStroops = totalStroops - feeStroops;

      const formatS = (s: bigint) => {
        const whole = s / 10000000n;
        const frac = s % 10000000n;
        return `${whole}.${frac.toString().padStart(7, "0")}`;
      };

      const txBuilder = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.payment({
            destination: to,
            asset: Asset.native(),
            amount: formatS(netStroops),
          })
        )
        .addOperation(
          Operation.payment({
            destination: PLATFORM_FEE_DESTINATION,
            asset: Asset.native(),
            amount: formatS(feeStroops),
          })
        );

      if (memo) {
        txBuilder.addMemo(Memo.text(memo.slice(0, 28)));
      }

      const tx = txBuilder.setTimeout(180).build();
      const xdr = tx.toXDR();

      /* sign with Freighter */
      const signedResult = await signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      if ((signedResult as any).error) {
        throw new Error((signedResult as any).error);
      }

      const signedXdr =
        typeof signedResult === "string"
          ? signedResult
          : (signedResult as any).signedTxXdr;

      setState({ step: "submitting" });

      const signedTx = TransactionBuilder.fromXDR(
        signedXdr,
        NETWORK_PASSPHRASE
      );

      const result = await server.submitTransaction(signedTx as any);
      setState({
        step: "success",
        hash: (result as any).hash,
        publicKey,
      });
    } catch (e: any) {
      setState({
        step: "error",
        message: e?.message ?? "Transaction failed",
        publicKey,
      });
    }
  }, [state, to, amount, memo]);

  /* ---- UI ---- */
  const isWalletReady =
    state.step === "connected" ||
    state.step === "success" ||
    state.step === "signing" ||
    state.step === "submitting" ||
    (state.step === "error" && (state as any).publicKey);

  const currentKey =
    state.step === "connected"
      ? state.publicKey
      : state.step === "success"
      ? state.publicKey
      : state.step === "error"
      ? (state as any).publicKey
      : null;

  return (
    <div className="demo-container">
      <div className="demo-header">
        <div className="demo-badge">
          <span className="demo-badge__dot" />
          Mainnet
        </div>
        <h2 className="demo-title">Try it now</h2>
        <p className="demo-subtitle">
          Connect your Freighter wallet and send a real XLM payment with
          automatic fee splitting.
        </p>
      </div>

      {!isWalletReady ? (
        <button
          type="button"
          className="button button--primary button--lg"
          onClick={connect}
          disabled={state.step === "connecting"}
          id="connect-wallet-btn"
        >
          {state.step === "connecting" ? (
            <span className="spinner" />
          ) : null}
          {state.step === "connecting"
            ? "Connecting…"
            : "Connect Freighter Wallet"}
        </button>
      ) : (
        <div className="demo-form">
          <div className="demo-connected">
            <span className="demo-connected__dot" />
            <span className="demo-connected__key">
              {currentKey?.slice(0, 6)}…{currentKey?.slice(-4)}
            </span>
          </div>

          <div className="demo-field">
            <label htmlFor="demo-to">Recipient Address</label>
            <input
              id="demo-to"
              className="demo-input"
              placeholder="G..."
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <div className="demo-field">
            <label htmlFor="demo-amount">Amount (XLM)</label>
            <input
              id="demo-amount"
              className="demo-input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="demo-field">
            <label htmlFor="demo-memo">Memo (optional)</label>
            <input
              id="demo-memo"
              className="demo-input"
              placeholder="Payment for service"
              maxLength={28}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {amount && Number(amount) > 0 && (
            <div className="demo-breakdown">
              <div className="demo-breakdown__row">
                <span>Recipient gets</span>
                <span>
                  {(Number(amount) * (1 - FEE_BPS / 10000)).toFixed(4)} XLM
                </span>
              </div>
              <div className="demo-breakdown__row">
                <span>Platform fee ({(FEE_BPS / 100).toFixed(2)}%)</span>
                <span>
                  {(Number(amount) * (FEE_BPS / 10000)).toFixed(4)} XLM
                </span>
              </div>
              <div className="demo-breakdown__row demo-breakdown__row--total">
                <span>Total</span>
                <span>{Number(amount).toFixed(4)} XLM</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="button button--primary button--lg"
            onClick={send}
            disabled={
              state.step === "signing" || state.step === "submitting"
            }
            id="send-payment-btn"
          >
            {state.step === "signing" || state.step === "submitting" ? (
              <span className="spinner" />
            ) : null}
            {state.step === "signing"
              ? "Sign in Freighter…"
              : state.step === "submitting"
              ? "Submitting…"
              : "Send Payment"}
          </button>
        </div>
      )}

      {state.step === "success" && (
        <div className="demo-result demo-result--success">
          <div className="demo-result__icon">✓</div>
          <p className="demo-result__title">Transaction confirmed!</p>
          <a
            className="demo-result__link"
            href={`https://stellar.expert/explorer/public/tx/${state.hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Stellar Expert →
          </a>
          <code className="demo-result__hash">{state.hash}</code>
        </div>
      )}

      {state.step === "error" && (
        <div className="demo-result demo-result--error">
          <p className="demo-result__error">{state.message}</p>
        </div>
      )}
    </div>
  );
}
