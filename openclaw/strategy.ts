import axios from 'axios';
import 'dotenv/config';

/**
 * CIRCUIT OpenClaw Strategy
 * Autonomous agent that decides when to borrow (draw) and repay.
 */

const API_URL = process.env.CIRCUIT_API_URL || 'http://localhost:3001';
const AGENT_ID = process.env.CIRCUIT_AGENT_ID || '';
const AGENT_ENABLED = process.env.CIRCUIT_AGENT_ENABLED === 'true';
const TICK_INTERVAL_MS = 30000; // 30 seconds

interface PoolStats {
  totalTvlUsdt: number;
  poolBalanceRaw: string;
}

interface AgentScore {
  creditLimitUsdt: number;
  drawnUsdt: number;
  riskTier: number;
  probabilityOfDefault: number;
  wallet: string;
}

interface Opportunity {
  id: string;
  apy: number;
  chain: string;
  project: string;
  symbol: string;
}

let lastApy = 0;
let lastBalance = 0;
let lastActionTime = 0;
const COOLDOWN_MS = 60000;

async function logDecision(action: string, amountUsdt: number, reason: string, stats: any) {
  const log = {
    ts: new Date().toISOString(),
    agentId: AGENT_ID,
    ...stats,
    action,
    amountUsdt,
    reason,
  };
  console.log(JSON.stringify(log));
}

async function tick() {
  if (!AGENT_ENABLED) {
    console.log('Agent disabled via CIRCUIT_AGENT_ENABLED');
    return;
  }

  if (!AGENT_ID) {
    console.error('CIRCUIT_AGENT_ID not set');
    return;
  }

  try {
    // 1. Fetch Inputs
    const [statsRes, scoreRes, oppsRes] = await Promise.all([
      axios.get(`${API_URL}/pool/stats`),
      axios.get(`${API_URL}/agent/${AGENT_ID}/score`),
      axios.get(`${API_URL}/opportunities?limit=10`),
    ]);

    const stats: PoolStats = statsRes.data;
    const score: AgentScore = scoreRes.data;
    const opportunities: Opportunity[] = oppsRes.data.opportunities;

    const { creditLimitUsdt, drawnUsdt, probabilityOfDefault: pd } = score;
    const bestApy = Math.max(...opportunities.map(o => o.apy), 0);
    const currentBalanceRes = await axios.get(`${API_URL}/agent/${AGENT_ID}/score`); // Re-using score endpoint for balance/wallet if needed
    // Assuming backend returns balance in a dedicated endpoint or inside score as per handoff
    // The handoff mentions GET /agent/:id/balance but then redirects to /score for info.
    // Let's use getAgentTokenBalance logic if it was in the service.
    // Actually, the handoff says: "The agent watches its own wallet USDT balance (GET /agent/:id/balance) every tick."
    // If it's not there, I'll use /score for now or assume a balance endpoint exists.
    
    // 2. Revenue Detection
    const balanceRes = await axios.get(`${API_URL}/agent/${AGENT_ID}/balance`);
    const currentBalance = balanceRes.data.balanceUsdt;
    const revenueReceived = lastBalance > 0 && currentBalance >= lastBalance + 50;
    
    const statsForLog = {
      creditLimitUsdt,
      drawnUsdt,
      probabilityOfDefault: pd,
      bestApy,
      currentBalance,
    };

    const now = Date.now();
    const inCooldown = now - lastActionTime < COOLDOWN_MS;

    // 3. Repay Decision
    if (drawnUsdt > 0) {
      let repayReason = '';
      if (pd > 0.5) repayReason = `Risk too high (PD: ${pd})`;
      else if (bestApy < 6) repayReason = `APY too low (${bestApy}%)`;
      else if (revenueReceived) repayReason = `Revenue received (+50 USDT from faucet/earnings)`;

      if (repayReason && !inCooldown) {
        await axios.post(`${API_URL}/agent/${AGENT_ID}/repay`, {});
        await logDecision('REPAY', drawnUsdt, repayReason, statsForLog);
        lastActionTime = now;
        lastBalance = 0; // Reset after repay
        return;
      }
    }

    // 4. Borrow Decision (Draw)
    const headroomUsdt = creditLimitUsdt - drawnUsdt;
    const maxSafeDrawUsdt = Math.floor(headroomUsdt * 0.8);

    if (maxSafeDrawUsdt >= 50 && pd <= 0.45 && bestApy >= 8 && !inCooldown) {
      const drawAmountUsdt = Math.min(maxSafeDrawUsdt, 500);
      await axios.post(`${API_URL}/agent/${AGENT_ID}/draw`, { amount: drawAmountUsdt });
      await logDecision('DRAW', drawAmountUsdt, `Borrowing because best APY is ${bestApy}% and PD is ${pd}`, statsForLog);
      
      // Simulate revenue by requesting faucet after draw for demo
      // After drawing, the agent must call request-faucet once to generate revenue, then repay when that revenue arrives.
      await axios.post(`${API_URL}/agent/${AGENT_ID}/request-faucet`, {});
      
      lastActionTime = now;
      lastBalance = currentBalance; // Balance is checked next tick
      return;
    }

    // 4. Capital Reallocation / APY Change
    if (lastApy > 0 && bestApy >= lastApy + 2) {
      // Re-evaluate borrowing if APY improved significantly
      await logDecision('INFO', 0, `APY improved from ${lastApy}% to ${bestApy}%. Investigating further draw.`, statsForLog);
    } else if (lastApy > 0 && bestApy <= lastApy - 2) {
      await logDecision('INFO', 0, `APY dropped from ${lastApy}% to ${bestApy}%. Pausing new borrows.`, statsForLog);
    }

    lastApy = bestApy;
    lastBalance = currentBalance;

  } catch (error: any) {
    console.error('Error in tick:', error.message);
  }
}

console.log(`OpenClaw starting for Agent ${AGENT_ID}...`);
setInterval(tick, TICK_INTERVAL_MS);
tick();
