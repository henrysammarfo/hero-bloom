/**
 * Pool routes: stats (from chain), deposit (record or forward — LP can use frontend to deposit to contract).
 */
import { Router } from "express";
import { getPoolBalance } from "../services/chain.service.js";

export const poolRouter = Router();

/** GET /pool/stats — TVL and basic stats from chain. */
poolRouter.get("/stats", async (_req, res) => {
  try {
    const poolBalance = await getPoolBalance();
    const tvlUsdt = Number(poolBalance) / 1e6;
    res.json({
      success: true,
      totalTvlUsdt: tvlUsdt,
      poolBalanceRaw: poolBalance.toString(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

/** POST /pool/deposit — for demo we don't move funds here; LP uses frontend to approve + deposit to CircuitPool. */
poolRouter.post("/deposit", async (req, res) => {
  try {
    const { walletAddress, amount } = req.body as { walletAddress?: string; amount?: number };
    if (!walletAddress || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "walletAddress and amount required" });
    }
    res.json({
      success: true,
      message: "Use frontend to deposit: connect wallet, approve MockUSDT, then call CircuitPool.deposit(amount).",
      amountUsdt: amount,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});
