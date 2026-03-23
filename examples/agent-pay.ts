import { StellarAgentClient } from "stellaragent-sdk";

async function main() {
  const client = new StellarAgentClient({
    secretKey: process.env.AGENT_SECRET_KEY ?? "",
    sponsorSecret: process.env.SPONSOR_SECRET_KEY,
    network: (process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet") as "testnet" | "mainnet"
  });

  const result = await client.runAgentTask({
    task: "Pay 0.5 XLM to the creator wallet and quote fees first.",
    amount: "0.5",
    destination: "G...",
    useLlm: true,
    llm: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini"
    }
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
