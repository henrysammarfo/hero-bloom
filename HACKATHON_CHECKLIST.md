# Hackathon Galáctica: WDK Edition 1 — Submission Checklist

**Event:** 25 Feb – 22 Mar 2026 · **Submissions close:** 22 March 2026, 23:59 UTC  
**Primary track:** 💰 Lending Bot (optional secondary: 🤖 Agent Wallets)

**Source of truth:** The **Circuit Bible** (Lending Bot build bible) specifies the full stack, 9-day plan, API, WDK usage, and autonomous draw/repay. This checklist aligns with both the Bible and the official hackathon rules.

---

## ✅ Rules (mandatory for all projects)


| Requirement                                                                                                           | Status | Notes                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use **WDK by Tether** in what you're building                                                                         | ✅      | Backend WDK service (`wdk.service.ts`) creates agent wallets and signs `draw` / `repay` on Sepolia; exercised via `/agent/register`, `/agent/:id/draw`, `/agent/:id/repay`. |
| Project on **public GitHub**                                                                                          | ✅      | Repo is git-based; make sure it's public and linked in submission.                                                                                                          |
| **Apache 2.0** license                                                                                                | ✅      | `LICENSE` file present with Apache 2.0.                                                                                                                                     |
| **Video** (YouTube unlisted, ≤5 min)                                                                                  | ⬜ TODO | Overview + demo; required in submission form.                                                                                                                               |
| **Clear instructions** to run/test                                                                                    | ✅      | README + ENV_KEYS.md + server README.                                                                                                                                       |
| Integrate WDK (JS/TS) in a **meaningful** way; **proper agent architecture and WDK wallet integration** are mandatory | ✅      | WDK manages agent wallets + signing on backend; autonomous repayment monitor + OpenClaw handoff define the agent architecture.                                              |


---

## 💰 Lending Bot track — Must Have


| Requirement                                                         | Status                         | Notes                                                                                                                                                                                                 |
| ------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The agent makes lending decisions without human prompts.**        | ⬜ **TODO (OpenClaw teammate)** | OpenClaw (or equivalent) agent will decide when to draw/repay via CIRCUIT API, using the WDK wallet; this is explicitly delegated to teammate per `OPENCLAW_HANDOFF.md` and will be implemented last. |
| **All transactions settle on-chain** using USD₮, USA₮, XAU₮ or BTC. | ✅                              | MockUSDT on Sepolia; draws/repays/deposits are on-chain.                                                                                                                                              |
| **The agent autonomously tracks and collects repayments.**          | ✅                              | Backend repayment monitor runs every 30s and automatically repays principal (+interest) via WDK when conditions are met, without human prompts.                                                       |


---

## 💰 Lending Bot track — Nice to Have


| Item                                                    | Status                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Use DIDs or on-chain history for agent credit scores    | ✅ On-chain registry + history (drawn/repaid, risk tier).                                       |
| LLMs to negotiate loan terms                            | ✅ Scoring service uses OpenAI/Flock to suggest credit limits + risk tiers (terms by LLM).      |
| Agent reallocates capital to higher-yield opportunities | ⬜ TODO (OpenClaw strategy: choose pools/opportunities and call CIRCUIT API to move liquidity). |
| Lending with minimal or no collateral                   | ✅ Undercollateralized credit lines (credit limit, no collateral lock).                         |


---

## 🤖 Agent Wallets track (if you submit here too)


| Requirement                                         | Status                                  |
| --------------------------------------------------- | --------------------------------------- |
| OpenClaw (or equivalent) for agent reasoning        | ⬜ TODO (teammate, last task by design). |
| WDK primitives (wallet creation, signing, accounts) | ✅ WDK service live on backend.          |
| Agents hold/send/manage USD₮ autonomously           | ✅ Via WDK draw/repay + repayment bot.   |


---

## 📋 Submission form (DoraHacks)

- Product name + brief description  
- Primary track: **Lending Bot** (and optionally Agent Wallets)  
- Teammates + background + location  
- Public GitHub repo link  
- **Link to technical overview video** (YouTube unlisted, ≤5 min: overview + demo)

---

## 🔴 What's next (Bible + hackathon alignment) (what’s next)

The hackathon **requires** WDK and **Lending Bot requires** an agent that makes lending decisions and tracks/collects repayments **without human prompts**. Right now:

- **Operator UI** uses wagmi + RainbowKit (human connects wallet) for dashboard/LP actions.
- **WDK backend** creates/restores agent wallets and signs `draw` / `repay` via `/agent/register`, `/agent/:id/draw`, `/agent/:id/repay`.
- **Autonomous repayment bot** runs every 30s and repays drawn amounts via WDK when conditions are met.
- **OpenClaw agent** is planned (per `OPENCLAW_HANDOFF.md`) to sit on top of this API and make **lending decisions** (when to draw/repay) without human prompts; this is deliberately the final task and delegated to your teammate.

To align with the rules and Lending Bot must-haves:

1. **WDK integration**
  Use [WDK](https://docs.wallet.tether.io) (JavaScript/TypeScript) for the **agent** side: CIRCUIT already uses WDK in the backend for wallet creation and signing of on-chain `draw`/`repay` calls on Sepolia.
2. **Autonomous agent**
  OpenClaw (or a small Node/TS “bot”) consumes the CIRCUIT API and:  
  - Has access (indirectly) to the agent wallet via WDK-backed endpoints.  
  - **Decides when to draw** based on strategy/rules, calling `/agent/:id/draw` instead of a human clicking a button.  
  - **Autonomously tracks and collects repayments** by relying on the repayment monitor and/or explicitly calling `/agent/:id/repay`.
3. **Demo narrative**
  In the video, show:  
  - Operator registers an agent (agent wallet created via WDK).  
  - **Without** you clicking “Draw”, the OpenClaw agent (or script) decides to draw from the pool and calls the CIRCUIT API, which signs via WDK.  
  - **Without** you clicking “Repay”, the repayment bot (and/or agent) detects funds and repays the pool.  
  - All of this settles on-chain with USD₮ (MockUSDT on Sepolia is fine).

---

## 🛠️ Concrete next steps (Bible order)

1. **WDK integration** — ✅ Agent wallet creation + signing (draw/repay) using WDK in the Node backend.
2. **Autonomous draw** — ⬜ TODO (OpenClaw teammate) — agent logic (OpenClaw) that decides “time to draw” and calls CIRCUIT API → pool `draw()` via WDK.
3. **Autonomous repay** — ✅ Backend repayment monitor that checks agent wallet state and calls pool `repay()` via WDK when conditions are met.
4. **Video** — ⬜ TODO — Record a ≤5 min overview + live demo showing the above with no human in the loop for draw/repay.
5. **Demo video** — ⬜ TODO — Bible Part 8: register → score → draw (real tx) → simulate income → show auto-repay in 30s, no click. ≤5 min, unlisted.
6. **Submit** — ⬜ TODO — DoraHacks, public repo, Apache 2.0, demo URL, video. Deadline 22 March 2026, 23:59 UTC.

---

## 📚 Official links

- **WDK Docs:** [https://docs.wallet.tether.io](https://docs.wallet.tether.io)  
- **WDK GitHub:** [https://github.com/tetherto/wdk-core](https://github.com/tetherto/wdk-core)  
- **OpenClaw:** [https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)  
- **WDK AI Docs (for agents):** linked from hackathon “Tips for Hackers”  
- **DoraHacks submission:** via hackathon page  
- **Discord:** Tether Developer’s Hub → Hackathon Galáctica: WDK Edition 1

