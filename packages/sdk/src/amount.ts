import { StellarAgentError } from "./errors";

const STROOPS_PER_XLM = 10_000_000n;

function normalizeDecimal(input: string): string {
  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new StellarAgentError("INVALID_AMOUNT", `Invalid XLM amount: ${input}`);
  }
  return trimmed;
}

export function parseXlmToStroops(amount: string): bigint {
  const normalized = normalizeDecimal(amount);
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > 7) {
    throw new StellarAgentError("INVALID_AMOUNT", "Amount exceeds 7 decimal places");
  }
  const paddedFraction = `${fraction}${"0".repeat(7 - fraction.length)}`;
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(paddedFraction);
}

export function formatStroops(stroops: bigint): string {
  const negative = stroops < 0n;
  const abs = negative ? -stroops : stroops;
  const whole = abs / STROOPS_PER_XLM;
  const fraction = abs % STROOPS_PER_XLM;
  const fractionText = fraction.toString().padStart(7, "0").replace(/0+$/, "");
  const result = fractionText ? `${whole.toString()}.${fractionText}` : whole.toString();
  return negative ? `-${result}` : result;
}

export function calculateFeeStroops(amount: string, feeBps: number): bigint {
  if (!Number.isFinite(feeBps) || feeBps < 0) {
    throw new StellarAgentError("INVALID_FEE", "feeBps must be a non-negative number");
  }

  const amountStroops = parseXlmToStroops(amount);
  if (amountStroops === 0n) return 0n;

  const basisPoints = BigInt(Math.round(feeBps));
  const numerator = amountStroops * basisPoints;
  const fee = (numerator + 9_999n) / 10_000n;
  return fee;
}

export function netAmountStroops(amount: string, feeBps: number): bigint {
  const total = parseXlmToStroops(amount);
  const fee = calculateFeeStroops(amount, feeBps);
  if (fee >= total) {
    throw new StellarAgentError("AMOUNT_TOO_SMALL", "Fee must be smaller than amount");
  }
  return total - fee;
}
