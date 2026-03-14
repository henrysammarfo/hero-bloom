import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import HowItWorks from "@/components/HowItWorks";
import LendingPool from "@/components/LendingPool";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="dark">
      <HeroSection />
      <VideoSection />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="lending-pool">
        <LendingPool />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
