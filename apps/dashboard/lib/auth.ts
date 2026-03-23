import crypto from "node:crypto";
import { prisma } from "./db";
import { getApiKeyPepper } from "./config";

export function generateApiKey() {
  const raw = `sa_${crypto.randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 12);
  return {
    apiKey: raw,
    apiKeyPrefix: prefix,
    apiKeyHash: hashApiKey(raw)
  };
}

export function hashApiKey(apiKey: string) {
  return crypto.createHash("sha256").update(`${apiKey}:${getApiKeyPepper()}`).digest("hex");
}

export async function authenticateApiKey(apiKey: string | null) {
  if (!apiKey) return null;

  const prefix = apiKey.slice(0, 12);
  const agent = await prisma.agent.findUnique({
    where: { apiKeyPrefix: prefix },
    include: {
      customer: true
    }
  });
  if (!agent) return null;

  const incoming = hashApiKey(apiKey);
  const stored = agent.apiKeyHash;
  const left = Buffer.from(incoming, "hex");
  const right = Buffer.from(stored, "hex");

  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
    return null;
  }

  return agent;
}
