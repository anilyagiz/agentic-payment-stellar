import { NextResponse } from "next/server";
import { Keypair } from "@stellar/stellar-sdk";

export async function POST() {
  const network = process.env.STELLAR_NETWORK ?? "testnet";
  if (network !== "testnet") {
    return NextResponse.json({ error: "Wallet bootstrap is testnet-only" }, { status: 400 });
  }

  const keypair = Keypair.random();
  await fetch(`https://friendbot.stellar.org/?addr=${keypair.publicKey()}`);

  return NextResponse.json({
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    network,
    warning: "Store the secret key securely. This is returned once."
  });
}
