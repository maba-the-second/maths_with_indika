import React from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  playAudio?: (type: string) => void;
}

export default function ThemeToggle({ isDark, onToggle, playAudio }: ThemeToggleProps) {
  const handleClick = () => {
    if (playAudio) {
      playAudio("pop");
    }
    onToggle();
  };

  return (
    <button
      id="theme-toggle-btn"
      onClick={handleClick}
      className={`relative flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.2em] font-extrabold rounded-xl border transition-all duration-300 backdrop-blur-md cursor-pointer ${
        isDark
          ? "border-orange-500/20 bg-orange-500/10 text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/15"
          : "border-slate-300 bg-white/80 text-slate-800 hover:bg-slate-50 hover:shadow-md"
      }`}
      title={isDark ? "Switch to Editorial Light Version" : "Switch to Amber Dark Version"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="h-3.5 w-3.5 text-orange-400 rotate-0 transition-transform duration-500" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-slate-800 rotate-12 transition-transform duration-500" />
        )}
      </div>
      <span>{isDark ? "Light Aesthetics" : "Dark Obsidian"}</span>
    </button>
  );
}
