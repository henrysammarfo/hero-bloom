import { appendFile } from "node:fs/promises";
import { config } from "../config.js";

type AuditEvent = {
  ts: string;
  type:
    | "AGENT_REGISTER_WALLET"
    | "AGENT_DRAW"
    | "AGENT_REPAY"
    | "AGENT_REQUEST_FAUCET"
    | "AGENT_TRANSFER"
    | "REPAYMENT_MONITOR_REPAY"
    | "OPPORTUNITIES_FETCH";
  agentId?: string;
  wallet?: string;
  amountUsdt?: number;
  amountRaw?: string;
  txHash?: string;
  meta?: Record<string, unknown>;
};

export async function audit(event: AuditEvent): Promise<void> {
  const line = JSON.stringify(event) + "\n";
  try {
    await appendFile(config.auditLogPath, line, { encoding: "utf8" });
  } catch (e) {
    // Avoid crashing core flows if disk is unavailable.
    if (config.nodeEnv !== "production") {
      console.warn("[AUDIT] Failed to write audit log:", e);
    }
  }
}

