import React, { useEffect, useState } from "react";

export default function SecurityPlus() {
  const [isBlackout, setIsBlackout] = useState(false);

  useEffect(() => {
    // 1. Focus shift and tab visibility screen blackout
    const handleBlur = () => {
      setIsBlackout(true);
    };

    const handleFocus = () => {
      setIsBlackout(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlackout(true);
      } else {
        setTimeout(() => {
          setIsBlackout(false);
        }, 150);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 2. Prevent right clicks (context menu access)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);

    // 3. Prevent copying of text/formulas
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    document.addEventListener("copy", handleCopyCut);
    document.addEventListener("cut", handleCopyCut);

    // 4. Prevent dragging images/elements
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    document.addEventListener("dragstart", handleDragStart);

    // 5. Intercept key combinations (F12, Ctrl+U, Ctrl+Shift+I, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Print Screen detection
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        setIsBlackout(true);
      }

      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
      }

      // Ctrl + Shift + I/J/C
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
      }

      // Ctrl + U / Ctrl + S / Ctrl + P
      if (e.ctrlKey && (e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCut);
      document.removeEventListener("cut", handleCopyCut);
      document.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isBlackout) return null;

  return (
    <div 
      className="fixed inset-0 z-[999999] bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center select-none"
      style={{ pointerEvents: "all" }}
    >
      <div className="max-w-md space-y-6">
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-orange-500 animate-pulse" />
          <span className="text-4xl text-orange-400">🔒</span>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-orange-400 font-bold tracking-tight">
            INSTRUCTOR SECURITY BINDING ACTIVE
          </h2>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-sans font-bold">
            PROPRIETARY STUDY ENVIRONMENT PROXY
          </p>
        </div>

        <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
          <p className="text-xs text-slate-300 leading-relaxed font-serif italic">
            "Automated workspace protection activated. In compliance with lecture copyright policies, content mirroring, unauthorized recording, and clipboard capture tools are restricted."
          </p>
        </div>

        <p className="text-[9px] uppercase tracking-widest text-slate-500">
          Combined Mathematics &copy; Indika Rathninda. All rights reserved.
        </p>
      </div>
    </div>
  );
}
