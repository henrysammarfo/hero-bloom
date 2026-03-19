import { useAccount, useReadContracts } from "wagmi";
import { useMemo } from "react";
import { formatUnits } from "viem";
import {
  hasContracts,
  CIRCUIT_REGISTRY_ADDRESS,
  circuitRegistryAbi,
  type AgentRow,
} from "@/lib/contracts";

const RISK_TIERS = ["", "A", "B", "C"] as const;

export function useOperatorAgents(): {
  agents: AgentRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { address: operatorAddress } = useAccount();

  const { data: idsData, isLoading: idsLoading, error: idsError, refetch: refetchIds } = useReadContracts({
    contracts: !hasContracts || !operatorAddress
      ? []
      : [
          {
            address: CIRCUIT_REGISTRY_ADDRESS,
            abi: circuitRegistryAbi,
            functionName: "getAgentIdsByOperator",
            args: [operatorAddress],
          },
        ],
  });

  const agentIds = useMemo(() => {
    if (!idsData?.[0]?.result || !Array.isArray(idsData[0].result)) return [];
    return idsData[0].result as `0x${string}`[];
  }, [idsData]);

  const agentContracts = useMemo(() => {
    if (!hasContracts || !CIRCUIT_REGISTRY_ADDRESS || agentIds.length === 0) return [];
    return agentIds.map((agentId) => ({
      address: CIRCUIT_REGISTRY_ADDRESS,
      abi: circuitRegistryAbi,
      functionName: "getAgent" as const,
      args: [agentId] as const,
    }));
  }, [agentIds]);

  const { data: agentsData, isLoading: agentsLoading, refetch: refetchAgents } = useReadContracts({
    contracts: agentContracts,
  });

  const agents = useMemo((): AgentRow[] => {
    if (!agentsData || agentsData.length === 0) return [];
    return agentsData
      .map((res, i) => {
        if (res.status !== "success" || !res.result) return null;
        const [wallet, operator, creditLimit, drawn, riskTier, active] = res.result as [string, string, bigint, bigint, number, boolean];
        const id = agentIds[i];
        if (!id) return null;
        const limit = Number(formatUnits(creditLimit, 6));
        const drawnNum = Number(formatUnits(drawn, 6));
        const utilization = limit > 0 ? Math.round((drawnNum / limit) * 100) : 0;
        return {
          id,
          wallet,
          operator,
          creditLimit: limit,
          drawn: drawnNum,
          riskTier: RISK_TIERS[riskTier] ?? "B",
          active,
          utilization,
        };
      })
      .filter((a): a is AgentRow => a != null);
  }, [agentsData, agentIds]);

  const refetch = () => {
    refetchIds();
    refetchAgents();
  };

  return {
    agents,
    isLoading: idsLoading || agentsLoading,
    error: idsError ?? null,
    refetch,
  };
}
