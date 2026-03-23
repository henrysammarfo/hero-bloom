/**
 * Persistent Agent Strategy Service:
 * Automatically manages all registered agents on a periodic tick.
 */
import axios from "axios";
import { type Hash } from "viem";
import { config } from "../config.js";
import { audit } from "./audit.service.js";
import { getAgent, getAgentIdsByOperator } from "./chain.service.js";
import * as wdk from "./wdk.service.js";

const TICK_INTERVAL_MS = 60_000; // 60 seconds
const COOLDOWN_MS = 60_000;

const lastApy = new Map<string, number>();
const lastBalance = new Map<string, number>();
const lastActionTime = new Map<string, number>();

/**
 * Perform a single strategy tick for a specific agent.
 */
async function performAgentTick(agentId: Hash) {
  try {
    const now = Date.now();
    const lastAction = lastActionTime.get(agentId) ?? 0;
    if (now - lastAction < COOLDOWN_MS) return;

    // 1. Fetch Inputs
    // We use internal service calls where possible instead of localhost Axios
    const agent = await getAgent(agentId);
    if (!agent || !agent.active) return;

    // Opportunities from DefiLlama (via our own route or direct fetch)
    // For simplicity in the service, we'll hit our own endpoint or a shared utility
    const oppsRes = await axios.get(`http://localhost:${config.port}/opportunities?limit=10`);
    const opportunities = oppsRes.data.opportunities;
    const bestApy = Math.max(...opportunities.map((o: any) => o.apy), 0);

    const creditLimitUsdt = Number(agent.creditLimit) / 1e6;
    const drawnUsdt = Number(agent.drawn) / 1e6;
    const riskTier = ["A", "B", "C"][agent.riskTier - 1] ?? "C";
    const pd = riskTier === "A" ? 0.1 : riskTier === "B" ? 0.25 : 0.45;

    const currentBalanceRaw = await wdk.getAgentTokenBalance(agent.wallet);
    const currentBalance = Number(currentBalanceRaw) / 1e6;
    
    const prevBalance = lastBalance.get(agentId) ?? 0;
    const revenueReceived = prevBalance > 0 && currentBalance >= prevBalance + 50;

    const statsForLog = {
      creditLimitUsdt,
      drawnUsdt,
      probabilityOfDefault: pd,
      bestApy,
      currentBalance,
    };

    // 2. Repay Decision
    if (drawnUsdt > 0) {
      let repayReason = "";
      if (pd > 0.5) repayReason = `Risk too high (PD: ${pd})`;
      else if (bestApy < 6) repayReason = `APY too low (${bestApy}%)`;
      else if (revenueReceived) repayReason = `Revenue received (+50 USDT)`;

      if (repayReason) {
        const tx = await wdk.signAndSendRepay(agent.wallet, agentId, agent.drawn);
        await audit({
          ts: new Date().toISOString(),
          type: "STRATEGY_REPAY",
          agentId,
          wallet: agent.wallet,
          amountUsdt: drawnUsdt,
          reason: repayReason,
          txHash: tx.hash,
        });
        console.log(`[STRATEGY] Agent ${agentId} auto-repaid due to: ${repayReason}`);
        lastActionTime.set(agentId, now);
        lastBalance.set(agentId, 0);
        return;
      }
    }

    // 3. Borrow Decision (Draw)
    const headroomUsdt = creditLimitUsdt - drawnUsdt;
    const maxSafeDrawUsdt = Math.floor(headroomUsdt * 0.8);

    if (maxSafeDrawUsdt >= 50 && pd <= 0.45 && bestApy >= 8) {
      const drawAmountUsdt = Math.min(maxSafeDrawUsdt, 500);
      const amountRaw = BigInt(Math.floor(drawAmountUsdt * 1e6));
      
      const tx = await wdk.signAndSendDraw(agent.wallet, agentId, agent.wallet, amountRaw);
      await audit({
        ts: new Date().toISOString(),
        type: "STRATEGY_DRAW",
        agentId,
        wallet: agent.wallet,
        amountUsdt: drawAmountUsdt,
        reason: `Best APY ${bestApy}% > 8% threshold`,
        txHash: tx.hash,
      });
      console.log(`[STRATEGY] Agent ${agentId} auto-drew ${drawAmountUsdt} USDT`);
      
      // Simulate revenue by requesting faucet after draw for demo
      await wdk.signAndSendRequestFaucet(agent.wallet);
      
      lastActionTime.set(agentId, now);
      lastBalance.set(agentId, currentBalance);
      return;
    }

    lastApy.set(agentId, bestApy);
    lastBalance.set(agentId, currentBalance);

  } catch (error: any) {
    console.error(`[STRATEGY] Error for agent ${agentId}:`, error.message);
  }
}

/**
 * Main loop: discovery + execution.
 */
export async function startAgentStrategyService() {
  if (!config.writeEnabled) {
    console.log("[STRATEGY] Strategy service disabled (CIRCUIT_WRITE_ENABLED=false)");
    return;
  }

  console.log("[STRATEGY] Persistent Agent Strategy service started");

  setInterval(async () => {
    try {
      // 1. Discover the Operator Address (Account 0 in the WDK vault)
      const operator = await wdk.getOperatorAddress();

      // 2. Autonomously fetch ALL agent IDs registered under this operator on-chain
      const agentIds = await getAgentIdsByOperator(operator);

      if (agentIds.length === 0) {
        return;
      }

      // 3. Tick each discovered agent
      for (const id of agentIds) {
        await performAgentTick(id as Hash);
      }
    } catch (e) {
      console.error("[STRATEGY] Loop error:", e);
    }
  }, TICK_INTERVAL_MS);
}
