import { useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  return (
    <section className="relative overflow-hidden" style={{ background: "hsl(0, 0%, 0%)" }}>
      <Navbar />
      <div className="flex flex-col items-center pt-10 sm:pt-20 px-4">
        <h1
          className="text-[80px] sm:text-[140px] md:text-[180px] lg:text-[230px] font-normal leading-[1.02] tracking-[-0.024em] bg-clip-text text-transparent"
          style={{
            fontFamily: "'General Sans', sans-serif",
            backgroundImage: "linear-gradient(223deg, #E8E8E9 0%, #7C3AED 104.15%)",
          }}
        >
          Circuit
        </h1>
        <p className="text-center text-base sm:text-lg leading-7 sm:leading-8 max-w-lg mt-4 opacity-80 px-2" style={{ color: "hsl(0, 0%, 72%)" }}>
          Autonomous credit infrastructure for AI agents.
          <br />
          Borrow, complete, earn, repay — zero humans in the loop.
        </p>
        <div className="mt-8 mb-12 sm:mb-[66px]">
          {isConnected ? (
            <Button variant="heroSecondary" className="px-[29px] py-[24px]" onClick={() => navigate("/dashboard")}>
              Open Dashboard
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
