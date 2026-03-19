import { expect } from "chai";
import * as hre from "hardhat";
const { ethers } = hre;

describe("CircuitPool", function () {
  it("Should deploy with valid token and registry", async function () {
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    const CircuitPool = await ethers.getContractFactory("CircuitPool");
    const pool = await CircuitPool.deploy(await usdt.getAddress(), await registry.getAddress());
    await pool.waitForDeployment();
    expect(await pool.poolBalance()).to.equal(0);
  });

  it("Should reject deploy with zero token or registry", async function () {
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    const CircuitPool = await ethers.getContractFactory("CircuitPool");
    await expect(CircuitPool.deploy(ethers.ZeroAddress, await registry.getAddress())).to.be.revertedWith("CircuitPool: zero token");
    await expect(CircuitPool.deploy(await usdt.getAddress(), ethers.ZeroAddress)).to.be.revertedWith("CircuitPool: zero registry");
  });

  it("Should deposit and allow agent draw and repay", async function () {
    const [deployer, lp, operator, agentWallet] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    const CircuitPool = await ethers.getContractFactory("CircuitPool");
    const pool = await CircuitPool.deploy(await usdt.getAddress(), await registry.getAddress());
    await pool.waitForDeployment();
    await registry.setPool(await pool.getAddress());

    const supply = ethers.parseUnits("10000", 6);
    await usdt.mint(lp.address, supply);
    await usdt.connect(lp).approve(await pool.getAddress(), supply);
    await pool.connect(lp).deposit(supply);
    expect(await pool.poolBalance()).to.equal(supply);

    await registry.connect(operator).registerAgent(agentWallet.address, ethers.parseUnits("500", 6), 1);
    const ids = await registry.getAgentIdsByOperator(operator.address);
    const agentId = ids[0];

    const drawAmount = ethers.parseUnits("100", 6);
    await pool.connect(agentWallet).draw(agentId, agentWallet.address, drawAmount);
    expect(await usdt.balanceOf(agentWallet.address)).to.equal(drawAmount);
    expect(await pool.poolBalance()).to.equal(supply - drawAmount);

    await usdt.connect(agentWallet).approve(await pool.getAddress(), drawAmount);
    await pool.connect(agentWallet).repay(agentId, drawAmount);
    expect(await usdt.balanceOf(agentWallet.address)).to.equal(0);
    expect(await pool.poolBalance()).to.equal(supply);
  });

  it("Should reject draw over limit and repay over drawn", async function () {
    const [deployer, lp, operator, agentWallet] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    const CircuitPool = await ethers.getContractFactory("CircuitPool");
    const pool = await CircuitPool.deploy(await usdt.getAddress(), await registry.getAddress());
    await pool.waitForDeployment();
    await registry.setPool(await pool.getAddress());
    await usdt.mint(lp.address, ethers.parseUnits("10000", 6));
    await usdt.connect(lp).approve(await pool.getAddress(), ethers.MaxUint256);
    await pool.connect(lp).deposit(ethers.parseUnits("10000", 6));

    await registry.connect(operator).registerAgent(agentWallet.address, ethers.parseUnits("100", 6), 1);
    const agentIds = await registry.getAgentIdsByOperator(operator.address);
    const agentId = agentIds[0];

    await expect(pool.connect(agentWallet).draw(agentId, agentWallet.address, ethers.parseUnits("101", 6))).to.be.revertedWith("CircuitPool: over limit");
    await pool.connect(agentWallet).draw(agentId, agentWallet.address, ethers.parseUnits("50", 6));
    await expect(pool.connect(agentWallet).repay(agentId, ethers.parseUnits("51", 6))).to.be.revertedWith("CircuitPool: repay over drawn");
  });

  it("Should reject draw over 5% of pool per agent (Bible risk cap)", async function () {
    const [deployer, lp, operator, agentWallet] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    const CircuitPool = await ethers.getContractFactory("CircuitPool");
    const pool = await CircuitPool.deploy(await usdt.getAddress(), await registry.getAddress());
    await pool.waitForDeployment();
    await registry.setPool(await pool.getAddress());
    const poolAmount = ethers.parseUnits("10000", 6); // 5% = 500
    await usdt.mint(lp.address, poolAmount);
    await usdt.connect(lp).approve(await pool.getAddress(), poolAmount);
    await pool.connect(lp).deposit(poolAmount);

    await registry.connect(operator).registerAgent(agentWallet.address, ethers.parseUnits("1000", 6), 1);
    const agentIds = await registry.getAgentIdsByOperator(operator.address);
    const agentId = agentIds[0];

    await expect(pool.connect(agentWallet).draw(agentId, agentWallet.address, ethers.parseUnits("501", 6))).to.be.revertedWith("CircuitPool: over 5% per agent");
    await pool.connect(agentWallet).draw(agentId, agentWallet.address, ethers.parseUnits("500", 6));
  });

  it("Should reject draw over 20% of pool per operator (Bible risk cap)", async function () {
    const [deployer, lp, operator, agent1Wallet, agent2Wallet] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    const CircuitPool = await ethers.getContractFactory("CircuitPool");
    const pool = await CircuitPool.deploy(await usdt.getAddress(), await registry.getAddress());
    await pool.waitForDeployment();
    await registry.setPool(await pool.getAddress());
    const poolAmount = ethers.parseUnits("10000", 6); // 20% = 2000
    await usdt.mint(lp.address, poolAmount);
    await usdt.connect(lp).approve(await pool.getAddress(), poolAmount);
    await pool.connect(lp).deposit(poolAmount);

    await registry.connect(operator).registerAgent(agent1Wallet.address, ethers.parseUnits("1000", 6), 1);
    await registry.connect(operator).registerAgent(agent2Wallet.address, ethers.parseUnits("1000", 6), 1);
    const agentIds = await registry.getAgentIdsByOperator(operator.address);
    const agentId1 = agentIds[0];
    const agentId2 = agentIds[1];

    await pool.connect(agent1Wallet).draw(agentId1, agent1Wallet.address, ethers.parseUnits("500", 6));
    await pool.connect(agent2Wallet).draw(agentId2, agent2Wallet.address, ethers.parseUnits("500", 6)); // 1000 total
    await expect(pool.connect(agent1Wallet).draw(agentId1, agent1Wallet.address, ethers.parseUnits("1001", 6))).to.be.revertedWith("CircuitPool: over 20% per operator");
  });
});
