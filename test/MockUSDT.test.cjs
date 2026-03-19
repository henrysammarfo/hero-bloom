require("@nomicfoundation/hardhat-chai-matchers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockUSDT", function () {
  it("Should have 6 decimals", async function () {
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const token = await MockUSDT.deploy();
    await token.waitForDeployment();
    expect(await token.decimals()).to.equal(6n);
  });

  it("Should mint to owner and respect balances", async function () {
    const [, recipient] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const token = await MockUSDT.deploy();
    await token.waitForDeployment();
    const amount = ethers.parseUnits("1000", 6);
    await token.mint(recipient.address, amount);
    expect(await token.balanceOf(recipient.address)).to.equal(amount);
  });

  it("Should reject mint to zero address", async function () {
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const token = await MockUSDT.deploy();
    await token.waitForDeployment();
    await expect(
      token.mint(ethers.ZeroAddress, ethers.parseUnits("1", 6))
    ).to.be.revertedWith("MockUSDT: mint to zero");
  });

  it("Should allow faucet after cooldown", async function () {
    const [, user] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const token = await MockUSDT.deploy();
    await token.waitForDeployment();
    const reserve = ethers.parseUnits("100000", 6);
    await token.mint(await token.getAddress(), reserve);
    const balBefore = await token.balanceOf(user.address);
    await token.connect(user).requestFaucet();
    expect(await token.balanceOf(user.address)).to.equal(
      balBefore + (await token.FAUCET_AMOUNT())
    );
  });

  it("Should reject faucet during cooldown", async function () {
    const [, user] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const token = await MockUSDT.deploy();
    await token.waitForDeployment();
    await token.mint(
      await token.getAddress(),
      ethers.parseUnits("100000", 6)
    );
    await token.connect(user).requestFaucet();
    await expect(
      token.connect(user).requestFaucet()
    ).to.be.revertedWith("MockUSDT: cooldown");
  });

  it("Should reject faucet when reserve empty", async function () {
    const [, user] = await ethers.getSigners();
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const token = await MockUSDT.deploy();
    await token.waitForDeployment();
    await expect(
      token.connect(user).requestFaucet()
    ).to.be.revertedWith("MockUSDT: faucet empty");
  });
});

