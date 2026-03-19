/**
 * Operator routes: GET /operator/:id/agents — list agents by operator address (from chain).
 */
import { Router } from "express";
import { type Address } from "viem";
import { getAgent, getAgentIdsByOperator } from "../services/chain.service.js";

export const operatorRouter = Router();

/** GET /operator/:id/agents — agent ids and summary for an operator. */
operatorRouter.get("/:id/agents", async (req, res) => {
  try {
    const operator = (req.params.id.startsWith("0x") ? req.params.id : `0x${req.params.id}`) as Address;
    const agentIds = await getAgentIdsByOperator(operator);
    const agents = await Promise.all(
      agentIds.map(async (id) => {
        const a = await getAgent(id);
        if (!a) return null;
        return {
          agentId: id,
          wallet: a.wallet,
          creditLimitUsdt: Number(a.creditLimit) / 1e6,
          drawnUsdt: Number(a.drawn) / 1e6,
          riskTier: ["A", "B", "C"][a.riskTier - 1] ?? "C",
          active: a.active,
        };
      })
    );
    res.json({ success: true, agents: agents.filter(Boolean) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});
