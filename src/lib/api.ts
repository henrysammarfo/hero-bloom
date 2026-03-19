/**
 * Backend API client for CIRCUIT. Uses VITE_API_URL when set.
 */

const getBase = () => (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export const hasApi = () => !!getBase();

export type AgentScore = {
  creditLimitUsdt: number;
  riskTier: string;
  probabilityOfDefault?: number;
  reasoning?: string;
  drawn: number;
  active: boolean;
  wallet?: string;
};

export type PoolStats = {
  totalTvlUsdt: number;
  poolBalanceRaw: string;
};

export type OperatorAgent = {
  agentId: string;
  wallet: string;
  creditLimitUsdt: number;
  drawnUsdt: number;
  riskTier: string;
  active: boolean;
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<{ data?: T; error?: string }> {
  const base = getBase();
  if (!base) return { error: "No API URL" };
  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: (json as { error?: string }).error ?? res.statusText };
    return { data: json as T };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Network error" };
  }
}

/** Create a WDK agent wallet; use returned address in Register Agent. */
export async function registerAgentApi(): Promise<{ walletAddress?: string; error?: string }> {
  const { data, error } = await fetchJson<{ walletAddress: string }>("/agent/register", {
    method: "POST",
  });
  if (error) return { error };
  return { walletAddress: data!.walletAddress };
}

/** Get credit score (OpenAI/Flock when configured, else on-chain). */
export async function getAgentScoreApi(agentId: string): Promise<{ data?: AgentScore; error?: string }> {
  const id = agentId.startsWith("0x") ? agentId : `0x${agentId}`;
  return fetchJson<AgentScore>(`/agent/${id}/score`);
}

/** Draw USDT from pool via backend (WDK signs). */
export async function drawCreditApi(agentId: string, amount: number, to?: string): Promise<{ txHash?: string; error?: string }> {
  const id = agentId.startsWith("0x") ? agentId : `0x${agentId}`;
  const { data, error } = await fetchJson<{ txHash: string }>(`/agent/${id}/draw`, {
    method: "POST",
    body: JSON.stringify({ amount, to }),
  });
  if (error) return { error };
  return { txHash: data!.txHash };
}

/** Repay via backend (WDK signs). */
export async function repayCreditApi(agentId: string, amount?: number): Promise<{ txHash?: string; error?: string }> {
  const id = agentId.startsWith("0x") ? agentId : `0x${agentId}`;
  const { data, error } = await fetchJson<{ txHash: string }>(`/agent/${id}/repay`, {
    method: "POST",
    body: JSON.stringify(amount != null ? { amount } : {}),
  });
  if (error) return { error };
  return { txHash: data!.txHash };
}

/** Request MockUSDT faucet for agent wallet via backend signer. */
export async function requestAgentFaucetApi(agentId: string): Promise<{ txHash?: string; error?: string }> {
  const id = agentId.startsWith("0x") ? agentId : `0x${agentId}`;
  const { data, error } = await fetchJson<{ txHash: string }>(`/agent/${id}/request-faucet`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  if (error) return { error };
  return { txHash: data!.txHash };
}

/** Transfer USDT from one agent wallet to another (inter-agent lending flow). */
export async function transferAgentToAgentApi(
  fromAgentId: string,
  toAgentId: string,
  amount: number
): Promise<{ txHash?: string; error?: string }> {
  const fromId = fromAgentId.startsWith("0x") ? fromAgentId : `0x${fromAgentId}`;
  const toId = toAgentId.startsWith("0x") ? toAgentId : `0x${toAgentId}`;
  const { data, error } = await fetchJson<{ txHash: string }>(`/agent/${fromId}/transfer-to/${toId}`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
  if (error) return { error };
  return { txHash: data!.txHash };
}

/** Pool TVL from backend (reads chain). */
export async function getPoolStatsApi(): Promise<{ data?: PoolStats; error?: string }> {
  return fetchJson<PoolStats>("/pool/stats");
}

/** List agents for an operator address. */
export async function getOperatorAgentsApi(operatorAddress: string): Promise<{ data?: OperatorAgent[]; error?: string }> {
  const id = operatorAddress.startsWith("0x") ? operatorAddress : `0x${operatorAddress}`;
  const { data, error } = await fetchJson<{ agents: OperatorAgent[] }>(`/operator/${id}/agents`);
  if (error) return { error };
  return { data: data!.agents };
}
