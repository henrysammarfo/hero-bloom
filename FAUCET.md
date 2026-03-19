# CIRCUIT Test USDT Faucet

## Overview

CIRCUIT uses **MockUSDT** on Sepolia for the lending pool and agent draws/repays. The faucet gives testers and judges a chunk of test USDT for:

- **LP deposits** — Deposit into the CircuitPool to supply agent credit lines
- **Beta testing** — Test agent registration, draw, and repay flows
- **Judging** — Evaluate the MVP with real on-chain actions

## How It Works

- **Amount**: 10,000 USDT (6 decimals) per request
- **Cooldown**: 24 hours per wallet
- **Permissionless**: Any connected wallet can call `requestFaucet()` on the MockUSDT contract
- **Reserve**: The deploy script mints 500,000 USDT to the MockUSDT contract itself; the faucet transfers from that reserve to the requester

## Using the Faucet in the App

1. Connect your wallet (Sepolia).
2. Open **Faucet** from the sidebar (or go to `/faucet`).
3. Click **Request 10,000 USDT**.
4. Confirm the transaction. After confirmation, the tokens appear in your wallet.

## Topping Up the Faucet Reserve

If the on-contract reserve runs low, the **owner** of MockUSDT can mint more to the contract:

```solidity
// As MockUSDT owner
usdt.mint(mockUsdtContractAddress, amount);
```

Use the same address that deployed the contracts. No frontend is provided for this; use Hardhat or Etherscan (if the contract exposes a mint function and you have the owner key).

## Security Notes

- MockUSDT is **testnet-only**. It has a mint function and is not suitable for mainnet.
- The faucet is rate-limited per address to avoid drain. Operators and testers can request once per 24 hours per wallet.
- Contract addresses are set via `.env` after deployment; see [DEPLOY.md](./DEPLOY.md).
