import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { CIRCUIT_POOL_ADDRESS, circuitPoolAbi, hasContracts } from "@/lib/contracts";

export interface PoolActivityEvent {
  id: string;
  type: "draw" | "repay";
  agentId: `0x${string}`;
  address: string;
  amount: number;
  blockNumber: bigint;
  transactionHash: string;
}

export function usePoolActivity(limit = 20): { events: PoolActivityEvent[]; isLoading: boolean } {
  const publicClient = usePublicClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["poolActivity", CIRCUIT_POOL_ADDRESS, publicClient?.chain?.id],
    queryFn: async (): Promise<PoolActivityEvent[]> => {
      if (!hasContracts || !CIRCUIT_POOL_ADDRESS || !publicClient) return [];
      const blockNumber = await publicClient.getBlockNumber();
      const fromBlock = blockNumber - 10000n < 0n ? 0n : blockNumber - 10000n;
      const [drawLogs, repayLogs] = await Promise.all([
        publicClient.getContractEvents({
          address: CIRCUIT_POOL_ADDRESS,
          abi: circuitPoolAbi,
          eventName: "Draw",
          fromBlock,
          toBlock: blockNumber,
        }),
        publicClient.getContractEvents({
          address: CIRCUIT_POOL_ADDRESS,
          abi: circuitPoolAbi,
          eventName: "Repay",
          fromBlock,
          toBlock: blockNumber,
        }),
      ]);
      const mapped: PoolActivityEvent[] = [
        ...drawLogs.map((e) => ({
          id: `${e.transactionHash}-${e.logIndex}-draw`,
          type: "draw" as const,
          agentId: e.args.agentId!,
          address: e.args.to!,
          amount: Number(e.args.amount!) / 1e6,
          blockNumber: e.blockNumber!,
          transactionHash: e.transactionHash,
        })),
        ...repayLogs.map((e) => ({
          id: `${e.transactionHash}-${e.logIndex}-repay`,
          type: "repay" as const,
          agentId: e.args.agentId!,
          address: e.args.from!,
          amount: Number(e.args.amount!) / 1e6,
          blockNumber: e.blockNumber!,
          transactionHash: e.transactionHash,
        })),
      ];
      mapped.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      return mapped.slice(0, limit);
    },
    enabled: !!publicClient && hasContracts && !!CIRCUIT_POOL_ADDRESS,
    staleTime: 15_000,
  });

  return { events, isLoading };
}
