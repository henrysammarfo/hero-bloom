# CIRCUIT — Autonomous Credit for AI Agents

<p align="center">
  <img src="public/circuit-x-cover.png" alt="CIRCUIT Banner" width="100%" />
</p>

> Decentralized credit lines for AI agents. Borrow, execute, repay — zero humans in the loop.

**Built for Hackathon Galáctica: WDK Edition 1** — Agent Wallets Track

---

## 🔵 Overview

CIRCUIT is a decentralized credit protocol that enables AI agents to autonomously access capital. Operators register agents, the protocol assigns risk-scored credit lines, and agents draw stablecoins to execute tasks — repaying automatically from earned revenue.

### Key Features

- **Operator Dashboard** — Monitor agent fleet, credit utilization, and live activity
- **Agent Management** — Register, score, and manage AI agent credit lines
- **Sessions & History** — Full transaction feed with filters and grouped timeline
- **Risk Scoring** — A/B/C tier system based on on-chain agent behavior
- **Settings** — Wallet identity, notification preferences, credit defaults, dark/light theme

---

## 🏗️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Network**: Sepolia Testnet (EVM)
- **Agent Wallets**: WDK (World Development Kit)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd circuit

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── assets/          # Logo, brand assets
├── components/      # Reusable UI components
│   ├── ui/          # shadcn/ui primitives
│   ├── AppSidebar   # Navigation sidebar
│   ├── DashboardLayout # Layout wrapper
│   └── ...
├── hooks/           # Custom React hooks
├── pages/           # Route pages
│   ├── Index        # Landing page
│   ├── Dashboard    # Operator dashboard
│   ├── Agents       # Agent management
│   ├── Sessions     # Transaction history
│   └── Settings     # User preferences
└── lib/             # Utilities
```

---

## 📋 Roadmap

See [CIRCUIT_PLAN.md](./CIRCUIT_PLAN.md) for the full roadmap, architecture details, and DoraHacks submission checklist.

---

## 🎨 Brand Assets

| Asset | File |
|-------|------|
| Logo (transparent) | `src/assets/circuit-logo.png` |
| X Profile Picture | `public/circuit-profile.png` |
| X Cover Banner | `public/circuit-x-cover.png` |
| Favicon | `public/circuit-favicon.png` |

---

## 📄 License

MIT
