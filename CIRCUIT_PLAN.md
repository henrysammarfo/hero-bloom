# CIRCUIT — Project Overview & Roadmap

> **Hackathon**: Hackathon Galáctica: WDK Edition 1 — Agent Wallets Track
> **Network**: Sepolia Testnet
> **Stack**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui

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
│  (React App) │     │  (Sepolia/EVM)    │     │  (WDK Powered)  │
└──────────────┘     └──────────────────┘     └─────────────────┘
       │                      │                        │
       │              ┌───────┴────────┐               │
       │              │  Lending Pool  │               │
       │              │  (USDT Vault)  │               │
       │              └────────────────┘               │
       │                                               │
       └───── Risk Engine ◀── On-chain Activity ──────┘
```

### Smart Contract Layer
- **LendingPool.sol** — Manages USDT deposits from liquidity providers
- **CreditLine.sol** — Issues credit lines to registered agents
- **RiskEngine.sol** — Scores agents (A/B/C tiers) based on on-chain behavior
- **AgentRegistry.sol** — Registers agent wallets with operator metadata

### Frontend (Current)
- Landing page with protocol explainer
- Operator Dashboard with agent management
- Sessions & History with transaction feed
- Settings with wallet, alerts, credit defaults, and theme

---

## ✅ Completed (MVP Frontend)

- [x] Landing page with hero, how-it-works, lending pool section
- [x] Deep black dark theme + light mode support
- [x] Sidebar navigation (Dashboard, Agents, Sessions, Settings)
- [x] Dashboard with summary stats, agent credit table, live activity feed
- [x] My Agents page with search, grid cards, status indicators
- [x] Sessions page with filter chips (All/Draws/Repayments), grouped timeline
- [x] Settings page with wallet identity, notifications, credit defaults, theme
- [x] Agent detail page with credit utilization and activity
- [x] Register Agent modal
- [x] Responsive mobile design
- [x] Brand assets (logo, favicon, X profile/cover, OG images)

---

## 🔜 What's Next (Post-Hackathon Priorities)

### Phase 1: Wallet Integration
- [ ] Connect MetaMask/WalletConnect via `wagmi` + `RainbowKit`
- [ ] Gate dashboard behind wallet authentication
- [ ] Display real wallet address and ENS name
- [ ] Sign transactions for agent registration

### Phase 2: Smart Contracts (Solidity)
- [ ] Deploy `LendingPool.sol` on Sepolia
- [ ] Deploy `CreditLine.sol` with draw/repay functions
- [ ] Deploy `AgentRegistry.sol` for on-chain agent registration
- [ ] Deploy `RiskEngine.sol` with scoring logic
- [ ] Wire frontend to contract ABIs via `wagmi` hooks

### Phase 3: Agent Wallet Integration (WDK)
- [ ] Integrate WDK SDK for agent wallet creation
- [ ] Implement autonomous draw/repay transaction flow
- [ ] Add agent-signed transaction verification
- [ ] Connect agent activity to risk scoring

### Phase 4: Real Data
- [ ] Replace mock data with on-chain reads (events, balances)
- [ ] Real-time WebSocket for live activity feed
- [ ] Transaction history from Sepolia explorer API
- [ ] Agent performance metrics from contract events

### Phase 5: Production
- [ ] Mainnet deployment (Arbitrum/Base)
- [ ] Audit smart contracts
- [ ] Add liquidity provider dashboard
- [ ] Implement governance for risk parameters
- [ ] Multi-token support (USDC, DAI)

---

## 📁 Brand Assets

| Asset | Path | Usage |
|-------|------|-------|
| Logo (SVG) | `src/assets/logo.svg` | Sidebar, navbar |
| Logo (PNG) | `src/assets/circuit-logo.png` | Collapsed sidebar, pitch decks |
| Favicon | `public/circuit-favicon.png` | Browser tab icon |
| X Profile | `public/circuit-profile.png` | Twitter/X avatar |
| X Cover | `public/circuit-x-cover.png` | Twitter/X header banner |

---

## 🛠️ Local Development

```bash
git clone <YOUR_GIT_URL>
cd circuit
npm install
npm run dev
```

### Key Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run test` — Run tests

---

## 📋 DoraHacks Submission Checklist

- [ ] Demo video (2-3 min walkthrough)
- [ ] GitHub repo (public, with README)
- [ ] Live deployment URL
- [ ] Project description on DoraHacks
- [ ] Team info
- [ ] Smart contract addresses (Sepolia)
- [ ] Technical architecture diagram
- [ ] Pitch deck (5-7 slides)

### Pitch Deck Outline
1. **Problem**: AI agents can't access financial infrastructure
2. **Solution**: CIRCUIT — decentralized credit for autonomous agents
3. **How it works**: Register → Score → Borrow → Execute → Repay
4. **Demo**: Live walkthrough of operator dashboard
5. **Architecture**: Smart contracts + WDK agent wallets
6. **Market**: Growing AI agent economy ($X TAM)
7. **Team & Ask**: Background + what's next

---

## 📚 Key References

- [WDK Documentation](https://docs.aspect.build/wdk)
- [Hackathon Galáctica Info](https://dorahacks.io)
- [wagmi Docs](https://wagmi.sh)
- [RainbowKit](https://www.rainbowkit.com)
- [Sepolia Faucet](https://sepoliafaucet.com)
