// Hardhat config (CommonJS) for CIRCUIT.
require("dotenv/config");
require("@nomicfoundation/hardhat-toolbox");

const { task } = require("hardhat/config");

// Task: register a WDK agent wallet on Sepolia
// Usage:
//   npx hardhat register-wdk-agent --wallet 0x... --credit 1000 --network sepolia
task("register-wdk-agent", "Register a WDK agent wallet in CircuitRegistry")
  .addParam("wallet", "Agent wallet address (WDK-managed, 0x...)")
  .addOptionalParam("credit", "Credit limit in USDT (default 1000)", "1000")
  .setAction(async ({ wallet, credit }, { ethers }) => {
    const registryAddress =
      process.env.VITE_CIRCUIT_REGISTRY_ADDRESS || process.env.CIRCUIT_REGISTRY_ADDRESS;
    if (!registryAddress) {
      throw new Error("CIRCUIT_REGISTRY_ADDRESS / VITE_CIRCUIT_REGISTRY_ADDRESS not set in .env");
    }

    const [deployer] = await ethers.getSigners();
    console.log("Registering agent with deployer:", deployer.address);
    console.log("Registry:", registryAddress);
    console.log("Agent wallet:", wallet);
    console.log("Requested credit (USDT):", credit);

    const registry = await ethers.getContractAt("CircuitRegistry", registryAddress);
    const creditLimit = ethers.parseUnits(String(credit), 6); // USDT has 6 decimals

    const tx = await registry.registerAgent(wallet, creditLimit, 1);
    console.log("Tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Tx confirmed in block:", receipt.blockNumber);

    const agentId = await registry.agentIdByWallet(wallet);
    console.log("Registered agentId:", agentId);
  });

/** @type import("hardhat/config").HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  networks: {
    sepolia: {
      url: process.env.VITE_ALCHEMY_API_KEY
        ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.VITE_ALCHEMY_API_KEY}`
        : "https://rpc.sepolia.org",
      accounts: (process.env.FUNDED_WALLET_PRIVATE_KEY ?? "").startsWith("0x")
        ? [process.env.FUNDED_WALLET_PRIVATE_KEY]
        : [`0x${process.env.FUNDED_WALLET_PRIVATE_KEY ?? ""}`],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.VITE_ETHERSCAN_API_KEY ?? "",
    },
  },
};

module.exports = config;

