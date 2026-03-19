import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import crypto from "node:crypto";
import bip39 from "bip39";

function b64(buf) {
  return Buffer.from(buf).toString("base64");
}

function encryptMnemonicToPayloadB64(mnemonic, passphrase) {
  // AES-256-GCM with PBKDF2-SHA256 derived key (Node-native; works on Node 24 Windows).
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(passphrase, salt, 200_000, 32, "sha256");

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(Buffer.from(mnemonic, "utf8")), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Payload format (versioned):
  // [ 'C','S','E','E','D', version=1, salt(16), iv(12), tag(16), ciphertext(N) ]
  const header = Buffer.from([0x43, 0x53, 0x45, 0x45, 0x44, 0x01]);
  return b64(Buffer.concat([header, salt, iv, tag, ct]));
}

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    const mnemonic = (await rl.question("Enter your 12/24-word mnemonic: ")).trim();
    if (!mnemonic || mnemonic.split(/\s+/).length < 12) {
      throw new Error("Mnemonic looks invalid (expected 12+ words).");
    }
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error("Mnemonic is not a valid BIP39 phrase.");
    }

    const passkey = (await rl.question("Enter a passkey (min 12 chars; do NOT reuse passwords): ")).trim();
    if (passkey.length < 12) throw new Error("Passkey too short (min 12 characters).");

    const payloadB64 = encryptMnemonicToPayloadB64(mnemonic, passkey);

    console.log("");
    console.log("Set these in server/.env (DO NOT COMMIT):");
    console.log(`WDK_SEED_PHRASE_ENCRYPTED_B64=${payloadB64}`);
    console.log(`WDK_SEED_PASSPHRASE=${passkey}`);
    console.log("");
    console.log("Then remove WDK_SEED_PHRASE from server/.env for safer storage.");
  } finally {
    rl.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
