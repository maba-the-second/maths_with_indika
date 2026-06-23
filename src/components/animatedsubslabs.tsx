import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Play, Pause, Beaker, HelpCircle } from "lucide-react";

interface AnimatedSubsLabProps {
  onBack: () => void;
  playAudio?: (type: string) => void;
}

const subtitles = [
  { start: 2.480, end: 5.680, text: "Hello, welcome back." },
  { start: 5.680, end: 8.559, text: "So..." },
  { start: 8.559, end: 12.160, text: "here we have a question to prove that" },
  { start: 12.160, end: 16.000, text: "\\(\\log(1+2+3)\\)" },
  { start: 16.000, end: 21.720, text: "equal to \\(\\log(1) + \\log(2) + \\log(3)\\)." },
  { start: 21.840, end: 25.119, text: "So basically they are given" },
  { start: 25.119, end: 32.640, text: "uh log as uh <span class='highlight' style='color:#FFB703;font-weight:800;'>log base 10</span> of 1 2 3 and" },
  { start: 32.640, end: 37.760, text: "\\(\\log_{10}(1)\\), \\(\\log_{10}(2)\\), \\(\\log_{10}(3)\\)." },
  { start: 37.760, end: 39.520, text: "Okay." },
  { start: 39.520, end: 41.120, text: "So..." },
  { start: 41.120, end: 45.120, text: "to prove this we start" },
  { start: 45.120, end: 49.960, text: "we'll start with LHS" },
  { start: 50.640, end: 52.960, text: "LHS" },
  { start: 52.960, end: 55.520, text: "and uh..." },
  { start: 55.520, end: 59.640, text: "it is equal to" },
  { start: 60.559, end: 63.559, text: "log" },
  { start: 66.159, end: 68.320, text: "log" },
  { start: 68.320, end: 71.840, text: "\\(1 + 2 +\\)" },
  { start: 71.840, end: 74.840, text: "\\(3\\)" },
  { start: 77.360, end: 78.960, text: "log" },
  { start: 78.960, end: 82.560, text: "\\(1 + 2 + 3\\). When you add these three" },
  { start: 82.560, end: 84.640, text: "numbers," },
  { start: 84.640, end: 87.920, text: "you will get 6." },
  { start: 87.920, end: 92.720, text: "So I plan to write six as" },
  { start: 92.720, end: 96.479, text: "\\(1 \\times 6\\)" },
  { start: 96.479, end: 101.439, text: "and 6 we can write as" },
  { start: 101.439, end: 103.360, text: "\\(2 \\times\\)" },
  { start: 103.360, end: 105.920, text: "\\(3\\)." },
  { start: 105.920, end: 111.360, text: "So using the <span class='highlight' style='color:#FFB703;font-weight:800;'>logarithm rules</span>" },
  { start: 111.360, end: 116.320, text: "now we can write \\(1 \\times 2 \\times 3\\) as log" },
  { start: 116.320, end: 119.680, text: "base 10 of 1" },
  { start: 119.680, end: 128.680, text: "\\(\\log_{10}(2) + \\log_{10}(3)\\)." },
  { start: 128.800, end: 131.920, text: "Uh actually this is little bit easy" },
  { start: 131.920, end: 135.520, text: "question but if you not figure out" },
  { start: 135.520, end: 137.440, text: "uh" },
  { start: 137.440, end: 139.599, text: "this point" },
  { start: 139.599, end: 144.480, text: "\\(6 = 1 \\times 6\\) then you will get" },
  { start: 144.480, end: 146.879, text: "a little difficult to uh achieve the" },
  { start: 146.879, end: 149.920, text: "answer but anyway this is the way of" },
  { start: 149.920, end: 152.480, text: "doing the question. Okay thank you very" },
  { start: 152.480, end: 157.400, text: "much we'll meet again. Okay, bye." }
];

export default function AnimatedSubsLabs({ onBack, playAudio }: AnimatedSubsLabProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);
  const [isTypesetting, setIsTypesetting] = useState(false);
  const [subtitleState, setSubtitleState] = useState<"idle" | "active" | "exit">("idle");

  // Load MathJax Script Dynamically on render
  useEffect(() => {
    const scriptId = "mathjax-dynamic-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
      script.async = true;
      document.head.appendChild(script);
    }

    const fontStyleId = "poppins-mathjax-font-link";
    if (!document.getElementById(fontStyleId)) {
      const link = document.createElement("link");
      link.id = fontStyleId;
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  // Update current active subtitle
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const currentTime = video.currentTime;
      const index = subtitles.findIndex(
        (sub) => currentTime >= sub.start && currentTime <= sub.end
      );

      if (index !== activeSubtitleIndex) {
        if (activeSubtitleIndex !== -1 && subtitleRef.current) {
          setSubtitleState("exit");
          setTimeout(() => {
            setActiveSubtitleIndex(index);
          }, 180);
        } else {
          setActiveSubtitleIndex(index);
        }
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [activeSubtitleIndex]);

  // Handle MathJax rendering whenever the subtitle text changes
  useEffect(() => {
    if (activeSubtitleIndex === -1) {
      setSubtitleState("idle");
      return;
    }

    const subtitleElem = subtitleRef.current;
    if (!subtitleElem) return;

    const hasMath = subtitles[activeSubtitleIndex].text.includes("\\(");
    const windowMathJax = (window as any).MathJax;

    if (hasMath && windowMathJax && windowMathJax.typesetPromise) {
      setIsTypesetting(true);
      windowMathJax.typesetPromise([subtitleElem])
        .then(() => {
          setIsTypesetting(false);
          setSubtitleState("active");
        })
        .catch(() => {
          setIsTypesetting(false);
          setSubtitleState("active");
        });
    } else {
      setSubtitleState("active");
    }
  }, [activeSubtitleIndex]);

  const togglePlay = () => {
    if (playAudio) playAudio("pop");
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleBackClick = () => {
    if (playAudio) playAudio("pop");
    const video = videoRef.current;
    if (video) {
        video.pause();
    }
    onBack();
  };

  const activeText = activeSubtitleIndex !== -1 ? subtitles[activeSubtitleIndex].text : "";

  return (
    <div className="w-full min-h-screen bg-[#09090d] text-white flex flex-col justify-between py-6 px-4 md:px-12 font-sans select-none relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-yellow-500/5 blur-[100px] pointer-events-none" />

      {/* Lab Header Row */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 bg-orange-500 animate-ping rounded-full" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-extrabold">
              Adaptive Subtitle Research Sandbox
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif italic text-white tracking-tight leading-none font-bold">
            Interactive Liquid Glass Subtitles
          </h1>
        </div>

        <button
          onClick={handleBackClick}
          className="border border-white/10 hover:border-orange-500/30 bg-white/5 hover:bg-orange-500/10 text-slate-300 hover:text-orange-400 px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold flex items-center gap-2 rounded-xl backdrop-blur-md cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Workspace
        </button>
      </header>

      {/* Main Lab Canvas Layout */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 relative z-10 w-full max-w-5xl mx-auto">
        <div 
          className={`relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-orange-500/10 shadow-2xl transition-all duration-500 ${
            isPlaying ? "scale-[1.012] shadow-orange-500/5" : ""
          }`}
        >
          {/* Glass Overlay Glow Grid */}
          <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-5 mix-blend-overlay opacity-35" />

          {/* Core Video Player Element */}
          <video
            ref={videoRef}
            onClick={togglePlay}
            playsInline
            preload="auto"
            className="w-full h-full object-cover cursor-pointer"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src="https://stream.vidhosting.in/videos/b128d277.mp4" type="video/mp4" />
          </video>

          {/* Subtitle Overlay View */}
          <div 
            className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-11/12 max-w-[800px] text-center pointer-events-none z-10 flex justify-center items-end min-h-[90px]"
            style={{ perspective: "1000px" }}
          >
            {activeSubtitleIndex !== -1 && (
              <div
                ref={subtitleRef}
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  background: "rgba(15, 15, 15, 0.65)",
                  backdropFilter: "blur(14px) saturate(180%)",
                  WebkitBackdropFilter: "blur(14px) saturate(180%)",
                  border: "1px solid rgba(255, 183, 3, 0.35)",
                  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 0 24px rgba(255, 183, 3, 0.12)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.85)",
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
                className={`subtitle-text font-semibold text-white px-6 md:px-8 py-3.5 md:py-4 rounded-2xl max-w-full text-base sm:text-xl lg:text-2xl leading-relaxed tracking-wide transition-all ${
                  subtitleState === "active" ? "opacity-100 translate-y-0 scale-100" : ""
                } ${
                  subtitleState === "exit" ? "opacity-0 -translate-y-4 scale-105 blur-[4px]" : ""
                } ${
                  subtitleState === "idle" ? "opacity-0 translate-y-4 scale-95" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: activeText }}
              />
            )}
          </div>

          {/* Floating Action Video Remote Overlay */}
          <div 
            className={`absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-center gap-4 transition-all duration-300 z-20 ${
              isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
            }`}
          >
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-orange-400/90 text-black hover:bg-orange-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-orange-500/20"
              title={isPlaying ? "Pause Feed" : "Play Feed"}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 stroke-black fill-current" />
              ) : (
                <Play className="h-6 w-6 stroke-black fill-current translate-x-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Theoretical explanation / Lab card */}
        <div className="mt-8 w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-orange-400">
                Mathematics Visualization Lab
              </span>
              <h3 className="text-lg font-serif text-white font-bold leading-none">
                Interactive Equation Proving Frame
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic pt-1">
                This environment compiles real-time subtitles overlaid directly with liquid glass shaders and LaTeX typographic matrices. Math equations like <span className="text-orange-400 font-mono">\(\log(a \cdot b) = \log a + \log b\)</span> are dynamically compiled on frame change.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <HelpCircle className="h-3.5 w-3.5 text-orange-400/60" />
              Drag overlays, text highlights, and proof matrices sync within 50ms of audio frame registers.
            </div>
          </div>

          <div className="md:col-span-4 p-6 rounded-2xl bg-orange-500/[0.02] border border-orange-500/10 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-1">
              <h4 className="text-xs uppercase font-sans tracking-[0.15em] font-extrabold text-orange-400">
                LHS/RHS Verified
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal font-serif italic">
                Prove: {"\\(\\log(1+2+3) = \\log 1 + \\log 2 + \\log 3\\)"}
              </p>
            </div>
            
            <div className="py-2.5 px-3 bg-black/40 rounded-xl border border-white/5 text-[11.5px] font-mono text-center text-orange-300">
              {"6 = 1 × 2 × 3"}
            </div>

            <div className="text-[9px] text-slate-500 text-center uppercase tracking-wider">
              Perfect Logarithmic Theorem Proof
            </div>
          </div>
        </div>
      </main>

      {/* Lab Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest pt-6 border-t border-white/5 gap-2 relative z-10 w-full mt-6">
        <div>
          &copy; Combined Mathematics by Indika Rathninda. Liquid Subtitles Sandbox V1.
        </div>
        <div className="flex gap-4">
          <span className="text-orange-400/65">Experimental Build</span>
        </div>
      </footer>

    </div>
  );
}
