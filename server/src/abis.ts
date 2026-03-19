/**
 * Minimal ABIs for encoding contract calls and reading chain state.
 */

export const registryAbi = [
  {
    inputs: [{ name: "operator", type: "address" }],
    name: "getAgentIdsByOperator",
    outputs: [{ name: "", type: "bytes32[]" }],
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

export const poolAbi = [
  {
    inputs: [],
    name: "poolBalance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "draw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "amount", type: "uint256" },
    ],
    name: "repay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const erc20Abi = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const mockUsdtAbi = [
  {
    inputs: [],
    name: "requestFaucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
