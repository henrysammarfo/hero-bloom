/**
 * Autonomous repayment: every 30s, for each agent with drawn > 0, check USDT balance;
 * if balance >= drawn + 3%, sign and send repay via WDK.
 */
import { type Hash } from "viem";
import { getAgent } from "./chain.service.js";
import { audit } from "./audit.service.js";
import * as wdk from "./wdk.service.js";
import { config } from "../config.js";

const INTERVAL_MS = 30_000;

const agentsToMonitor = new Set<string>();

export function registerAgentForRepayment(agentId: string): void {
  agentsToMonitor.add(agentId.toLowerCase().startsWith("0x") ? agentId : `0x${agentId}`);
}

export function startRepaymentMonitor(): void {
  setInterval(async () => {
    if (!config.writeEnabled) return;
    let checked = 0;
    let repaid = 0;
    for (const id of agentsToMonitor) {
      try {
        const agent = await getAgent(id as Hash);
        if (!agent || !agent.active || agent.drawn <= 0n) continue;
        checked += 1;
        const balance = await wdk.getAgentTokenBalance(agent.wallet);
        // Contract enforces repay <= drawn. Repay principal only from monitor.
        // Any "interest" should be handled as a separate transfer or accounting layer.
        const repayAmount = agent.drawn;
        if (balance >= repayAmount) {
          const tx = await wdk.signAndSendRepay(agent.wallet, id as Hash, repayAmount);
          repaid += 1;
          await audit({
            ts: new Date().toISOString(),
            type: "REPAYMENT_MONITOR_REPAY",
            agentId: id,
            wallet: agent.wallet,
            amountUsdt: Number(repayAmount) / 1e6,
            amountRaw: repayAmount.toString(),
            txHash: tx.hash,
          });
          console.log(`[REPAY] Agent ${id} repaid ${repayAmount} raw`);
        }
      } catch (e) {
        console.error(`[REPAY] Error for agent ${id}:`, e);
      }
    }
    if (checked > 0 || repaid > 0) {
      console.log(`[REPAY] Checked ${checked} agents, triggered ${repaid} repayments`);
    }
  }, INTERVAL_MS);
  console.log("[REPAY] Repayment monitor started (every 30s)");
}
