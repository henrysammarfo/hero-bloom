/**
 * WDK service: create agent wallets (derived from seed), sign draw/repay to CircuitPool.
 * Account 0 = pool wallet, 1+ = agent wallets. We track wallet address -> account index.
 */
import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createPublicClient, encodeFunctionData, http, type Address, type Hash } from "viem";
import { poolAbi, erc20Abi, mockUsdtAbi } from "../abis.js";
import { config } from "../config.js";

let wdkInstance: ReturnType<WDK["registerWallet"]> | null = null;
let publicClient: ReturnType<typeof createPublicClient> | null = null;
const walletToIndex = new Map<string, number>();
let nextAgentIndex = 1; // 0 reserved for pool
let walletMapLoaded = false;

type WalletMapFile = {
  version: 1;
  entries: Array<{ wallet: string; index: number }>;
};

const walletMapAbsolutePath = path.resolve(process.cwd(), config.walletMapPath);

function getPublicClient() {
  if (!publicClient) {
    publicClient = createPublicClient({
      transport: http(config.alchemySepoliaUrl),
    });
  }
  return publicClient;
}

function resolveSeedPhrase(): string {
  if (config.wdkSeedPhrase.trim()) return config.wdkSeedPhrase.trim();

  const encryptedB64 = config.wdkSeedPhraseEncryptedB64.trim();
  const pass = config.wdkSeedPassphrase.trim();
  if (!encryptedB64 || !pass) throw new Error("Encrypted WDK seed not configured");

  const buf = Buffer.from(encryptedB64, "base64");
  if (buf.length < 6 + 16 + 12 + 16 + 1) throw new Error("Encrypted seed payload too short");
  // Expect header: 'CSEED' + version 1
  if (buf[0] !== 0x43 || buf[1] !== 0x53 || buf[2] !== 0x45 || buf[3] !== 0x45 || buf[4] !== 0x44 || buf[5] !== 0x01) {
    throw new Error("Encrypted seed payload has invalid header/version");
  }
  const salt = buf.subarray(6, 22);
  const iv = buf.subarray(22, 34);
  const tag = buf.subarray(34, 50);
  const ct = buf.subarray(50);

  const key = crypto.pbkdf2Sync(pass, salt, 200_000, 32, "sha256");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  const mnemonic = pt.toString("utf8").trim();
  if (mnemonic.split(/\s+/).length < 12) throw new Error("Decrypted mnemonic invalid");
  return mnemonic;
}

function getWdk() {
  if (!wdkInstance) {
    const seedPhrase = resolveSeedPhrase();
    wdkInstance = new WDK(seedPhrase).registerWallet("ethereum", WalletManagerEvm, {
      provider: config.alchemySepoliaUrl,
    });
  }
  return wdkInstance;
}

async function loadWalletMapIfNeeded(): Promise<void> {
  if (walletMapLoaded) return;
  walletMapLoaded = true;
  try {
    const raw = await readFile(walletMapAbsolutePath, "utf8");
    const parsed = JSON.parse(raw) as WalletMapFile;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) return;
    for (const e of parsed.entries) {
      if (typeof e.wallet === "string" && typeof e.index === "number" && e.index >= 1) {
        walletToIndex.set(e.wallet.toLowerCase(), e.index);
      }
    }
    const maxIdx = Math.max(0, ...Array.from(walletToIndex.values()));
    nextAgentIndex = Math.max(nextAgentIndex, maxIdx + 1);
  } catch {
    // first run / missing file is expected
  }
}

async function persistWalletMap(): Promise<void> {
  await mkdir(path.dirname(walletMapAbsolutePath), { recursive: true });
  const entries = Array.from(walletToIndex.entries())
    .map(([wallet, index]) => ({ wallet, index }))
    .sort((a, b) => a.index - b.index);
  const payload: WalletMapFile = { version: 1, entries };
  await writeFile(walletMapAbsolutePath, JSON.stringify(payload, null, 2), "utf8");
}

async function rememberWalletIndex(wallet: string, index: number): Promise<void> {
  const k = wallet.toLowerCase();
  const prev = walletToIndex.get(k);
  if (prev === index) return;
  walletToIndex.set(k, index);
  nextAgentIndex = Math.max(nextAgentIndex, index + 1);
  await persistWalletMap();
}

async function resolveManagedIndex(wallet: Address): Promise<number | undefined> {
  await loadWalletMapIfNeeded();
  const key = wallet.toLowerCase();
  const cached = walletToIndex.get(key);
  if (cached !== undefined) return cached;

  // Recovery path: derive addresses and re-discover index if map is stale/missing.
  const wdk = getWdk();
  for (let i = 1; i <= config.walletScanLimit; i += 1) {
    const account = await wdk.getAccount("ethereum", i);
    const addr = (await account.getAddress()).toLowerCase();
    if (addr === key) {
      await rememberWalletIndex(addr, i);
      return i;
    }
  }
  return undefined;
}

/**
 * Create a new agent wallet (next derived account). Return its address.
 * Caller must register this address on-chain via CircuitRegistry.registerAgent.
 */
export async function createAgentWallet(): Promise<{ address: string }> {
  await loadWalletMapIfNeeded();
  const wdk = getWdk();
  const account = await wdk.getAccount("ethereum", nextAgentIndex);
  const address = await account.getAddress();
  await rememberWalletIndex(address, nextAgentIndex);
  nextAgentIndex += 1;
  return { address };
}

/**
 * Get all wallet addresses we have ever created/managed.
 */
export async function getAllManagedWallets(): Promise<string[]> {
  await loadWalletMapIfNeeded();
  return Array.from(walletToIndex.keys());
}

/**
 * Get account index for a wallet (only for wallets we created via createAgentWallet).
 */
export function getAccountIndexForWallet(wallet: Address): number | undefined {
  return walletToIndex.get(wallet.toLowerCase());
}

/**
 * Sign and send CircuitPool.draw(agentId, to, amount) from the agent wallet.
 * Agent wallet must be the one registered for agentId on-chain.
 */
export async function signAndSendDraw(
  agentWallet: Address,
  agentId: Hash,
  to: Address,
  amount: bigint
): Promise<{ hash: string }> {
  const idx = await resolveManagedIndex(agentWallet);
  if (idx === undefined) throw new Error("Wallet not managed by this backend. Use createAgentWallet first.");
  const wdk = getWdk();
  const account = await wdk.getAccount("ethereum", idx);
  const data = encodeFunctionData({
    abi: poolAbi,
    functionName: "draw",
    args: [agentId, to, amount],
  });
  const result = await (account as any).sendTransaction({
    to: config.poolAddress,
    value: 0n,
    data,
  });
  return { hash: result.hash };
}

/**
 * Sign and send MockUSDT.approve(pool, amount) then CircuitPool.repay(agentId, amount).
 */
export async function signAndSendRepay(agentWallet: Address, agentId: Hash, amount: bigint): Promise<{ hash: string }> {
  const idx = await resolveManagedIndex(agentWallet);
  if (idx === undefined) throw new Error("Wallet not managed by this backend.");
  const wdk = getWdk();
  const account = await wdk.getAccount("ethereum", idx);
  const client = getPublicClient();

  // 1. Approve pool to spend USDT
  const approveData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [config.poolAddress, amount],
  });
  const approveTx = await (account as any).sendTransaction({
    to: config.mockUsdtAddress,
    value: 0n,
    data: approveData,
  });
  // Wait for approval to be mined before attempting repay (prevents "insufficient allowance" race).
  await client.waitForTransactionReceipt({ hash: approveTx.hash as `0x${string}` });

  // 2. Repay
  const repayData = encodeFunctionData({
    abi: poolAbi,
    functionName: "repay",
    args: [agentId, amount],
  });
  const result = await (account as any).sendTransaction({
    to: config.poolAddress,
    value: 0n,
    data: repayData,
  });
  return { hash: result.hash };
}

/**
 * Sign and send ERC20.transfer(to, amount) from an agent wallet.
 * Used for inter-agent "lending" demos (agent B transfers USDT to agent A).
 */
export async function signAndSendTokenTransfer(
  fromAgentWallet: Address,
  toWallet: Address,
  amount: bigint
): Promise<{ hash: string }> {
  const idx = await resolveManagedIndex(fromAgentWallet);
  if (idx === undefined) throw new Error("Wallet not managed by this backend.");
  if (amount <= 0n) throw new Error("amount must be > 0");
  const wdk = getWdk();
  const account = await wdk.getAccount("ethereum", idx);

  const transferData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [toWallet, amount],
  });

  const result = await (account as any).sendTransaction({
    to: config.mockUsdtAddress,
    value: 0n,
    data: transferData,
  });

  return { hash: result.hash };
}

/**
 * Request MockUSDT faucet to the agent wallet.
 * This provides on-chain USDT to let the agent repay from its "own earned revenue" for demos.
 */
export async function signAndSendRequestFaucet(agentWallet: Address): Promise<{ hash: string }> {
  const idx = await resolveManagedIndex(agentWallet);
  if (idx === undefined) throw new Error("Wallet not managed by this backend.");
  const wdk = getWdk();
  const account = await wdk.getAccount("ethereum", idx);

  const faucetData = encodeFunctionData({
    abi: mockUsdtAbi,
    functionName: "requestFaucet",
    args: [],
  });

  const result = await (account as any).sendTransaction({
    to: config.mockUsdtAddress,
    value: 0n,
    data: faucetData,
  });

  return { hash: result.hash };
}

/**
 * Get USDT balance of an address (via WDK account if we have it, else we could use public client).
 */
export async function getAgentTokenBalance(wallet: Address): Promise<bigint> {
  const idx = await resolveManagedIndex(wallet);
  if (idx === undefined) return 0n;
  const wdk = getWdk();
  const account = await wdk.getAccount("ethereum", idx);
  const balance = await account.getTokenBalance(config.mockUsdtAddress);
  return balance;
}
