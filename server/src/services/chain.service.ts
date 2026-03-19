/**
 * Read from Sepolia: registry (getAgent), pool (poolBalance).
 * Uses viem public client only; no signing here.
 */
import { createPublicClient, http, type Address, type Hash } from "viem";
import { sepolia } from "viem/chains";
import { registryAbi, poolAbi } from "../abis.js";
import { config } from "../config.js";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(config.alchemySepoliaUrl),
});

export type AgentOnChain = {
  wallet: Address;
  operator: Address;
  creditLimit: bigint;
  drawn: bigint;
  riskTier: number;
  active: boolean;
};

export async function getAgent(agentId: Hash): Promise<AgentOnChain | null> {
  const [wallet, operator, creditLimit, drawn, riskTier, active] = await publicClient.readContract({
    address: config.registryAddress,
    abi: registryAbi,
    functionName: "getAgent",
    args: [agentId],
  }).catch(() => [null, null, 0n, 0n, 0, false] as const);
  if (!wallet || wallet === "0x0000000000000000000000000000000000000000") return null;
  return { wallet, operator: operator!, creditLimit, drawn, riskTier, active };
}

export async function getPoolBalance(): Promise<bigint> {
  return publicClient.readContract({
    address: config.poolAddress,
    abi: poolAbi,
    functionName: "poolBalance",
  });
}

export async function getAgentIdsByOperator(operator: Address): Promise<Hash[]> {
  const ids = await publicClient.readContract({
    address: config.registryAddress,
    abi: registryAbi,
    functionName: "getAgentIdsByOperator",
    args: [operator],
  });
  return [...ids] as Hash[];
}
