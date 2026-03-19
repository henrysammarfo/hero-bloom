# CIRCUIT — Project Overview & Roadmap

> **Hackathon**: Hackathon Galáctica: WDK Edition 1 — **Lending Bot / Agent Wallets Track**  
> **Deadline**: 22 March 2026 (per Circuit Bible)  
> **Network**: Sepolia Testnet  
> **Stack**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui + wagmi + RainbowKit (+ optional backend: Express, Supabase, WDK, OpenClaw)

---

## 🔵 What is CIRCUIT?

CIRCUIT is a **decentralized credit protocol for AI agents**. It enables autonomous agents to borrow stablecoins (USDT), execute revenue-generating tasks, and repay automatically — zero humans in the loop.

### Core Thesis

AI agents are the next economic actors. They need financial infrastructure: credit lines, risk scoring, and on-chain settlement. CIRCUIT provides this.

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Operator UI │────▶│  Smart Contracts  │────▶│  Agent Wallets  │
│  (React App) │     │  (Sepolia/EVM)    │     │  (WDK Powered)   │
└──────────────┘     └──────────────────┘     └─────────────────┘
       │                      │                        │
       │              ┌───────┴────────┐               │
       │              │  CircuitPool    │               │
       │              │  (USDT Vault)  │               │
       │              └────────────────┘               │
       │                                               │
       └───── CircuitRegistry ◀── On-chain Activity ──┘
```

### Smart Contract Layer (Sepolia)

- **MockUSDT.sol** — Testnet ERC20 (6 decimals). Mintable by owner; permissionless faucet (10k USDT / 24h per wallet) for LPs and testers.
- **CircuitRegistry.sol** — Registers agent wallets with operator, credit limit, risk tier (A/B/C). Tracks drawn/repaid and `totalDrawnByOperator` for the 20% cap. Only CircuitPool can update drawn/repaid.
- **CircuitPool.sol** — Holds USDT; LPs deposit; registered agents draw and repay. **Bible risk caps:** max 5% of pool TVL per agent per draw, max 20% per operator (total drawn). Uses SafeERC20, ReentrancyGuard, CEI pattern.

### Frontend (Current)

- Landing page with hero, how-it-works, lending pool
- Wallet connect (wagmi + RainbowKit), Sepolia only, dashboard gated behind connect
- Operator Dashboard — summary stats and agent table from **on-chain** (getAgentIdsByOperator + getAgent)
- Live activity feed from CircuitPool **Draw/Repay events**
- My Agents — grid of agents from registry (on-chain)
- Agent detail — single agent by bytes32 id, history from pool events
- Sessions & History — all Draw/Repay events from pool (on-chain)
- **Faucet** — request test USDT (10k per 24h) for LP and testing
- Settings — wallet identity, notifications, credit defaults, theme
- Register Agent — on-chain registration (CircuitRegistry.registerAgent)

---

## ✅ Completed (MVP for Submission)

### Phase 1: Wallet Integration

- [x] Connect MetaMask/WalletConnect via wagmi + RainbowKit
- [x] Gate dashboard behind wallet authentication
- [x] Display real wallet address in navbar and Settings
- [x] Sign transactions for agent registration

### Phase 2: Smart Contracts (Solidity)

- [x] Deploy MockUSDT (6 decimals, faucet) on Sepolia
- [x] Deploy CircuitRegistry (agent registration, operator → agents, totalDrawnByOperator for 20% cap)
- [x] Deploy CircuitPool (deposit, draw, repay) with SafeERC20, ReentrancyGuard, **5% per-agent and 20% per-operator risk caps** (Circuit Bible)
- [x] Wire frontend to contract ABIs via wagmi hooks
- [x] Hardhat tests for MockUSDT, CircuitRegistry, CircuitPool (including risk-cap tests)

### Phase 4: Real Data

- [x] Replace mock data with on-chain reads (getAgentIdsByOperator, getAgent)
- [x] Pool Draw/Repay events for Sessions and Dashboard activity
- [x] Agent detail and history from chain

### Faucet & Docs

- [x] On-chain faucet (MockUSDT.requestFaucet), Faucet page in app
- [x] ENV_KEYS.md, DEPLOY.md, FAUCET.md, README and CIRCUIT_PLAN up to date

---

## 🔜 What's Next (Post-Hackathon)

### Phase 3: Agent Wallet Integration (WDK)

- [ ] Integrate WDK SDK for agent wallet creation
- [ ] Autonomous draw/repay flow from agent wallets
- [ ] Agent-signed transaction verification
- [ ] Connect agent activity to risk scoring

### Phase 5: Production

- [ ] Mainnet deployment (Arbitrum/Base)
- [ ] Audit smart contracts
- [ ] Liquidity provider dashboard (deposit UI, APY)
- [ ] Governance for risk parameters
- [ ] Multi-token support (USDC, DAI)

---

## 📁 Brand Assets

| Asset   | Path                        | Usage                |
|--------|-----------------------------|----------------------|
| Logo   | `src/assets/logo.svg`       | Sidebar, navbar      |
| PNG    | `src/assets/circuit-logo.png` | Collapsed sidebar   |
| Favicon| `public/circuit-favicon.png`   | Browser tab          |
| X      | `public/circuit-profile.png`, `public/circuit-x-cover.png` | Social |

---

## 🛠️ Commands

```bash
npm install
npm run dev          # Dev server
npm run build        # Production build
npm run compile      # Compile contracts
npm run test:contracts  # Run contract tests
npm run deploy:sepolia # Deploy to Sepolia
```

---

## 📋 DoraHacks Submission Checklist

- [ ] Demo video (2–3 min walkthrough)
- [ ] GitHub repo (public, README)
- [ ] Live deployment URL
- [ ] Project description on DoraHacks
- [ ] Team info
- [ ] Smart contract addresses (Sepolia)
- [ ] Technical architecture diagram
- [ ] Pitch deck (5–7 slides)

---

## 📚 References

- **Circuit Bible** — Lending Bot track brief: risk controls (5% per agent, 20% per operator), API vision (register, score, draw, repay, pool stats), 9-day build plan, demo script.
- [SECURITY.md](./SECURITY.md) — Threat model, CEI/ReentrancyGuard/SafeERC20, risk limits, no secrets in client.
- [WDK Documentation](https://docs.wdk.tether.io/)
- [wagmi](https://wagmi.sh), [RainbowKit](https://www.rainbowkit.com)
- [Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
