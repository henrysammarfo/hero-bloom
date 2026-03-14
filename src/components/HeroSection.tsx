import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background relative overflow-hidden">
      <Navbar />
      <div className="flex flex-col items-center pt-20 px-4">
        <h1
          className="text-[230px] font-normal leading-[1.02] tracking-[-0.024em] bg-clip-text text-transparent"
          style={{
            fontFamily: "'General Sans', sans-serif",
            backgroundImage: "linear-gradient(223deg, #E8E8E9 0%, #7C3AED 104.15%)",
          }}
        >
          Circuit
        </h1>
        <p className="text-hero-sub text-center text-lg leading-8 max-w-lg mt-4 opacity-80">
          Autonomous credit infrastructure for AI agents.
          <br />
          Borrow, complete, earn, repay — zero humans in the loop.
        </p>
        <div className="mt-8 mb-[66px]">
          <Button variant="heroSecondary" className="px-[29px] py-[24px]" onClick={() => navigate("/dashboard")}>
            Register Agent
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
