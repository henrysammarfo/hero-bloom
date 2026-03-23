/**
 * Pool routes: stats (from chain), deposit (record or forward — LP can use frontend to deposit to contract).
 */
import { Router } from "express";
import { readFile } from "node:fs/promises";
import { getPoolBalance } from "../services/chain.service.js";
import { config } from "../config.js";

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

/** GET /pool/activity — recent draw and repay events from the audit log. */
poolRouter.get("/activity", async (_req, res) => {
  try {
    const raw = await readFile(config.auditLogPath, "utf8").catch(() => "");
    const lines = raw.split("\n").filter(Boolean).slice(-50).reverse();
    const actions = lines
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter((e) => e && e.type); // Include all valid audit types
    res.json({
      success: true,
      activity: actions,
      events: actions, // Alias for compatibility
      history: actions, // Alias for compatibility
    });
  } catch (e) {
    res.status(500).json({ success: false, error: "Failed to load activity" });
  }
});
