/**
 * Contract addresses and ABIs for CIRCUIT on Sepolia.
 * Addresses come from env (set after deploy). No keys or secrets here.
 */

export const CIRCUIT_REGISTRY_ADDRESS = (import.meta.env.VITE_CIRCUIT_REGISTRY_ADDRESS ?? "") as `0x${string}`;
export const CIRCUIT_POOL_ADDRESS = (import.meta.env.VITE_CIRCUIT_POOL_ADDRESS ?? "") as `0x${string}`;
export const MOCK_USDT_ADDRESS = (import.meta.env.VITE_MOCK_USDT_ADDRESS ?? "") as `0x${string}`;

export const hasFaucet = !!import.meta.env.VITE_MOCK_USDT_ADDRESS;

export const hasContracts =
  !!import.meta.env.VITE_CIRCUIT_REGISTRY_ADDRESS &&
  !!import.meta.env.VITE_CIRCUIT_POOL_ADDRESS;

export const USDT_DECIMALS = 6;

export interface AgentRow {
  id: `0x${string}`;
  wallet: string;
  operator: string;
  creditLimit: number;
  drawn: number;
  riskTier: "A" | "B" | "C";
  active: boolean;
  utilization: number;
}

/** Minimal ABI for CircuitRegistry — register + read */
export const circuitRegistryAbi = [
  {
    inputs: [
      { name: "agentWallet", type: "address" },
      { name: "creditLimit", type: "uint256" },
      { name: "riskTier", type: "uint8" },
    ],
    name: "registerAgent",
    outputs: [{ name: "agentId", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "operator", type: "address" }],
    name: "getAgentIdsByOperator",
    outputs: [{ name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "operator", type: "address" }],
    name: "totalDrawnByOperator",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "agentId", type: "bytes32" }],
    name: "getAgent",
    outputs: [
      { name: "wallet", type: "address" },
      { name: "operator", type: "address" },
      { name: "creditLimit", type: "uint256" },
      { name: "drawn", type: "uint256" },
      { name: "riskTier", type: "uint8" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/** ABI for CircuitPool — balance + events for Sessions/Activity */
export const circuitPoolAbi = [
  {
    inputs: [],
    name: "poolBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    type: "event",
    name: "Draw",
    inputs: [
      { name: "agentId", type: "bytes32", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Repay",
    inputs: [
      { name: "agentId", type: "bytes32", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

/** MockUSDT — faucet for testnet */
export const mockUsdtAbi = [
  {
    inputs: [],
    name: "requestFaucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "nextFaucetAt",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FAUCET_AMOUNT",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
