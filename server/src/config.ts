/**
 * Backend config from env. Validate required keys at startup.
 */
import "dotenv/config";

const required = ["ALCHEMY_SEPOLIA_URL", "CIRCUIT_REGISTRY_ADDRESS", "CIRCUIT_POOL_ADDRESS", "MOCK_USDT_ADDRESS"] as const;

export const config = {
  wdkSeedPhrase: process.env.WDK_SEED_PHRASE ?? "",
  wdkSeedPhraseEncryptedB64:
    process.env.WDK_SEED_PHRASE_ENCRYPTED_B64 ?? process.env.WDK_SEED_ENTROPY_ENCRYPTED_B64 ?? "",
  wdkSeedPassphrase: process.env.WDK_SEED_PASSPHRASE ?? "",
  alchemySepoliaUrl: process.env.ALCHEMY_SEPOLIA_URL ?? "",
  registryAddress: (process.env.CIRCUIT_REGISTRY_ADDRESS ?? "") as `0x${string}`,
  poolAddress: (process.env.CIRCUIT_POOL_ADDRESS ?? "") as `0x${string}`,
  mockUsdtAddress: (process.env.MOCK_USDT_ADDRESS ?? "") as `0x${string}`,
  /** OpenAI for credit scoring (or use FLOCK_API_KEY + Flock OpenAI-compatible endpoint) */
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  flockApiKey: process.env.FLOCK_API_KEY ?? "",
  /** Flock model e.g. qwen3-30b-a3b-instruct-2507; OpenAI default gpt-4o-mini */
  scoringModel: process.env.SCORING_MODEL ?? "",
  port: parseInt(process.env.PORT ?? "3001", 10),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV ?? "development",
  /** Optional auth for write endpoints (set to require X-API-Key). */
  apiKey: process.env.CIRCUIT_API_KEY ?? "",
  /** Global kill-switch for any on-chain write action. */
  writeEnabled: (process.env.CIRCUIT_WRITE_ENABLED ?? "true").toLowerCase() === "true",
  /** Per-agent cooldown in ms (prevents tx spam). */
  agentActionCooldownMs: parseInt(process.env.CIRCUIT_AGENT_COOLDOWN_MS ?? "60000", 10),
  /** Audit log (JSONL). */
  auditLogPath: process.env.CIRCUIT_AUDIT_LOG_PATH ?? "circuit-audit.jsonl",
  /** Persistent wallet-index map for WDK-derived agent wallets. */
  walletMapPath: process.env.CIRCUIT_WALLET_MAP_PATH ?? ".circuit-wallet-map.json",
  /** Max derivation index scan for recovering older wallets if map is stale. */
  walletScanLimit: parseInt(process.env.CIRCUIT_WALLET_SCAN_LIMIT ?? "200", 10),
  /** Commas-separated list of agentIds for the strategy service to manage autonomously. */
  managedAgentIds: (process.env.CIRCUIT_MANAGED_AGENT_IDS ?? "").split(",").map(s => s.trim()).filter(Boolean),
} as const;

export function assertConfig(): void {
  const missing = required.filter((k) => !(process.env[k] ?? "").trim());
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(", ")}. Copy server/.env.example to server/.env and fill.`);
  }

  const hasRawSeed = !!config.wdkSeedPhrase.trim();
  const hasEncryptedSeed = !!config.wdkSeedPhraseEncryptedB64.trim() && !!config.wdkSeedPassphrase.trim();
  if (!hasRawSeed && !hasEncryptedSeed) {
    throw new Error(
      "Missing WDK seed. Set either (recommended) WDK_SEED_PHRASE_ENCRYPTED_B64 + WDK_SEED_PASSPHRASE, or (dev-only) WDK_SEED_PHRASE."
    );
  }
}
