import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// 1. Tactile Multi-pattern Web Haptic Engine
export const triggerHaptic = (type: "light" | "medium" | "heavy" | "success" | "rigid" | "pop") => {
  if (typeof window !== "undefined" && navigator.vibrate) {
    try {
      switch (type) {
        case "light":
          navigator.vibrate(8);
          break;
        case "medium":
          navigator.vibrate(16);
          break;
        case "rigid":
          navigator.vibrate(22);
          break;
        case "heavy":
          navigator.vibrate(35);
          break;
        case "success":
          navigator.vibrate([10, 40, 10]);
          break;
        case "pop":
          navigator.vibrate(12);
          break;
        default:
          navigator.vibrate(10);
      }
    } catch (e) {
      // Quiet fail if browser doesn't permit active haptics without state gestures
    }
  }
};

// 2. High-Fidelity 3D Dynamic Tilt Card with Dynamic Specular Glare/Refraction
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isLocked?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className = "", 
  onClick,
  isLocked = false,
  onMouseEnter,
  onMouseLeave
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    
    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    triggerHaptic("light");
    if (onMouseEnter) onMouseEnter();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
    if (onMouseLeave) onMouseLeave();
  };

  // Convert coordinate factors to degree rotation values
  // Maximum tilt degrees: 22 degrees
  const rotateX = isHovered ? -coords.y * 22 : 0;
  const rotateY = isHovered ? coords.x * 22 : 0;
  
  // Refraction light reflection position
  const glareX = isHovered ? (coords.x + 0.5) * 100 : 50;
  const glareY = isHovered ? (coords.y + 0.5) * 100 : 50;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (onClick) {
          triggerHaptic(isLocked ? "rigid" : "success");
          onClick();
        }
      }}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
      className={`relative select-none transition-all duration-300 ease-out ${className}`}
    >
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isHovered ? "8px" : "0px"})`,
          transition: isHovered ? "transform 0.05s linear" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
          transformStyle: "preserve-3d"
        }}
        className="w-full h-full relative rounded-2xl"
      >
        {/* Children Render Area */}
        <div style={{ transform: "translateZ(10px)" }}>
          {children}
        </div>

        {/* Dynamic Specular Highlights Sheen overlay */}
        <div
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,183,3,0.12) 0%, rgba(255,255,255,0) 65%)`,
            mixBlendMode: "screen",
            pointerEvents: "none",
            transition: isHovered ? "none" : "background 0.5s ease"
          }}
          className="absolute inset-0 rounded-2xl z-20 opacity-100"
        />

        {/* Outer subtle 3D border aura glow */}
        {isHovered && !isLocked && (
          <div 
            className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-orange-500/20 via-yellow-500/25 to-orange-500/10 -z-10 blur-[1px]" 
            style={{ transform: "translateZ(-2px)" }}
          />
        )}
      </div>
    </div>
  );
};

// 3. Apple-Inspired Elastic Premium Haptic Interactive Button
interface HapticAppleButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "submit" | "button" | "reset";
  // Secondary descriptive hover state metrics
  tooltipTitle?: string;
  tooltipDesc?: string;
  disabled?: boolean;
}

export const HapticAppleButton: React.FC<HapticAppleButtonProps> = ({
  children,
  onClick,
  className = "",
  type = "button",
  tooltipTitle = "System Verified Access",
  tooltipDesc = "Initiate military-grade academic proxy validation.",
  disabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    triggerHaptic("light");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic("success");
    if (onClick) onClick(e);
  };

  return (
    <div className="relative group/apple w-full">
      <motion.button
        type={type}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleButtonClick}
        whileHover={{ scale: 1.018, y: -1 }}
        whileTap={{ scale: 0.97, y: 1 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={`relative w-full z-10 select-none overflow-hidden active:scale-95 transition-all text-center rounded-xl cursor-pointer ${className}`}
      >
        {/* Micro lighting glare swipe transition on hover */}
        {isHovered && (
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 pointer-events-none"
          />
        )}
        
        {children}
      </motion.button>

      {/* High-Polish Apple-style Micro Tooltip Meta Overlay */}
      <AnimatePresence>
        {isHovered && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 p-3 bg-[#0a0a0f]/95 border border-white/10 rounded-xl shadow-xl backdrop-blur-md pointer-events-none select-none z-50 text-left font-sans"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400">
                {tooltipTitle}
              </h5>
            </div>
            <p className="text-[9px] text-slate-300 tracking-normal leading-normal">
              {tooltipDesc}
            </p>
            {/* Tooltip Chevron */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-3 h-3 bg-[#0a0a0f] rotate-45 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
