const { Keypair } = require("@stellar/stellar-sdk");

const roles = ["PLATFORM", "SPONSOR", "DEMO_AGENT"];

console.log("═══════════════════════════════════════════════════════");
console.log("  Stellar Mainnet Keypairs");
console.log("═══════════════════════════════════════════════════════\n");

roles.forEach((role) => {
  const kp = Keypair.random();
  console.log(`--- ${role} ---`);
  console.log(`${role}_PUBLIC_KEY=${kp.publicKey()}`);
  console.log(`${role}_SECRET_KEY=${kp.secret()}\n`);
});

console.log("═══════════════════════════════════════════════════════");
console.log("  ⚠️  Bu keyleri güvenli bir yerde sakla!");
console.log("  ⚡ Mainnet'te PLATFORM ve SPONSOR account'larını");
console.log("     XLM ile fund'lamayı unutma.");
console.log("═══════════════════════════════════════════════════════");
