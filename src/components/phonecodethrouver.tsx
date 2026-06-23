import React, { useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  Download,
  MessageSquare,
  ShieldCheck,
  Check,
  ArrowLeft,
  ChevronRight,
  Beaker
} from "lucide-react";

interface PhoneCodeThrouverProps {
  onBackToLobby: () => void;
  videoPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onPaperRedirect: () => void;
  playAudio?: (type: string) => void;
  onLabClick?: () => void;
}

export default function PhoneCodeThrouver({
  onBackToLobby,
  videoPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  isMuted,
  onToggleMute,
  onPaperRedirect,
  playAudio,
  onLabClick
}: PhoneCodeThrouverProps) {
  const [activeTab, setActiveTab] = useState<number>(1);

  const mockSections = [
    {
      id: 1,
      title: "Quadratic Equations",
      formula: "ax² + bx + c = 0",
      desc: "Analysis of linear factors and structural theorems."
    },
    {
      id: 2,
      title: "Trigonometric Limits",
      formula: "lim₀ (sin θ)/θ = 1",
      desc: "Verification of standard limits & proofs."
    },
    {
      id: 3,
      title: "Kinematics Analysis",
      formula: "s = ut + ½at²",
      desc: "Uniform acceleration systems & graph modeling."
    },
    {
      id: 4,
      title: "Coplanar Equilibrium",
      formula: "∑ F = 0  AND  ∑ τ = 0",
      desc: "Rigid body balance and coplanar resolution."
    },
    {
      id: 5,
      title: "Sine & Cosine Rules",
      formula: "a² = b² + c² - 2bc cos A",
      desc: "Computing distances in complex triangles."
    }
  ];

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  const handleTabClick = (id: number) => {
    if (playAudio) playAudio("pop");
    setActiveTab(id);
  };

  return (
    <div className="block lg:hidden w-full space-y-6 pb-20 select-none">
      
      {/* Phone Header Row */}
      <div className="flex justify-between items-center bg-slate-950/40 p-3.5 rounded-2xl border border-white/5 backdrop-blur-md">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-300 font-bold uppercase tracking-wider active:scale-95 transition-all"
        >
          <ArrowLeft className="h-3 w-3 text-orange-400" />
          Lobby
        </button>
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-extrabold text-orange-400 border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
          Phone Rev 1
        </div>
      </div>

      {/* Main Stats Banner Card */}
      <div className="glass-panel-dark p-5 relative overflow-hidden rounded-2xl">
        <div className="card-orb-amber" style={{ bottom: "-20px", right: "-20px", width: "90px", height: "90px" }} />
        <div className="relative z-10 space-y-2">
          <span className="text-[8px] tracking-[0.25em] font-extrabold uppercase text-orange-400 bg-orange-500/15 py-0.5 px-2 rounded border border-orange-500/20">
            Combined Mathematics
          </span>
          <h2 className="text-xl font-serif text-white font-bold leading-tight">
            2027 Model Paper Review 1
          </h2>
          <p className="text-[10px] text-slate-400 font-serif italic mb-2">
            Presented by specialist lecturer Indika Rathninda.
          </p>
        </div>
      </div>

      {/* Phone Specific Finger-Friendly Player Remote */}
      <div className="glass-panel-dark p-4 space-y-3 rounded-2xl border border-white/10 relative">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Scrub bar */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeekChange}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />

        {/* Buttons Row */}
        <div className="flex justify-around items-center pt-2">
          <button
            onClick={onToggleMute}
            className="p-3 bg-white/5 active:bg-white/10 border border-white/5 rounded-full text-slate-300 active:scale-95 transition-all"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            onClick={onTogglePlay}
            className="p-5 bg-orange-500 hover:bg-orange-400 active:bg-orange-600 rounded-full text-white shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
          >
            {videoPlaying ? <Pause className="h-6 w-6 fill-white" /> : <Play className="h-6 w-6 fill-white" />}
          </button>

          <button
            onClick={() => {
              if (playAudio) playAudio("type");
              onSeek(Math.max(0, currentTime - 10));
            }}
            className="p-3 bg-white/5 active:bg-white/10 border border-white/5 rounded-full text-slate-300 text-[10px] font-mono tracking-tighter active:scale-95"
          >
            -10s
          </button>

          {onLabClick && (
            <button
              onClick={onLabClick}
              className="p-3 bg-orange-500/10 active:bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 active:scale-95 transition-all flex items-center justify-center"
              title="Science Lab Subtitles"
            >
              <Beaker className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Touch horizontal scrolling syllabus buttons */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-orange-400 pl-1">
          Syllabus Target Selector:
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x mask-gradient">
          {mockSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleTabClick(sec.id)}
              className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold shrink-0 snap-center transition-all ${
                activeTab === sec.id
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                  : "bg-white/5 border-white/5 text-slate-300"
              }`}
            >
              Sec {sec.id}
            </button>
          ))}
        </div>

        {/* Active tab content block */}
        {activeTab && (
          <div className="glass-panel-dark p-5 rounded-2xl relative overflow-hidden transition-all duration-300">
            <div className="card-orb-amber" style={{ top: "-30px", right: "-30px" }} />
            <div className="relative z-10 space-y-3">
              <span className="text-[9px] font-bold text-orange-400 font-mono tracking-widest block uppercase">
                Section 0{activeTab} TARGET
              </span>
              <h4 className="text-white text-base font-serif font-extrabold">
                {mockSections[activeTab - 1].title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
                {mockSections[activeTab - 1].desc}
              </p>
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-center font-mono text-[11px] text-orange-300">
                {mockSections[activeTab - 1].formula}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions Drawer Panel */}
      <div className="grid grid-cols-1 gap-3.5 pt-2">
        <button
          onClick={onPaperRedirect}
          className="w-full bg-orange-500 text-white font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
        >
          <Download className="h-4 w-4 shrink-0" />
          Download Exam Paper
        </button>

        <a
          href="https://wa.me/94713116877?text=%E0%B7%83%E0%B6%BB%E0%B7%8A%20%E0%B6%B8%E0%B6%A7%20%E0%B6%B4%E0%B7%8A%E2%80%8D%E0%B6%BB%E0%B7%81%E0%B7%8A%E0%B6%B1%E0%B6%BA%E0%B6%9A%E0%B7%8A%20%E0%B6%AD%E0%B7%92%E0%B6%BA%E0%B7%99%E0%B6%B1%E0%B7%80%E0%B7%8F"
          target="_blank"
          rel="noreferrer"
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <MessageSquare className="h-4 w-4 text-orange-400 shrink-0" />
          Ask doubts on WhatsApp
        </a>
      </div>

    </div>
  );
}
