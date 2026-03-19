// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CircuitRegistry.sol";

/**
 * Lending pool: holds USDT, lets registered agents draw and repay.
 * Uses SafeERC20 and CEI pattern; ReentrancyGuard on all state-changing paths.
 */
contract CircuitPool is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    CircuitRegistry public immutable registry;

    event Draw(bytes32 indexed agentId, address indexed to, uint256 amount);
    event Repay(bytes32 indexed agentId, address indexed from, uint256 amount);
    event Deposited(address indexed from, uint256 amount);

    /// @param _token ERC20 token (e.g. USDT) for deposits and draws.
    /// @param _registry CircuitRegistry that authorizes agents.
    constructor(address _token, address _registry) {
        require(_token != address(0), "CircuitPool: zero token");
        require(_registry != address(0), "CircuitPool: zero registry");
        token = IERC20(_token);
        registry = CircuitRegistry(_registry);
    }

    /// @notice LP deposits token into the pool. No cap; use CEI + SafeERC20.
    /// @param amount Amount to deposit (must be approved by caller).
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "CircuitPool: zero amount");
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    /// @notice Risk cap: max 5% of pool TVL per agent, max 20% per operator (per CIRCUIT Bible).
    uint256 public constant MAX_PCT_PER_AGENT = 5;
    uint256 public constant MAX_PCT_PER_OPERATOR = 20;
    uint256 public constant PCT_DENOMINATOR = 100;

    /// @notice Agent wallet draws up to credit limit, subject to 5% per agent and 20% per operator of pool TVL.
    /// @param agentId Agent id from CircuitRegistry.
    /// @param to Recipient of the drawn amount.
    /// @param amount Amount to draw (6 decimals for USDT).
    function draw(bytes32 agentId, address to, uint256 amount) external nonReentrant {
        require(to != address(0), "CircuitPool: zero to");
        (address wallet, address operator, uint256 creditLimit, uint256 drawn, , bool active) = registry.getAgent(agentId);
        require(active, "CircuitPool: inactive agent");
        require(msg.sender == wallet, "CircuitPool: only agent wallet");
        require(amount > 0, "CircuitPool: zero amount");
        require(drawn + amount <= creditLimit, "CircuitPool: over limit");

        uint256 poolTVL = token.balanceOf(address(this));
        require(poolTVL > 0, "CircuitPool: no liquidity");
        require(amount <= (poolTVL * MAX_PCT_PER_AGENT) / PCT_DENOMINATOR, "CircuitPool: over 5% per agent");
        uint256 operatorDrawn = registry.totalDrawnByOperator(operator);
        require(operatorDrawn + amount <= (poolTVL * MAX_PCT_PER_OPERATOR) / PCT_DENOMINATOR, "CircuitPool: over 20% per operator");

        registry.updateDrawn(agentId, amount);
        token.safeTransfer(to, amount);

        emit Draw(agentId, to, amount);
    }

    /// @notice Agent wallet repays drawn amount. Cannot repay more than currently drawn.
    /// @param agentId Agent id from CircuitRegistry.
    /// @param amount Amount to repay (must be approved by caller).
    function repay(bytes32 agentId, uint256 amount) external nonReentrant {
        (address wallet, , , uint256 drawn, , ) = registry.getAgent(agentId);
        require(msg.sender == wallet, "CircuitPool: only agent wallet");
        require(amount > 0, "CircuitPool: zero amount");
        require(amount <= drawn, "CircuitPool: repay over drawn");

        registry.updateRepaid(agentId, amount);
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Repay(agentId, msg.sender, amount);
    }

    function poolBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}

