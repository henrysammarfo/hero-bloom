# Security

This document describes the threat model and mitigations for Hero Bloom (CIRCUIT Lending Bot track) contracts and frontend. Target: **secure, scalable, and non-exploitable** for testnet (Sepolia) and future mainnet use.

## Contract security

### Design principles

- **Checks–Effects–Interactions (CEI):** State updates before any external calls. No reentrancy via token callbacks.
- **ReentrancyGuard:** All state-changing pool/registry paths are protected.
- **SafeERC20:** All token transfers use OpenZeppelin SafeERC20; no assumptions about return value or behavior of non-standard ERC20s.
- **Immutables:** Pool token and registry are immutable after deployment; no upgrade or swap of core dependencies.
- **Solidity 0.8.x:** Built-in overflow/underflow checks; no `unchecked` blocks for user-controlled arithmetic.
- **Explicit visibility:** All functions and state variables have explicit visibility.

### Risk limits (CIRCUIT Bible)

- **Max 5% of pool TVL per agent per draw:** Enforced in `CircuitPool.draw()` so a single agent cannot drain a large share of the pool in one action.
- **Max 20% of pool TVL per operator (total drawn):** Enforced in `CircuitPool.draw()` using `CircuitRegistry.totalDrawnByOperator`. Repayments reduce this total so the cap is dynamic and fair.

### Access control

- **CircuitRegistry:** Only the designated pool can call `updateDrawn`, `updateRepaid`, `setCreditLimit`, `deactivate`. Pool is set once and cannot be changed.
- **CircuitPool:** Only the registered agent wallet can draw/repay for that agent; only LPs can deposit (anyone can deposit; no allowlist).
- **MockUSDT:** Owner-only mint; permissionless faucet with cooldown and reserve check (testnet only).

### Edge cases

- Zero address: Rejected for token, registry, pool, `to` in draw, and mint.
- Zero amount: Rejected for deposit, draw, repay, mint.
- Inactive agent: Draw and registry `updateDrawn` require agent active.
- Over limit: Draw reverts if `drawn + amount > creditLimit` or over 5%/20% caps; repay reverts if `amount > drawn`.
- Empty pool: Draw reverts if pool TVL is zero.

### Dependencies

- OpenZeppelin Contracts v4.9 (ERC20, SafeERC20, ReentrancyGuard, Ownable). No custom inline assembly; no delegatecall from user input.

## Frontend / ops security

- **No secrets in client:** All keys (Alchemy, WalletConnect Project ID, deployer key) are in `.env` and not committed. Build only exposes `VITE_*` vars; no server secrets in the SPA.
- **Wallet:** Private keys never leave the user’s wallet (RainbowKit/wagmi); we never request or store seed phrases.
- **Contract addresses:** Loaded from env so production can point to verified contracts without code changes.
- **Validation:** `hasContracts` / `hasFaucet` guard UI and prevent sending tx to wrong or missing addresses.

## Reporting

If you find a vulnerability, please report it responsibly (e.g. via the program’s designated channel or a private report). Do not open public issues for critical security findings.

## 2026 and upgrades

- Contracts are designed for Sepolia testnet and can be redeployed for mainnet with a production ERC20 and same risk limits.
- Future upgrades (e.g. configurable 5%/20% or additional roles) would require new deployments or a minimal proxy pattern; current design favors simplicity and auditability over upgradeability.
