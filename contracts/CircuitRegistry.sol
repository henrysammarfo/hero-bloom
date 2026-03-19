// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Registers agent wallets and links them to an operator.
 * Used by CIRCUIT to know which addresses are agents and who operates them.
 */
contract CircuitRegistry {
    struct Agent {
        address wallet;
        address operator;
        uint256 creditLimit;
        uint256 drawn;
        uint8 riskTier; // 1=A, 2=B, 3=C
        bool active;
        uint256 registeredAt;
    }

    mapping(bytes32 => Agent) public agentsById;
    mapping(address => bytes32) public agentIdByWallet;
    mapping(address => bytes32[]) public agentIdsByOperator;
    /// @dev Total drawn across all agents of an operator (for 20% risk cap).
    mapping(address => uint256) public totalDrawnByOperator;

    uint256 public nextAgentNonce;
    address public pool;

    event AgentRegistered(bytes32 indexed agentId, address indexed wallet, address indexed operator, uint256 creditLimit, uint8 riskTier);
    event CreditLimitUpdated(bytes32 indexed agentId, uint256 newLimit);
    event AgentDeactivated(bytes32 indexed agentId);

    modifier onlyPool() {
        require(msg.sender == pool, "CircuitRegistry: only pool");
        _;
    }

    /// @notice Set the CircuitPool address once. Only callable before pool is set.
    /// @param _pool Address of the CircuitPool contract.
    function setPool(address _pool) external {
        require(_pool != address(0), "CircuitRegistry: zero pool");
        require(pool == address(0), "CircuitRegistry: pool already set");
        pool = _pool;
    }

    /// @notice Register a new agent wallet under the caller (operator). One wallet per agent.
    /// @param agentWallet Address that will be able to draw/repay (agent wallet).
    /// @param creditLimit Max total drawn at any time for this agent.
    /// @param riskTier 1=A, 2=B, 3=C (for scoring/display).
    /// @return agentId Unique id for this agent (keccak256(operator, wallet, chainId, nonce)).
    function registerAgent(
        address agentWallet,
        uint256 creditLimit,
        uint8 riskTier
    ) external returns (bytes32 agentId) {
        require(agentWallet != address(0), "CircuitRegistry: zero wallet");
        require(agentIdByWallet[agentWallet] == bytes32(0), "CircuitRegistry: already registered");
        require(riskTier >= 1 && riskTier <= 3, "CircuitRegistry: invalid risk tier");

        agentId = keccak256(abi.encodePacked(msg.sender, agentWallet, block.chainid, nextAgentNonce));
        nextAgentNonce++;

        agentsById[agentId] = Agent({
            wallet: agentWallet,
            operator: msg.sender,
            creditLimit: creditLimit,
            drawn: 0,
            riskTier: riskTier,
            active: true,
            registeredAt: block.timestamp
        });
        agentIdByWallet[agentWallet] = agentId;
        agentIdsByOperator[msg.sender].push(agentId);

        emit AgentRegistered(agentId, agentWallet, msg.sender, creditLimit, riskTier);
        return agentId;
    }

    function getAgent(bytes32 agentId) external view returns (
        address wallet,
        address operator,
        uint256 creditLimit,
        uint256 drawn,
        uint8 riskTier,
        bool active
    ) {
        Agent storage a = agentsById[agentId];
        return (a.wallet, a.operator, a.creditLimit, a.drawn, a.riskTier, a.active);
    }

    function getAgentIdsByOperator(address operator) external view returns (bytes32[] memory) {
        return agentIdsByOperator[operator];
    }

    /// @notice Called by pool when an agent draws. Updates drawn and operator total for 20% cap.
    /// @param agentId Agent that drew.
    /// @param addDrawn Amount added to drawn (must keep drawn <= creditLimit).
    function updateDrawn(bytes32 agentId, uint256 addDrawn) external onlyPool {
        Agent storage a = agentsById[agentId];
        require(a.active, "CircuitRegistry: inactive");
        a.drawn += addDrawn;
        require(a.drawn <= a.creditLimit, "CircuitRegistry: over limit");
        totalDrawnByOperator[a.operator] += addDrawn;
    }

    /// @notice Called by pool when an agent repays. Reduces drawn and operator total.
    /// @param agentId Agent that repaid.
    /// @param repaid Amount subtracted from drawn (must be <= current drawn).
    function updateRepaid(bytes32 agentId, uint256 repaid) external onlyPool {
        Agent storage a = agentsById[agentId];
        require(a.drawn >= repaid, "CircuitRegistry: repay over drawn");
        a.drawn -= repaid;
        totalDrawnByOperator[a.operator] -= repaid;
    }

    function setCreditLimit(bytes32 agentId, uint256 newLimit) external onlyPool {
        Agent storage a = agentsById[agentId];
        a.creditLimit = newLimit;
        emit CreditLimitUpdated(agentId, newLimit);
    }

    function deactivate(bytes32 agentId) external onlyPool {
        agentsById[agentId].active = false;
        emit AgentDeactivated(agentId);
    }
}

