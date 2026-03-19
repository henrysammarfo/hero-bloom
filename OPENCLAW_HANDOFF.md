# OpenClaw integration — handoff for teammate (WINNING VERSION)

**OpenClaw is the final missing must-have for 1st place.** This repo already has the full, live stack (contracts, frontend, backend with WDK, credit scoring via OpenAI/Flock, autonomous repayment monitor). What judges will look for now is **true autonomy**: an agent that decides **when and why** to draw/repay, without a human triggering endpoints.

This doc is written so your teammate can implement **exactly what the Lending Bot track rewards**:

- Agent autonomy (decides when/why, not just how)
- Economic soundness (respects Circuit risk caps + credit limits)
- Real-world viability (secure key handling; auditable logs; predictable behavior)
- Nice-to-have: reallocate capital to higher yield (based on a real external yield signal feed)

---

## What’s already built (no OpenClaw)

- **Contracts:** MockUSDT, CircuitRegistry, CircuitPool (5% per agent, 20% per operator). Sepolia.
- **Frontend:** Dashboard, Agents, Agent detail, Sessions, Faucet, Register Agent. Wallet connect (wagmi/RainbowKit). Optional: “Create WDK wallet” and “Draw (API)” / “Repay (API)” when `VITE_API_URL` is set.
- **Backend (`server/`):**
  - WDK: create agent wallet, sign `CircuitPool.draw` and `CircuitPool.repay`.
  - Credit scoring: GET `/agent/:id/score` — OpenAI or Flock AI (configurable via `OPENAI_API_KEY` or `FLOCK_API_KEY`).
  - Autonomous repayment: background job every 30s; if agent wallet has enough USDT, backend signs repay.
  - Opportunities feed: `GET /opportunities` (real yield signals via DefiLlama; disclosed 3rd party).
  - Routes: `POST /agent/register`, `GET /agent/:id/score`, `POST /agent/:id/draw`, `POST /agent/:id/repay`, `GET /pool/stats`, `GET /operator/:id/agents`, `GET /opportunities`.

So **execution is already solved** (WDK signing, on-chain settlement). OpenClaw’s job is the missing layer: **strategy → decision → execution**.

---

## Branch and handoff

1. **You (repo owner):** Push current state to a new branch, e.g. `feature/openclaw`.
2. **Teammate:** Clone the repo, checkout `feature/openclaw`.
3. **Teammate:** Follow the prompt below to connect OpenClaw (running on their cloud) to the CIRCUIT backend API.
4. When OpenClaw integration is done, merge back and continue (e.g. demo video, submission).

---

## Prompt for teammate (OpenClaw + CIRCUIT API)

Copy the block below to your OpenClaw / AI assistant that will run in the cloud.

---

**CIRCUIT backend API (already deployed or running locally):**

- Base URL: `https://your-circuit-api.com` or `http://localhost:3001` (replace with real URL).
- All responses are JSON. Use `Content-Type: application/json` for POST.

**Endpoints:**

1. **POST /agent/register**  
   Creates a new WDK agent wallet.  
   Response: `{ "success": true, "walletAddress": "0x…" }`.  
   Use this address to register the agent on-chain (frontend or contract call).

2. **GET /agent/:id/score**  
   Returns credit score for agent `id` (bytes32 hex, e.g. `0x…`).  
   Response: `{ "success": true, "creditLimitUsdt", "riskTier", "probabilityOfDefault", "reasoning?", "drawn", "active", "wallet" }`.

3. **POST /agent/:id/draw**  
   Agent draws USDT from the pool (backend signs via WDK).  
   Body: `{ "amount": number (USDT), "to": "0x…" optional }`.  
   Response: `{ "success": true, "txHash": "0x…" }`.

4. **POST /agent/:id/repay**  
   Agent repays (backend signs).  
   Body: `{}` (full drawn amount) or `{ "amount": number }`.  
   Response: `{ "success": true, "txHash": "0x…" }`.

5. **GET /pool/stats**  
   Pool TVL.  
   Response: `{ "success": true, "totalTvlUsdt", "poolBalanceRaw" }`.

6. **GET /operator/:id/agents**  
   List agents for operator address `id`.  
   Response: `{ "success": true, "agents": [ { "agentId", "wallet", "creditLimitUsdt", "drawnUsdt", "riskTier", "active" }, … ] }`.

7. **GET /opportunities**  
   External yield opportunities feed (real signal via DefiLlama).  
   Query: `?limit=10`  
   Response: `{ "success": true, "source": "defillama", "cached": boolean, "opportunities": [ { "id", "apy", "chain", "project", "symbol", "tvlUsd?", "url?" }, ... ] }`.

8. **POST /agent/:id/request-faucet**  
   Agent requests on-chain MockUSDT faucet to its own wallet (used as "earned revenue" for the demo).  
   Response: `{ "success": true, "txHash": "0x…" }`.

9. **POST /agent/:fromId/transfer-to/:toId**  
   Inter-agent USDT transfer (used for "agents borrow from other agents").  
   Body: `{ "amount": number }`  
   Response: `{ "success": true, "txHash": "0x…" }`.

**Your task:**

- Connect OpenClaw to this API so that the **agent** (not a human) decides when to call draw and when to call repay.
- Implement the **Decision Loop** below (it’s the winning requirement).
- Use the same `agentId` (bytes32 hex) that is registered on-chain for that agent wallet.
- Deliverable: add a folder `openclaw/` with:
  - `README.md` (how to run; env vars)
  - `strategy.ts` (decision loop + helpers)
  - `demo.md` (exact commands shown in the video)

---

## Decision Loop (MUST implement as-is for judges)

Your agent must decide **when and why** to borrow/repay based on real signals, under hard risk constraints.

### Inputs the agent must read each tick (every 30–60s)

- `GET /pool/stats` → pool TVL
- `GET /agent/:id/score` → current credit limit + risk tier + drawn
- `GET /agent/:id/score` also includes `probabilityOfDefault`
- `GET /opportunities?limit=10` → external yield signals

### Core policy constraints (non-negotiable)

- Never exceed **on-chain credit limit** (backend will revert anyway; agent must pre-check).
- Never exceed Circuit’s **5% per agent / 20% per operator** constraints (agent should assume they exist; rely on contract enforcement).
- Cooldown: do not send more than **1 draw** and **1 repay** per 60 seconds per agent (avoid spamming / reorg risk).
- Amount safety: always leave at least **20% headroom** under credit limit (avoid edge rounding and chain state drift).

### Borrow decision (draw) — when and why

Compute:

- `headroomUsdt = creditLimitUsdt - drawnUsdt`
- `maxSafeDrawUsdt = floor(headroomUsdt * 0.8)`  (20% headroom)
- `bestApy = max(opportunities[].apy)`
- `pd = probabilityOfDefault` from `/agent/:id/score`

Rules:

1. If `maxSafeDrawUsdt < 50` → do nothing (too small to matter).
2. If `pd > 0.45` → do nothing (estimated default risk too high).
3. If `bestApy < 8` → do nothing (signal not attractive).
4. Else:
   - Choose `drawAmountUsdt = min(maxSafeDrawUsdt, 500)` for demo stability.
   - Call `POST /agent/:id/draw` with `{ "amount": drawAmountUsdt }`.
   - Log a 1-liner reason:
     - “Borrowing 500 USDT because best stablecoin APY is 12.4% on Arbitrum (Curve USDT) and we have 800 USDT headroom.”

### Repay decision — when and why

Rules:

1. If `drawnUsdt == 0` → do nothing.
2. If `pd > 0.5` → repay now (risk-off) by calling `POST /agent/:id/repay` with `{}` (full).
3. Else if `bestApy < 6` → repay (risk-off) by calling `POST /agent/:id/repay` with `{}` (full).
4. Else repay only when “revenue event” triggers (see below).

### Revenue event (required for realism)

To avoid fake “infinite money”, use a simple, explicit revenue simulation that is demoable:

- The agent watches its own wallet USDT balance (`GET /agent/:id/balance`) every tick.
- If balance increased by \( \ge 50 \) USDT since last tick, treat it as “revenue received” and repay.
- For the demo without humans: after drawing, the agent must call `POST /agent/:id/request-faucet` once to generate revenue, then repay when that revenue arrives.

### Capital reallocation (nice-to-have → make it real)

Show that strategy reacts to external yields:

- If `bestApy` improves by \( \ge 2\% \) vs last tick → the agent borrows more (within safe bounds).
- If it drops by \( \ge 2\% \) → the agent repays and pauses borrowing for 10 minutes.

---

## Bonus: Agents borrow from other agents to complete complex tasks (MUST demo)

Implement a 2-agent scenario in the OpenClaw demo:

1. **Agent A (Borrower):** draws using the core policy above.
2. **Agent B (Lender):** scores itself via GET `/agent/:id/score` and only lends if `Agent B` has lower `probabilityOfDefault` than `Agent A` by at least `0.1`.
3. **If Agent A cannot repay from its own wallet USDT balance:**  
   compute `shortfall = principalPlusInterest - currentBalance` and call:  
   `POST /agent/:agentBLenderId/transfer-to/:agentABorrowerId` with `{ "amount": shortfallUsdt }`.
4. **Then repayment proceeds:** backend repayment monitor repays Agent A automatically (no human).

### Required logs (auditable autonomy)

Every tick must log JSON like:

```json
{ "ts":"...", "agentId":"0x...", "creditLimitUsdt":1000, "drawnUsdt":500, "probabilityOfDefault":0.18, "bestApy":12.4, "action":"DRAW", "amountUsdt":500, "reason":"..." }
```

This is what judges want: observable intelligence, not hidden magic.

---

## Security constraints (do not skip)

- Never log seed phrases, private keys, or raw secrets.
- Keep OpenClaw running in a dedicated directory; do not give it access to your repo root.
- Use a dedicated testnet agent wallet; do not reuse the deployer wallet.
- Add a “kill switch” env var: `CIRCUIT_AGENT_ENABLED=false` to stop all actions.

## Reliability requirement (mandatory before final merge)

- Persist WDK wallet mapping across restarts so existing agents remain controllable:
  - Current backend keeps `walletAddress -> derivationIndex` in memory only.
  - After server restart, old agents can fail with `Wallet not managed by this backend`.
  - Teammate must implement persistence (file or DB) and load mapping on boot.
  - Minimum acceptance test:
    1) register agent wallet, 2) restart backend, 3) draw/repay still works for same `agentId`.

**Repo:** [hero-bloom repo URL]  
**Backend:** Node.js in `server/`. Run with `cd server && npm install && npm run dev`. Set `server/.env` from `server/.env.example` (WDK seed, ALCHEMY_SEPOLIA_URL, contract addresses, optional OPENAI_API_KEY or FLOCK_API_KEY).

---

## After OpenClaw is integrated

- Merge `feature/openclaw` (or the teammate’s branch) into main.
- Update [HACKATHON_CHECKLIST.md](./HACKATHON_CHECKLIST.md): mark “OpenClaw (or equivalent) for agent reasoning” as done if the demo shows the agent calling the API.
- Record the demo video (Bible Part 8): show register → score → draw (real tx) → simulate income → auto-repay within 30s; optionally show OpenClaw triggering draw/repay.
