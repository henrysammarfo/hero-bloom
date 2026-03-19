/**
 * Credit scoring: OpenAI or Flock AI (OpenAI-compatible).
 * Uses on-chain agent data (wallet, limit, drawn, riskTier) and returns suggested limit + tier.
 */
import OpenAI from "openai";
import { config } from "../config.js";

export type ScoringInput = {
  wallet: string;
  creditLimitUsdt: number;
  drawnUsdt: number;
  riskTier: string;
  active: boolean;
};

export type ScoringResult = {
  creditLimitUsdt: number;
  riskTier: "A" | "B" | "C";
  /**
   * Probability of default (0..1) predicted by the LLM from on-chain data.
   * Hackathon-friendly proxy metric (not financial advice).
   */
  probabilityOfDefault: number;
  reasoning: string;
};

function getClient(): OpenAI | null {
  if (config.flockApiKey.trim()) {
    return new OpenAI({
      apiKey: config.flockApiKey,
      baseURL: "https://api.flock.io/v1",
    });
  }
  if (config.openaiApiKey.trim()) {
    return new OpenAI({ apiKey: config.openaiApiKey });
  }
  return null;
}

function getModel(): string {
  if (config.flockApiKey.trim()) {
    return config.scoringModel.trim() || "qwen3-30b-a3b-instruct-2507";
  }
  return config.scoringModel.trim() || "gpt-4o-mini";
}

const SYSTEM_PROMPT = `You are a credit scoring agent for AI autonomous task agents. You evaluate agents based on their on-chain financial data and suggest:
1) a credit limit in USDT,
2) a risk tier (A, B, or C),
3) a probability of default between 0 and 1.

Be conservative but fair. Return ONLY valid JSON with no markdown or extra text.`;

function buildUserPrompt(input: ScoringInput): string {
  return `Agent wallet: ${input.wallet}
Current credit limit (USDT): ${input.creditLimitUsdt}
Currently drawn (USDT): ${input.drawnUsdt}
Current risk tier: ${input.riskTier}
Active: ${input.active}

Score this agent and return JSON only:
{"creditLimitUsdt": number, "riskTier": "A"|"B"|"C", "probabilityOfDefault": number, "reasoning": "one sentence"}`;
}

export async function scoreAgent(input: ScoringInput): Promise<ScoringResult | null> {
  const client = getClient();
  if (!client) return null;

  const model = getModel();
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    temperature: 0.3,
    max_tokens: 256,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as {
      creditLimitUsdt?: number;
      riskTier?: string;
      probabilityOfDefault?: number;
      reasoning?: string;
    };
    const creditLimitUsdt = typeof parsed.creditLimitUsdt === "number" ? parsed.creditLimitUsdt : input.creditLimitUsdt;
    const riskTier = ["A", "B", "C"].includes(parsed.riskTier ?? "") ? (parsed.riskTier as "A" | "B" | "C") : (input.riskTier as "A" | "B" | "C");
    const probabilityOfDefaultRaw = parsed.probabilityOfDefault;
    const probabilityOfDefault =
      typeof probabilityOfDefaultRaw === "number"
        ? Math.max(0, Math.min(1, probabilityOfDefaultRaw))
        : input.riskTier === "A"
          ? 0.1
          : input.riskTier === "B"
            ? 0.25
            : 0.45;
    return {
      creditLimitUsdt,
      riskTier,
      probabilityOfDefault,
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "On-chain data reviewed.",
    };
  } catch {
    return null;
  }
}
