import { useEffect, useRef } from "react";

const brands = ["WDK", "OpenClaw", "USD₮", "Sepolia", "Supabase", "Alchemy"];

const VideoSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;

    const fade = () => {
      if (!video.duration) {
        rafId = requestAnimationFrame(fade);
        return;
      }
      const t = video.currentTime;
      const d = video.duration;
      const fadeTime = 0.5;

      if (t < fadeTime) {
        video.style.opacity = String(t / fadeTime);
      } else if (t > d - fadeTime) {
        video.style.opacity = String((d - t) / fadeTime);
      } else {
        video.style.opacity = "1";
      }
      rafId = requestAnimationFrame(fade);
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play();
      }, 100);
    };

    video.addEventListener("ended", handleEnded);
    video.play();
    rafId = requestAnimationFrame(fade);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const logoSet = brands.map((name) => (
    <div key={name} className="flex items-center gap-3 shrink-0">
      <div className="liquid-glass w-6 h-6 rounded-lg flex items-center justify-center text-xs text-foreground font-semibold">
        {name[0]}
      </div>
      <span className="text-base font-semibold text-foreground">{name}</span>
    </div>
  ));

  return (
    <div className="relative w-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="relative z-10 flex flex-col items-center pt-16 pb-24 px-4 gap-20">
        <div className="h-40" />
        <div className="max-w-5xl w-full flex items-center gap-12">
          <p className="text-foreground/50 text-sm whitespace-nowrap shrink-0">
            Built with
            <br />
            the best infra
          </p>
          <div className="overflow-hidden flex-1">
            <div className="flex animate-marquee gap-16">
              {logoSet}
              <div className="flex gap-16 shrink-0 ml-16">
                {logoSet}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
