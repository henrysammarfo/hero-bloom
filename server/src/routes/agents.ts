/**
 * Agent routes: register (create wallet), score, draw, repay.
 */
import { Router } from "express";
import { type Address, type Hash } from "viem";
import { requireApiKey, requireWritesEnabled } from "../middleware/auth.js";
import { audit } from "../services/audit.service.js";
import { getAgent } from "../services/chain.service.js";
import { registerAgentForRepayment } from "../services/repayment.service.js";
import { scoreAgent } from "../services/scoring.service.js";
import * as wdk from "../services/wdk.service.js";
import { config } from "../config.js";

export const agentsRouter = Router();

const lastActionAt = new Map<string, number>();
function enforceCooldown(agentId: string): string | null {
  const now = Date.now();
  const key = agentId.toLowerCase();
  const last = lastActionAt.get(key) ?? 0;
  if (now - last < config.agentActionCooldownMs) {
    const waitMs = config.agentActionCooldownMs - (now - last);
    return `Cooldown active. Try again in ~${Math.ceil(waitMs / 1000)}s`;
  }
  lastActionAt.set(key, now);
  return null;
}

/** POST /agent/register — create a new WDK agent wallet. Return address for operator to register on-chain. */
agentsRouter.post("/register", requireApiKey, requireWritesEnabled, async (_req, res) => {
  try {
    const { address } = await wdk.createAgentWallet();
    await audit({ ts: new Date().toISOString(), type: "AGENT_REGISTER_WALLET", wallet: address });
    res.json({ success: true, walletAddress: address });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/** GET /agent/:id/score — credit score: OpenAI or Flock AI when keys set, else on-chain only. */
agentsRouter.get("/:id/score", async (req, res) => {
  try {
    const id = req.params.id as string;
    const agentId = (id.startsWith("0x") ? id : `0x${id}`) as Hash;
    const agent = await getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found" });
    }
    const creditLimitUsdt = Number(agent.creditLimit) / 1e6;
    const drawnUsdt = Number(agent.drawn) / 1e6;
    const riskTier = ["A", "B", "C"][agent.riskTier - 1] ?? "C";
    const fallbackPd = riskTier === "A" ? 0.1 : riskTier === "B" ? 0.25 : 0.45;

    const llmScore = await scoreAgent({
      wallet: agent.wallet,
      creditLimitUsdt,
      drawnUsdt,
      riskTier,
      active: agent.active,
    });

    if (llmScore) {
      return res.json({
        success: true,
        creditLimitUsdt: llmScore.creditLimitUsdt,
        riskTier: llmScore.riskTier,
        probabilityOfDefault: llmScore.probabilityOfDefault,
        reasoning: llmScore.reasoning,
        drawn: drawnUsdt,
        active: agent.active,
        wallet: agent.wallet,
      });
    }

    res.json({
      success: true,
      creditLimitUsdt,
      riskTier,
      probabilityOfDefault: fallbackPd,
      drawn: drawnUsdt,
      active: agent.active,
      wallet: agent.wallet,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/** POST /agent/:id/draw — agent draws USDT from pool (backend signs via WDK). */
agentsRouter.post("/:id/draw", requireApiKey, requireWritesEnabled, async (req, res) => {
  try {
    const agentId = (req.params.id.startsWith("0x") ? req.params.id : `0x${req.params.id}`) as Hash;
    const cd = enforceCooldown(agentId);
    if (cd) return res.status(429).json({ success: false, error: cd });
    const { amount, to } = req.body as { amount: number; to?: string };
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "amount required (USDT, number)" });
    }
    const toAddress = (to && to.startsWith("0x") ? to : undefined) as Address | undefined;
    const agent = await getAgent(agentId);
    if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });
    const amountRaw = BigInt(Math.floor(amount * 1e6));
    const recipient = toAddress ?? agent.wallet;
    const hash = await wdk.signAndSendDraw(agent.wallet, agentId, recipient, amountRaw);
    registerAgentForRepayment(agentId);
    await audit({
      ts: new Date().toISOString(),
      type: "AGENT_DRAW",
      agentId,
      wallet: agent.wallet,
      amountUsdt: amount,
      amountRaw: amountRaw.toString(),
      txHash: hash.hash,
    });
    res.json({ success: true, txHash: hash.hash });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/** POST /agent/:id/repay — agent repays (backend signs via WDK). */
agentsRouter.post("/:id/repay", requireApiKey, requireWritesEnabled, async (req, res) => {
  try {
    const agentId = (req.params.id.startsWith("0x") ? req.params.id : `0x${req.params.id}`) as Hash;
    const cd = enforceCooldown(agentId);
    if (cd) return res.status(429).json({ success: false, error: cd });
    const { amount } = req.body as { amount?: number };
    const agent = await getAgent(agentId);
    if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });
    const repayAmount = amount != null ? BigInt(Math.floor(amount * 1e6)) : agent.drawn;
    if (repayAmount <= 0n || repayAmount > agent.drawn) {
      return res.status(400).json({ success: false, error: "Invalid repay amount" });
    }
    const hash = await wdk.signAndSendRepay(agent.wallet, agentId, repayAmount);
    await audit({
      ts: new Date().toISOString(),
      type: "AGENT_REPAY",
      agentId,
      wallet: agent.wallet,
      amountUsdt: Number(repayAmount) / 1e6,
      amountRaw: repayAmount.toString(),
      txHash: hash.hash,
    });
    res.json({ success: true, txHash: hash.hash });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/** GET /agent/:id/balance — USDT balance of agent wallet (if managed by backend). */
agentsRouter.get("/:id/balance", async (req, res) => {
  try {
    const agentId = (req.params.id.startsWith("0x") ? req.params.id : `0x${req.params.id}`) as Hash;
    const agent = await getAgent(agentId);
    if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });
    const balance = await wdk.getAgentTokenBalance(agent.wallet);
    res.json({ success: true, balanceUsdt: Number(balance) / 1e6 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * POST /agent/:id/request-faucet — give the agent on-chain USDT.
 * Used for "agent uses its own earned revenue to service debt" demo.
 */
agentsRouter.post("/:id/request-faucet", requireApiKey, requireWritesEnabled, async (req, res) => {
  try {
    const agentId = (req.params.id.startsWith("0x") ? req.params.id : `0x${req.params.id}`) as Hash;
    const cd = enforceCooldown(agentId);
    if (cd) return res.status(429).json({ success: false, error: cd });
    const agent = await getAgent(agentId);
    if (!agent) return res.status(404).json({ success: false, error: "Agent not found" });
    const tx = await wdk.signAndSendRequestFaucet(agent.wallet);
    await audit({
      ts: new Date().toISOString(),
      type: "AGENT_REQUEST_FAUCET",
      agentId,
      wallet: agent.wallet,
      txHash: tx.hash,
    });
    res.json({ success: true, txHash: tx.hash });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/**
 * POST /agent/:id/transfer-to/:toId — inter-agent USDT transfer.
 * This enables "agents borrow from other agents" by moving USDT from lender wallet to borrower wallet.
 */
agentsRouter.post("/:id/transfer-to/:toId", requireApiKey, requireWritesEnabled, async (req, res) => {
  try {
    const fromId = (req.params.id.startsWith("0x") ? req.params.id : `0x${req.params.id}`) as Hash;
    const toId = (req.params.toId.startsWith("0x") ? req.params.toId : `0x${req.params.toId}`) as Hash;
    const cd = enforceCooldown(fromId);
    if (cd) return res.status(429).json({ success: false, error: cd });

    const { amount } = req.body as { amount: number };
    if (!amount || amount <= 0) return res.status(400).json({ success: false, error: "amount required (USDT, number)" });
    const amountRaw = BigInt(Math.floor(amount * 1e6));

    const fromAgent = await getAgent(fromId);
    if (!fromAgent) return res.status(404).json({ success: false, error: "From agent not found" });
    const toAgent = await getAgent(toId);
    if (!toAgent) return res.status(404).json({ success: false, error: "To agent not found" });

    const fromBal = await wdk.getAgentTokenBalance(fromAgent.wallet);
    if (fromBal < amountRaw) {
      return res.status(400).json({ success: false, error: "insufficient USDT balance in lender agent" });
    }

    const tx = await wdk.signAndSendTokenTransfer(fromAgent.wallet, toAgent.wallet, amountRaw);

    await audit({
      ts: new Date().toISOString(),
      type: "AGENT_TRANSFER",
      agentId: fromId,
      wallet: fromAgent.wallet,
      amountUsdt: amount,
      amountRaw: amountRaw.toString(),
      txHash: tx.hash,
      meta: { toAgentId: toId, toWallet: toAgent.wallet },
    });

    res.json({ success: true, txHash: tx.hash });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});
