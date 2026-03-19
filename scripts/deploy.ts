import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT:", usdtAddress);

  const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
  const registry = await CircuitRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("CircuitRegistry:", registryAddress);

  const CircuitPool = await ethers.getContractFactory("CircuitPool");
  const pool = await CircuitPool.deploy(usdtAddress, registryAddress);
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("CircuitPool:", poolAddress);

  await (await registry.setPool(poolAddress)).wait();
  console.log("Registry pool set");

  const decimals = 6;
  const poolMint = ethers.parseUnits("100000", decimals);
  await (await usdt.mint(poolAddress, poolMint)).wait();
  console.log("Minted 100,000 USDT to pool");

  const faucetReserve = ethers.parseUnits("500000", decimals);
  await (await usdt.mint(usdtAddress, faucetReserve)).wait();
  console.log("Minted 500,000 USDT to faucet reserve (MockUSDT contract)");

  console.log("\n--- Summary ---");
  console.log("MOCK_USDT:", usdtAddress);
  console.log("CIRCUIT_REGISTRY:", registryAddress);
  console.log("CIRCUIT_POOL:", poolAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
