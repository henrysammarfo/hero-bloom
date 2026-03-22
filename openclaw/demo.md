# OpenClaw Autonomous Agent Demo Script

This document guides you through the live demonstration of the OpenClaw autonomous agent on CIRCUIT.

## Prerequisites

- Backend running: `cd server && npm run dev`
- Agent registered: Use the frontend or `POST /agent/register` to get an agent wallet and register it on-chain to receive a `agentId` (bytes32 hex).

## Demo Steps

### 1. Enable the Agent
Export the required environment variables:
```bash
export CIRCUIT_API_URL="http://localhost:3001"
export CIRCUIT_AGENT_ID="0x..." # Your registered Agent ID
export CIRCUIT_AGENT_ENABLED="true"
```

### 2. Start the Strategy Loop
Run the agent in a dedicated terminal:
```bash
npx ts-node openclaw/strategy.ts
```

### 3. Observe Autonomous Borrowing (Draw)
When the loop starts, it polls for yield opportunities. If `bestApy` > 8% (simulated or real via DefiLlama):
- The agent logs: `{"action":"DRAW", "amountUsdt": 500, "reason": "Borrowing because best APY is 12.4%..."}`
- A transaction is sent to the pool.
- The agent immediately calls `request-faucet` to simulate incoming revenue.

### 4. Observe Revenue Detection & Repayment
In the next tick (30s later), the agent detects the balance increase from the faucet.
- The agent logs: `{"action":"REPAY", "amountUsdt": 500, "reason": "Revenue received (+50 USDT...)"}`
- A transaction is sent to repay the loan.

### 5. Multi-Agent Scenario (Bonus)
To demo agents borrowing from other agents:
1. Register two agents (Agent A and Agent B).
2. Configure Agent B as the lender (lower PD expected).
3. If Agent A needs to repay but has zero balance, Agent B will trigger a transfer.
*Note: This specific bonus scenario can be triggered manually via the API to show the backend support.*

```bash
# Example manual transfer for demo
curl -X POST http://localhost:3001/agent/AGENT_B_ID/transfer-to/AGENT_A_ID -H "Content-Type: application/json" -d '{"amount": 50}'
```

---
**Auditable Autonomy**: Every action is observable in the terminal as a standard JSON object, ready for indexing or auditing.
