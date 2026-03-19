/**
 * Wagmi + RainbowKit config for CIRCUIT on Sepolia.
 * All keys come from env — never hardcoded. See .env.example and ENV_KEYS.md.
 */
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";
const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const sepoliaRpc = alchemyKey
  ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : undefined;

export const config = getDefaultConfig({
  appName: "CIRCUIT",
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: sepoliaRpc ? http(sepoliaRpc) : http(),
  },
});
