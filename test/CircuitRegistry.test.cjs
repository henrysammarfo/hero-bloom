require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CircuitRegistry", function () {
  it("Should set pool once and reject zero", async function () {
    const [, poolAddr] = await ethers.getSigners();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    await expect(
      registry.setPool(ethers.ZeroAddress)
    ).to.be.revertedWith("CircuitRegistry: zero pool");
    await registry.setPool(poolAddr.address);
    await expect(
      registry.setPool(poolAddr.address)
    ).to.be.revertedWith("CircuitRegistry: pool already set");
  });

  it("Should register agent and return agentId", async function () {
    const [operator, agentWallet] = await ethers.getSigners();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    await registry
      .connect(operator)
      .registerAgent(agentWallet.address, ethers.parseUnits("500", 6), 1);
    const ids = await registry.getAgentIdsByOperator(operator.address);
    expect(ids.length).to.equal(1);
    const [wallet, op, creditLimit, drawn, riskTier, active] =
      await registry.getAgent(ids[0]);
    expect(wallet).to.equal(agentWallet.address);
    expect(op).to.equal(operator.address);
    expect(creditLimit).to.equal(ethers.parseUnits("500", 6));
    expect(drawn).to.equal(0n);
    expect(riskTier).to.equal(1);
    expect(active).to.equal(true);
  });

  it("Should reject zero wallet and duplicate", async function () {
    const [operator, agentWallet] = await ethers.getSigners();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    await expect(
      registry
        .connect(operator)
        .registerAgent(ethers.ZeroAddress, ethers.parseUnits("100", 6), 1)
    ).to.be.revertedWith("CircuitRegistry: zero wallet");
    await registry
      .connect(operator)
      .registerAgent(agentWallet.address, ethers.parseUnits("100", 6), 1);
    await expect(
      registry
        .connect(operator)
        .registerAgent(agentWallet.address, ethers.parseUnits("200", 6), 2)
    ).to.be.revertedWith("CircuitRegistry: already registered");
  });

  it("Should reject invalid risk tier", async function () {
    const [operator, agentWallet] = await ethers.getSigners();
    const CircuitRegistry = await ethers.getContractFactory("CircuitRegistry");
    const registry = await CircuitRegistry.deploy();
    await registry.waitForDeployment();
    await expect(
      registry
        .connect(operator)
        .registerAgent(agentWallet.address, ethers.parseUnits("100", 6), 0)
    ).to.be.revertedWith("CircuitRegistry: invalid risk tier");
    await expect(
      registry
        .connect(operator)
        .registerAgent(agentWallet.address, ethers.parseUnits("100", 6), 4)
    ).to.be.revertedWith("CircuitRegistry: invalid risk tier");
  });
});

