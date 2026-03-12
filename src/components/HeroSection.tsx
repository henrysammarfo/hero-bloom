import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="bg-background relative overflow-hidden">
      <Navbar />
      <div className="flex flex-col items-center pt-20 px-4">
        <h1
          className="text-[230px] font-normal leading-[1.02] tracking-[-0.024em] bg-clip-text text-transparent"
          style={{
            fontFamily: "'General Sans', sans-serif",
            backgroundImage: "linear-gradient(223deg, #E8E8E9 0%, #3A7BBF 104.15%)",
          }}
        >
          Cleora
        </h1>
        <p className="text-hero-sub text-center text-lg leading-8 max-w-md mt-4 opacity-80">
          Autonomous AI agents that settle
          <br />
          cross-border payments in under 5 minutes — for 0.5%
        </p>
        <div className="mt-8 mb-[66px]">
          <Button variant="heroSecondary" className="px-[29px] py-[24px]">
            Start Sending
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
