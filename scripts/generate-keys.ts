/**
 * Generate Stellar keypairs and secrets for production deployment.
 * Run: npx tsx scripts/generate-keys.ts
 */

import { randomBytes, createHash } from "crypto";

function generateRandomHex(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

function generateApiPepper(): string {
  return generateRandomHex(32);
}

function generateIndexerSecret(): string {
  return generateRandomHex(32);
}

console.log("═══════════════════════════════════════════════════════");
console.log("  StellarAgent — Production Key Generator");
console.log("═══════════════════════════════════════════════════════\n");

console.log("⚠️  STELLAR KEYPARLARI:");
console.log("   Stellar keypair'lerini Stellar Laboratory'den oluşturmalısın:");
console.log("   👉 https://laboratory.stellar.org/\n");
console.log("   1. 'Account Creator' sekmesine git");
console.log("   2. 'Create a keypair' butonuna bas");
console.log("   3. Public Key (G...) ve Secret Key (S...) kaydet");
console.log("   4. Bunu 3 kez tekrarla (platform, sponsor, demo_agent)\n");

console.log("   ┌─────────────────────────────────────────────────┐");
console.log("   │  1. PLATFORM_KEYPAIR:   Platform fee destination │");
console.log("   │  2. SPONSOR_KEYPAIR:    Fee-bump sponsor        │");
console.log("   │  3. DEMO_AGENT_KEYPAIR: Demo agent wallet       │");
console.log("   └─────────────────────────────────────────────────┘\n");

console.log("   ⚡ Mainnet'te bu accountları fund'lamayı unutma!");
console.log("   Platform ve sponsor account'larında XLM bakiyesi olmalı.\n");

console.log("───────────────────────────────────────────────────────\n");

console.log("🔐 AUTO-GENERATED SECRETS:\n");

const apiKeyPepper = generateApiPepper();
const indexerSecret = generateIndexerSecret();

console.log(`   API_KEY_PEPPER=${apiKeyPepper}`);
console.log(`   INDEXER_SECRET=${indexerSecret}\n`);

console.log("───────────────────────────────────────────────────────\n");

console.log("📋 .env.production ŞABLONU:\n");
console.log("┌─────────────────────────────────────────────────────┐");
console.log("│");
console.log(`│  DATABASE_URL=postgresql://...`);
console.log(`│  STELLAR_NETWORK=mainnet`);
console.log(`│  STELLAR_RPC_URL=https://mainnet.stellar.validationcloud.io/v1/...`);
console.log(`│  PLATFORM_PUBLIC_KEY=G...  <-- Stellar Lab'den`);
console.log(`│  PLATFORM_SECRET_KEY=S...  <-- Stellar Lab'den`);
console.log(`│  SPONSOR_SECRET_KEY=S...   <-- Stellar Lab'den`);
console.log(`│  DEMO_AGENT_SECRET_KEY=S... <-- Stellar Lab'den`);
console.log(`│  FEE_BPS=30`);
console.log(`│  API_KEY_PEPPER=${apiKeyPepper}`);
console.log(`│  INDEXER_SECRET=${indexerSecret}`);
console.log(`│  NEXT_PUBLIC_SITE_URL=https://stellaragent.vercel.app`);
console.log("│");
console.log("└─────────────────────────────────────────────────────┘\n");

console.log("═══════════════════════════════════════════════════════");
console.log("  Bu değerleri kopyala ve Vercel dashboard'a yapıştır.");
console.log("═══════════════════════════════════════════════════════\n");
