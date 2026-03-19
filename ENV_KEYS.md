# Environment Keys Guide — CIRCUIT (Sepolia Testnet)

This guide explains **how to get every API key and URL** you need to run CIRCUIT live on Sepolia testnet. All services below have free tiers.

---

## Quick checklist

| Key | Used for | Required for | Where to get it |
|-----|----------|--------------|-----------------|
| **Alchemy API Key** | Sepolia RPC (read/write) | Yes | [Alchemy Dashboard](#1-alchemy-api-key-sepolia-rpc) |
| **WalletConnect Project ID** | Connect wallet (MetaMask, etc.) in the app | Yes | [Reown Dashboard](#2-walletconnect--reown-project-id) |
| **Sepolia test ETH** | Gas for transactions | Yes | [Faucets](#3-sepolia-test-eth-faucet) |
| **Etherscan API Key** | Contract verification, optional tx history | Optional | [Etherscan](#4-etherscan-api-key-optional) |
| **WDK** | Agent wallets (when you integrate WDK) | Later phase | No API key for EVM — just RPC URL |

---

## 1. Alchemy API Key (Sepolia RPC)

**What it does:** Gives your app a dedicated RPC endpoint to read chain data and send transactions on Sepolia. Used by wagmi/viem and (later) by smart contracts and WDK.

**How to get it:**

1. Go to **[Alchemy](https://www.alchemy.com/)** and sign up (free).
2. Open the **[Alchemy Dashboard](https://dashboard.alchemy.com/)**.
3. Click **"+ Create new app"**.
4. Choose:
   - **Chain:** Ethereum
   - **Network:** Sepolia
   - **Name:** e.g. `CIRCUIT Sepolia`
5. Click **Create app**, then open the app.
6. Click **"API key"** (or "View key"). Copy the key — it looks like `AbCdEf1234567890...`.

**Sepolia RPC URL format:**

```
https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
```

**In your app:** You’ll set this as `VITE_ALCHEMY_API_KEY` (or build the URL from it). Never commit the real key; use `.env` (and `.env` is in `.gitignore`).

**Free tier:** Plenty of requests per month for development and testnet.

---

## 2. WalletConnect / Reown Project ID

**What it does:** Lets users connect their wallet (MetaMask, WalletConnect, etc.) to your app. Required by RainbowKit and wagmi when using WalletConnect.

**How to get it:**

1. Go to **[Reown Dashboard](https://dashboard.reown.com/)** (formerly WalletConnect Cloud).
2. Sign up or log in.
3. Click **"+ Project"** (or "Create project").
4. Enter a **Project name** (e.g. `CIRCUIT`) and create.
5. Copy the **Project ID** (long string like `a1b2c3d4e5f6...`).

**In your app:** Set as `VITE_WALLETCONNECT_PROJECT_ID` in `.env`.

**Free tier:** Free for standard usage.

---

## 3. Sepolia Test ETH (Faucet)

**What it does:** Pays gas for transactions (deploying contracts, registering agents, etc.). Not an “API key” — you send test ETH to your wallet.

**How to get it:**

- **Alchemy Sepolia Faucet:**  
  [https://www.alchemy.com/faucets/ethereum-sepolia](https://www.alchemy.com/faucets/ethereum-sepolia)  
  - Often requires a small amount of mainnet ETH and some history.
- **Sepolia Faucet (other):**  
  [https://sepoliafaucet.com](https://sepoliafaucet.com)  
  - Some faucets need GitHub login or other checks.

**You need:** A wallet address (e.g. MetaMask). Send test ETH to that address so you can pay gas on Sepolia.

---

## 4. Etherscan API Key (Optional)

**What it does:** Used for contract verification on Sepolia and, if you use it, for fetching transaction history via Etherscan API.

**How to get it:**

1. Go to **[Etherscan](https://etherscan.io/)** and create an account.
2. **My account** → **API Keys** → **Add**.
3. Name it (e.g. `CIRCUIT`) and copy the key.

**In your app:** Can be `VITE_ETHERSCAN_API_KEY` for verification scripts or backend. Not needed for the basic “connect wallet + Sepolia RPC” flow.

---

## 5. Backend (server/.env) — WDK + scoring

The backend runs in `server/`. Copy `server/.env.example` to `server/.env` and set:

| Key | Required | What it does |
|-----|----------|--------------|
| `WDK_SEED_PHRASE` | Yes | 12/24-word phrase for WDK; generates agent wallets. Generate once: `node -e "const W=require('@tetherto/wdk'); console.log(W.getRandomSeedPhrase())"` in `server/`. |
| `ALCHEMY_SEPOLIA_URL` | Yes | Full URL, e.g. `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`. Same Alchemy key as frontend. |
| `CIRCUIT_REGISTRY_ADDRESS` | Yes | Same as `VITE_CIRCUIT_REGISTRY_ADDRESS` (no `VITE_` prefix). |
| `CIRCUIT_POOL_ADDRESS` | Yes | Same as `VITE_CIRCUIT_POOL_ADDRESS`. |
| `MOCK_USDT_ADDRESS` | Yes | Same as `VITE_MOCK_USDT_ADDRESS`. |
| `OPENAI_API_KEY` | For scoring | [OpenAI API keys](https://platform.openai.com/api-keys) — used for GET /agent/:id/score when set. |
| `FLOCK_API_KEY` | Alternative | [Flock AI](https://platform.flock.io) — OpenAI-compatible; if set, scoring uses Flock instead of OpenAI. |
| `PORT` | No | Default 3001. |
| `FRONTEND_URL` | No | Default http://localhost:5173 (CORS). |

**Frontend:** In the **root** `.env` set `VITE_API_URL=http://localhost:3001` so the app can call the backend (Create WDK wallet, Draw/Repay via API, Fetch score).

---

## 6. WDK (Agent Wallets) — Backend

**What it does:** The backend uses WDK with `WDK_SEED_PHRASE` to create agent wallets and sign draw/repay transactions to CircuitPool. No separate WDK API key for EVM; Alchemy Sepolia URL is used as the provider.

---

## 7. Credit scoring — OpenAI or Flock AI

**What it does:** GET /agent/:id/score returns a suggested credit limit and risk tier. If `OPENAI_API_KEY` or `FLOCK_API_KEY` is set in `server/.env`, the backend calls the LLM with on-chain agent data and returns `creditLimitUsdt`, `riskTier`, and `reasoning`.

- **OpenAI:** Get key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Default model: `gpt-4o-mini`. Override with `SCORING_MODEL`.
- **Flock AI:** Get key at [platform.flock.io](https://platform.flock.io). Backend uses base URL `https://api.flock.io/v1` (OpenAI-compatible). Set `FLOCK_API_KEY` and optionally `SCORING_MODEL` (e.g. `qwen3-30b-a3b-instruct-2507`). If both OpenAI and Flock keys are set, Flock is used.

---

## Where to put the keys

1. **Frontend:** Copy [.env.example](.env.example) to `.env` in the project root. Add `VITE_API_URL=http://localhost:3001` when using the backend.
2. **Backend:** Copy `server/.env.example` to `server/.env` and fill (see section 5).
3. **Never commit `.env`** — it’s in `.gitignore`. For production, set variables in the host’s “Environment variables” UI.

**Vite rule:** Only variables starting with `VITE_` are exposed to the browser.

---

## Summary

- **Frontend:** Alchemy API key, WalletConnect Project ID, Sepolia test ETH, contract addresses. Optional: `VITE_API_URL` for backend.
- **Backend:** `WDK_SEED_PHRASE`, `ALCHEMY_SEPOLIA_URL`, contract addresses (same as frontend). Optional: `OPENAI_API_KEY` or `FLOCK_API_KEY` for credit scoring.
- **Contract addresses** (after deploy): `VITE_CIRCUIT_REGISTRY_ADDRESS`, `VITE_CIRCUIT_POOL_ADDRESS`, `VITE_MOCK_USDT_ADDRESS`. See [DEPLOY.md](./DEPLOY.md) and [FAUCET.md](./FAUCET.md).

---

## ⚠️ Security

- **Never commit `.env`** or add it to git. It is in `.gitignore`.
- **Private keys** (e.g. `FUNDED_WALLET_PRIVATE_KEY`) must only be used in backend or deploy scripts, never in frontend code. Do not prefix them with `VITE_`.
- If a private key or API key was ever shared (e.g. in chat or email), treat it as compromised: move funds to a new wallet, rotate API keys, and regenerate as needed.
