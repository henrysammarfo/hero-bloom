import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, Clock, Wallet, ExternalLink } from "lucide-react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits } from "viem";
import { hasFaucet, MOCK_USDT_ADDRESS, mockUsdtAbi } from "@/lib/contracts";

const COOLDOWN_SECONDS = 24 * 60 * 60;

const FaucetPage = () => {
  const { address, isConnected } = useAccount();
  const [success, setSuccess] = useState(false);

  const { data: nextAt, refetch: refetchNext } = useReadContract({
    address: MOCK_USDT_ADDRESS,
    abi: mockUsdtAbi,
    functionName: "nextFaucetAt",
    args: address ? [address] : undefined,
  });

  const { data: amountWei } = useReadContract({
    address: MOCK_USDT_ADDRESS,
    abi: mockUsdtAbi,
    functionName: "FAUCET_AMOUNT",
  });

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      setSuccess(true);
      refetchNext();
    }
  }, [isSuccess, refetchNext]);

  const amount = amountWei != null ? Number(formatUnits(amountWei, 6)) : 0;
  const nextTimestamp = nextAt != null ? Number(nextAt) : 0;
  const now = Math.floor(Date.now() / 1000);
  const canRequest = nextTimestamp <= now;
  const nextIn = nextTimestamp > now ? nextTimestamp - now : 0;
  const hoursLeft = Math.floor(nextIn / 3600);
  const minsLeft = Math.floor((nextIn % 3600) / 60);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight flex items-center gap-2">
          <Droplets className="w-8 h-8 text-primary" />
          Test USDT Faucet
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Get test USDT for LP deposits and testing. 10,000 USDT per request, once per 24 hours.
        </p>
      </div>

      {!hasFaucet ? (
        <div className="liquid-glass rounded-2xl p-8 text-center text-muted-foreground">
          <p>Faucet is available after deployment. Add VITE_MOCK_USDT_ADDRESS to .env</p>
        </div>
      ) : !isConnected ? (
        <div className="liquid-glass rounded-2xl p-8 text-center text-muted-foreground">
          <Wallet className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Connect your wallet to request test USDT.</p>
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Amount per request</p>
              <p className="text-2xl font-semibold text-foreground font-mono mt-1">{amount.toLocaleString()} USDT</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Cooldown</p>
              <p className="text-sm text-foreground mt-1">24 hours</p>
            </div>
          </div>

          {!canRequest && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/20">
              <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Next request available in</p>
                <p className="text-sm text-muted-foreground">{hoursLeft}h {minsLeft}m</p>
              </div>
            </div>
          )}

          {writeError && (
            <p className="text-sm text-destructive">{writeError.message}</p>
          )}

          {success && (
            <p className="text-sm text-success">You received {amount.toLocaleString()} USDT. Check your wallet.</p>
          )}

          <Button
            variant="heroSecondary"
            className="w-full py-6 text-base"
            disabled={!canRequest || isPending || isConfirming}
            onClick={() => {
              setSuccess(false);
              writeContract({
                address: MOCK_USDT_ADDRESS,
                abi: mockUsdtAbi,
                functionName: "requestFaucet",
              });
              refetchNext();
            }}
          >
            {isPending || isConfirming ? "Confirming…" : canRequest ? `Request ${amount.toLocaleString()} USDT` : "Cooldown active"}
          </Button>

          <p className="text-xs text-muted-foreground">
            Testnet only. Use for LP deposits and beta testing. View contract on{" "}
            <a
              href={`https://sepolia.etherscan.io/address/${MOCK_USDT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Etherscan <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default FaucetPage;
