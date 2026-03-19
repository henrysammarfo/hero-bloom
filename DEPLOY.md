# Deploy CIRCUIT to Sepolia

## 1. Install dependencies

```bash
npm install
```

## 2. Compile and test contracts

```bash
npm run compile
npm run test:contracts
```

## 3. Deploy to Sepolia

Ensure `.env` has:

- `VITE_ALCHEMY_API_KEY` — Alchemy Sepolia API key
- `FUNDED_WALLET_PRIVATE_KEY` — Wallet with Sepolia ETH (for gas)

Then:

```bash
npm run deploy:sepolia
```

Copy the printed addresses into `.env`:

```
VITE_CIRCUIT_REGISTRY_ADDRESS=0x...
VITE_CIRCUIT_POOL_ADDRESS=0x...
VITE_MOCK_USDT_ADDRESS=0x...
```

Deploy script mints 100k USDT to the pool and 500k USDT to the MockUSDT contract (faucet reserve).

## 4. Run the app

```bash
npm run dev
```

Connect your wallet (Sepolia). Use **Faucet** to get test USDT, then **Register Agent** and (as an agent wallet) draw/repay from the pool.

## 5. Optional: verify on Etherscan

If `VITE_ETHERSCAN_API_KEY` is set in `.env`:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

- MockUSDT: no constructor args
- CircuitRegistry: no constructor args
- CircuitPool: `(usdtAddress, registryAddress)`
