import { Router } from "express";
import { audit } from "../services/audit.service.js";

type Opportunity = {
  id: string;
  name: string;
  chain: string;
  project: string;
  symbol: string;
  apy: number;
  tvlUsd?: number;
  url?: string;
  source: "defillama";
};

let cached: { atMs: number; items: Opportunity[] } | null = null;
const CACHE_MS = 60_000;

async function fetchDefiLlamaStablecoinYields(limit: number): Promise<Opportunity[]> {
  // DefiLlama yields API is public. We only use it as a *signal source* for the agent strategy.
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 10_000);
  try {
    const resp = await fetch("https://yields.llama.fi/pools", { signal: controller.signal });
    if (!resp.ok) throw new Error(`DefiLlama yields error: HTTP ${resp.status}`);
    const data = (await resp.json()) as {
      data: Array<{
        pool: string;
        chain: string;
        project: string;
        symbol: string;
        apy: number;
        tvlUsd?: number;
        url?: string;
        stablecoin?: boolean;
      }>;
    };

    const stable = data.data
      .filter((p) => p.stablecoin === true || /USDT|USDC|DAI|TUSD|FRAX/i.test(p.symbol))
      .filter((p) => typeof p.apy === "number" && Number.isFinite(p.apy))
      .sort((a, b) => (b.apy ?? 0) - (a.apy ?? 0))
      .slice(0, Math.max(1, Math.min(50, limit)));

    return stable.map((p) => ({
      id: p.pool,
      name: `${p.project} ${p.symbol}`.trim(),
      chain: p.chain,
      project: p.project,
      symbol: p.symbol,
      apy: p.apy,
      tvlUsd: p.tvlUsd,
      url: p.url,
      source: "defillama",
    }));
  } finally {
    clearTimeout(t);
  }
}

export const opportunitiesRouter = Router();

/**
 * GET /opportunities
 * Returns external yield opportunities for the OpenClaw strategy.
 */
opportunitiesRouter.get("/", async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, parseInt(String(req.query.limit ?? "10"), 10)));
    const now = Date.now();
    if (cached && now - cached.atMs < CACHE_MS && cached.items.length >= limit) {
      return res.json({ success: true, source: "defillama", cached: true, opportunities: cached.items.slice(0, limit) });
    }

    const items = await fetchDefiLlamaStablecoinYields(limit);
    cached = { atMs: now, items };
    await audit({ ts: new Date().toISOString(), type: "OPPORTUNITIES_FETCH", meta: { limit, count: items.length } });
    res.json({ success: true, source: "defillama", cached: false, opportunities: items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({ success: false, error: msg });
  }
});

