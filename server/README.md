# CIRCUIT Backend

Express API + WDK (agent wallets, draw/repay) + credit scoring (OpenAI or Flock AI) + autonomous repayment monitor.

## Setup

```bash
cd server
cp .env.example .env
# Edit .env:
# - Recommended: WDK_SEED_ENTROPY_ENCRYPTED_B64 + WDK_SEED_PASSPHRASE (generate+encrypt)
# - Fallback (dev-only): WDK_SEED_PHRASE
# - ALCHEMY_SEPOLIA_URL, CIRCUIT_*_ADDRESS, optional OPENAI_API_KEY or FLOCK_API_KEY
npm install
npm run dev
```

Runs on http://localhost:3001. Set `VITE_API_URL=http://localhost:3001` in the **root** `.env` so the frontend can call the API.

## Seed security (recommended)

WDK wallets are derived from a seed phrase. For safety, avoid persisting a plaintext mnemonic in `server/.env`.

1) Generate a fresh mnemonic:

```bash
npm run generate-seed
```

2) Encrypt it into an environment-safe payload:

```bash
npm run encrypt-seed
```

3) Paste the printed values into `server/.env`:

- `WDK_SEED_ENTROPY_ENCRYPTED_B64=...`
- `WDK_SEED_PASSPHRASE=...`

Then delete `WDK_SEED_PHRASE` from `server/.env`.

## Routes

- `POST /agent/register` — create WDK agent wallet
- `GET /agent/:id/score` — credit score (LLM when keys set)
- `POST /agent/:id/draw` — draw USDT (body: `{ amount, to? }`)
- `POST /agent/:id/repay` — repay (body: `{}` or `{ amount }`)
- `GET /agent/:id/balance` — agent USDT balance
- `GET /pool/stats` — pool TVL
- `POST /pool/deposit` — placeholder (LP uses frontend)
- `GET /operator/:id/agents` — list agents by operator address
- `GET /opportunities` — external yield signals (DefiLlama; disclosed)
- `GET /health` — health check

## Wallet persistence across restarts

The backend persists WDK wallet derivation mapping so previously created agents continue to work after restart:

- `CIRCUIT_WALLET_MAP_PATH` (default `.circuit-wallet-map.json`)
- `CIRCUIT_WALLET_SCAN_LIMIT` (default `200`) for recovery scans when map is stale/missing

## Credit scoring

- **OpenAI:** Set `OPENAI_API_KEY` in `server/.env`. Model: `gpt-4o-mini` (override with `SCORING_MODEL`).
- **Flock AI:** Set `FLOCK_API_KEY`. Uses `https://api.flock.io/v1`. Optionally set `SCORING_MODEL` (e.g. `qwen3-30b-a3b-instruct-2507`). If both OpenAI and Flock are set, Flock is used.
