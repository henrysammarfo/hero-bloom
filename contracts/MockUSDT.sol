// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Testnet-only mintable USDT. 6 decimals (same as mainnet USDT).
 * Includes a permissionless faucet for LPs and beta testers.
 * FOR SEPOLIA DEMO ONLY — do not use in production.
 */
contract MockUSDT is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 10_000 * 1e6; // 10,000 USDT (6 decimals)
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    mapping(address => uint256) public lastFaucetAt;

    event FaucetRequested(address indexed to, uint256 amount);

    constructor() ERC20("Mock USDT", "USDT") Ownable() {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Owner mints supply (e.g. to pool and to this contract for faucet reserve).
    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "MockUSDT: mint to zero");
        require(amount > 0, "MockUSDT: zero amount");
        _mint(to, amount);
    }

    /// @notice Any address can request test USDT once per cooldown period. Reserve must be minted to this contract by owner.
    function requestFaucet() external {
        require(block.timestamp >= lastFaucetAt[msg.sender] + FAUCET_COOLDOWN, "MockUSDT: cooldown");
        require(balanceOf(address(this)) >= FAUCET_AMOUNT, "MockUSDT: faucet empty");
        lastFaucetAt[msg.sender] = block.timestamp;
        _transfer(address(this), msg.sender, FAUCET_AMOUNT);
        emit FaucetRequested(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Next timestamp when the given address can request faucet again.
    function nextFaucetAt(address account) external view returns (uint256) {
        return lastFaucetAt[account] + FAUCET_COOLDOWN;
    }
}
