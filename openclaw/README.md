# OpenClaw Agent for CIRCUIT

This folder contains the autonomous agent logic for the CIRCUIT lending platform. The agent makes decisions on when to borrow (draw) and repay loans based on real-world yield signals and risk metrics.

## Setup

1.  **Configure Environment**:
    Ensure the following environment variables are set (usually in the parent directory's `.env` or your cloud environment):
    - `CIRCUIT_API_URL`: The base URL of the CIRCUIT backend (e.g., `http://localhost:3001`).
    - `CIRCUIT_AGENT_ID`: The bytes32 ID of the agent registered on-chain.
    - `CIRCUIT_AGENT_ENABLED`: Set to `true` to enable autonomous actions.

2.  **Install Dependencies**:
    The agent uses standard Node.js/TypeScript. Run `npm install` in the root directory if you haven't already.

3.  **Run the Agent**:
    ```bash
    npx ts-node openclaw/strategy.ts
    ```

## Strategy Overview

The agent follows a strict decision loop:
- **Tick Interval**: Every 30-60 seconds.
- **Borrowing**: Initiated when yield (APY) > 8%, risk (PD) < 45%, and there is safe headroom under the credit limit.
- **Repayment**: Triggered if risk (PD) > 50%, APY < 6%, or a "revenue event" (wallet balance increase >= 50 USDT) is detected.
- **Headroom**: Always maintains a 20% safety margin under the on-chain credit limit.
- **Audit Logs**: All decisions are logged in JSON format for traceability.
