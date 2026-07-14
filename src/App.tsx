/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Lock,
  Download,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Check,
  Loader2,
  CornerDownRight,
  ChevronRight,
  ArrowLeft,
  Beaker,
  Eye,
  EyeOff
} from "lucide-react";

import ThemeToggle from "./components/theme";
import PhoneCodeThrouver from "./components/phonecodethrouver";
import SecurityPlus from "./components/Security+";
import AnimatedSubsLabs from "./components/animatedsubslabs";
import { TiltCard, HapticAppleButton, triggerHaptic } from "./components/ThreeDHaptic";
import AdminControlPanel from "./components/AdminControlPanel";
import { supabase } from "./lib/supabase";

// Types
type Phase = "loading" | "login" | "selection" | "dashboard" | "lab" | "admin";

interface LightningBolt {
  angle: number;
  segments: number;
  width: number;
  life: number;
  seed: number;
}

const REVISION_VIDEOS = [
  {
    id: 1,
    title: "Revision 1 Video Box",
    sub: "Model Paper 01 Review",
    duration: "1h 45m",
    isLocked: false,
    badge: "Active feed",
    topics: ["Algebra", "Calculus", "Trigonometry", "Kinematics", "Statics"],
    description: "This model paper includes five comprehensive questions covering algebra, calculus, trigonometry, kinematics, and statics. The two-hour paper emphasizes rigorous problem-solving, requiring students to demonstrate proficiency in mathematical proofs, vector analysis, and kinematic graphing techniques."
  },
  {
    id: 2,
    title: "Revision 2 Box",
    sub: "Advanced Integration Systems",
    duration: "Soon",
    isLocked: true,
    badge: "Upcoming",
    topics: ["Calculus", "Differentiation", "Core Proofs"]
  },
  {
    id: 3,
    title: "Revision 3 Box",
    sub: "Coplanar Forces & Statics",
    duration: "Soon",
    isLocked: true,
    badge: "Upcoming",
    topics: ["Applied Maths", "Coplanar Vectors", "Equilibrium"]
  },
  {
    id: 4,
    title: "Revision 4 Box",
    sub: "Quadratic Equations Proofs",
    duration: "Soon",
    isLocked: true,
    badge: "Upcoming",
    topics: ["Pure Algebra", "Roots", "Factors"]
  },
  {
    id: 5,
    title: "Revision 5 Box",
    sub: "Linear Motion & Kinematics",
    duration: "Soon",
    isLocked: true,
    badge: "Upcoming",
    topics: ["Kinematics", "Gravity", "Graphs"]
  },
  {
    id: 6,
    title: "Revision 6 Box",
    sub: "Trigonometric Formulations",
    duration: "Soon",
    isLocked: true,
    badge: "Upcoming",
    topics: ["Trigonometry", "Identities", "Sine-Cosine"]
  }
];

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [revisionVideos, setRevisionVideos] = useState<any[]>(REVISION_VIDEOS);
  const [phase, setPhase] = useState<Phase>("loading");
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [blackoutActive, setBlackoutActive] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: "" });
  const [debugInfo, setDebugInfo] = useState<string>("Checking session...");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Phase 1 (Loading) States
  const [percentage, setPercentage] = useState<number>(0);
  const [loaderStatus, setLoaderStatus] = useState<string>("PORTAL INITIALIZING...");

  // Phase 2 (Login) States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [statusAlert, setStatusAlert] = useState<{
    show: boolean;
    isSuccess: boolean;
    text: string;
    emoji: string;
  }>({ show: false, isSuccess: true, text: "", emoji: "⚡" });
  const [reactionImage, setReactionImage] = useState<string>(
    "https://raw.githubusercontent.com/dulajbandara28-sketch/Rajans-Media-unit/main/Static.png"
  );

  // Phase 3 (Dashboard) States
  const DEFAULT_VIDEO_URL = "https://stream.vidhosting.in/videos/b128d277.mp4";
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(DEFAULT_VIDEO_URL);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoVolume, setVideoVolume] = useState<number>(0.8);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [secureBlackout, setSecureBlackout] = useState<boolean>(false);
  const [firstPlayHappened, setFirstPlayHappened] = useState<boolean>(false);

  // Audio Context & Helper Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationContainerRef = useRef<HTMLDivElement | null>(null);
  const uiOverlayRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // Dynamic Video Lobby Hydration
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase === "selection" && currentUser) {
      const loadCourses = async () => {
        // Fetch all courses
        const { data: courses } = await supabase.from('courses').select('*').order('id', { ascending: true });
        
        // Fetch enrollments for the current student
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('student_id', currentUser.id);

        const enrolledIds = new Set(enrollments?.map((e: any) => e.course_id) || []);

        if (courses) {
          const formatted = courses.map((c: any) => ({
            id: c.id,
            title: c.title || `Revision ${c.id} Box`,
            sub: c.sub || "Video Module",
            duration: c.duration || "1h 45m",
            isLocked: !enrolledIds.has(c.id),
            badge: enrolledIds.has(c.id) ? "Active feed" : "Upcoming",
            topics: c.topics || ["Maths"],
            description: c.description || "Interactive learning module.",
            video_id: c.video_id
          }));
          setRevisionVideos(formatted);
        }
      };
      loadCourses();
    }
  }, [phase, currentUser]);

  // Sync videoRef to the correct video element based on screen size
  useEffect(() => {
    const syncVideoRef = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      videoRef.current = isMobile ? mobileVideoRef.current : desktopVideoRef.current;
    };
    syncVideoRef();
    window.addEventListener('resize', syncVideoRef);
    return () => window.removeEventListener('resize', syncVideoRef);
  }, [phase]);

  // Force the video element to reload when the active video URL changes
  useEffect(() => {
    // Reload both video elements so they pick up the new src
    if (desktopVideoRef.current) desktopVideoRef.current.load();
    if (mobileVideoRef.current) mobileVideoRef.current.load();
    setVideoPlaying(false);
    setVideoCurrentTime(0);
    setVideoDuration(0);
  }, [activeVideoUrl]);

  // ---------------------------------------------------------------------------
  // Custom Elegant Toast Helper
  // ---------------------------------------------------------------------------
  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => {
      setToast((prev) => (prev.msg === msg ? { ...prev, show: false } : prev));
    }, 3000);
  };

  // ---------------------------------------------------------------------------
  // Vintage Comic Audio Synthesizer (Standard Web Audio API)
  // ---------------------------------------------------------------------------
  const playRetroSound = (type: "pop" | "login" | "type" | "fail") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "pop") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.14);
      } else if (type === "login") {
        const now = audioCtx.currentTime;
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.type = "sawtooth";
          o.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.08, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.4);
        });
      } else if (type === "type") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400 + Math.random() * 300, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === "fail") {
        const now = audioCtx.currentTime;
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start();
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio permission safe block guard
    }
  };

  // ---------------------------------------------------------------------------
  // Phase 1 (Loading) Timer Control — with Session Persistence
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== "loading") return;

    const LOADING_DURATION_MS = 3000;
    const loadStages = [
      { limit: 20, text: "PORTAL INITIALIZING..." },
      { limit: 45, text: "PARSING ALGEBRA SYSTEM..." },
      { limit: 70, text: "RESOLVING CALCULUS GRAPH..." },
      { limit: 90, text: "POLISHING TRIGONOMETRY ENGINE..." },
      { limit: 100, text: "READY..." }
    ];

    // Check for existing Supabase session in parallel with loading animation
    let resolvedPhase: Phase | null = null;
    const sessionCheck = (async () => {
      try {
        setDebugInfo("Calling getSession()...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setDebugInfo(`Session error: ${sessionError.message}`);
          return;
        }
        if (!session) {
          setDebugInfo("No session found (not logged in)");
          return;
        }
        setDebugInfo(`Session found: ${session.user?.email}. Checking admin...`);
        setCurrentUser(session.user);
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id')
          .eq('id', session.user.id)
          .single();
        if (adminError) {
          setDebugInfo(`Admin check error: ${adminError.message}. Going to selection.`);
          resolvedPhase = "selection";
        } else {
          setDebugInfo(`Admin found! Routing to admin panel.`);
          setIsAdmin(true);
          resolvedPhase = "admin";
        }
      } catch (err: any) {
        setDebugInfo(`Catch error: ${err?.message || err}`);
      }
    })();

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / LOADING_DURATION_MS) * 100), 100);

      setPercentage(pct);

      const stage = loadStages.find((s) => pct <= s.limit);
      if (stage) setLoaderStatus(stage.text);

      if (pct >= 100) {
        clearInterval(interval);
        // Wait for both the animation AND session check to finish
        sessionCheck.then(() => {
          setTimeout(() => {
            setBlackoutActive(true);
            setTimeout(() => {
              setPhase(resolvedPhase || "login");
              setBlackoutActive(false);
            }, 1200);
          }, 500);
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // Mouse position tracker for Custom Interactive Cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement;
      if (target) {
        const isInteractive = target.closest('button, a, input, select, [role="button"], .cursor-pointer');
        setIsHoveringClickable(!!isInteractive);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Image fallback helper
  const handleTeacherImageFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://placehold.co/800x1000/F8F5F1/0F0F11?text=Indika+Rathinda";
  };

  // ---------------------------------------------------------------------------
  // Phase 2 (Login Canvas & Comic Interactivity) Loop
  // ---------------------------------------------------------------------------
  const canvasStateRef = useRef({
    rotSpeed: 1.5,
    pulseIntensity: 0.4,
    sparkDensity: 2,
    dotsDensity: 20,
    rayCount: 32,
    centerX: 0,
    centerY: 0,
    targetCenterX: 0,
    targetCenterY: 0,
    rotation: 0,
    pulseOffset: 0,
    shaking: false,
    shakeTimer: 0,
    lightningBolts: [] as LightningBolt[]
  });

  const triggerInteractionExplosionRef = useRef<((x: number, y: number, text?: string) => void) | null>(null);

  useEffect(() => {
    if (phase !== "login") return;

    const canvas = canvasRef.current;
    const container = animationContainerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = canvasStateRef.current;

    const currentTheme = {
      bgInner: "#fff677",
      bgOuter: "#f57c00",
      rayInner: "#ffd54f",
      rayOuter: "#e65100",
      dotColor: "rgba(230, 81, 0, 0.45)",
      lightning: "#ffffff",
      palette: ["#ffeb3b", "#f44336", "#ff5722", "#ff9800"],
      words: [
        "Maths with Indika",
        "Calculus System",
        "∫ f(x) dx",
        "E = mc²",
        "Trigonometry",
        "dy/dx",
        "sin²θ + cos²θ = 1",
        "Q.E.D!",
        "Algebra Complete",
        "∑ xᵢ"
      ]
    };

    // Resize Handler
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      if (state.centerX === 0) {
        state.centerX = rect.width / 2;
        state.centerY = rect.height / 2;
        state.targetCenterX = rect.width / 2;
        state.targetCenterY = rect.height / 2;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse Activity MouseMove
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      state.targetCenterX = e.clientX - rect.left;
      state.targetCenterY = e.clientY - rect.top;
    };

    // Touch Activity TouchMove
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        state.targetCenterX = e.touches[0].clientX - rect.left;
        state.targetCenterY = e.touches[0].clientY - rect.top;
      }
    };

    // Comic Floating words and stars generator
    const spawnComicWord = (x: number, y: number, text: string) => {
      const overlay = uiOverlayRef.current;
      if (!overlay) return;

      const el = document.createElement("div");
      el.className = "comic-text text-xl sm:text-2xl md:text-4xl font-black italic";
      el.innerText = text;

      const chosenColor = currentTheme.palette[Math.floor(Math.random() * currentTheme.palette.length)];
      el.style.color = chosenColor;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;

      overlay.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };

    const spawnBurstParticles = (x: number, y: number) => {
      const overlay = uiOverlayRef.current;
      if (!overlay) return;

      const particleCount = 10 + Math.floor(Math.random() * 8);

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        const isStar = Math.random() > 0.4;

        particle.className = "comic-star";
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 60 + Math.random() * 110;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.setProperty("--tx", `${tx}px`);
        particle.style.setProperty("--ty", `${ty}px`);
        particle.style.setProperty("--rot", `${(Math.random() - 0.5) * 720}deg`);

        const color = currentTheme.palette[Math.floor(Math.random() * currentTheme.palette.length)];

        if (isStar) {
          particle.innerHTML = `
            <svg style="width: 24px; height: 24px;" viewBox="0 0 24 24" fill="${color}" stroke="#000000" stroke-width="2.5">
              <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.409l8.2-1.191L12 .587z"/>
            </svg>
          `;
        } else {
          const size = 8 + Math.random() * 12;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.backgroundColor = color;
          particle.style.borderRadius = "50%";
          particle.style.border = "2px solid #000000";
        }

        overlay.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
      }
    };

    const triggerScreenShake = (duration = 15) => {
      state.shaking = true;
      state.shakeTimer = duration;
    };

    const triggerInteractionExplosion = (x: number, y: number, customWord?: string) => {
      const word = customWord || currentTheme.words[Math.floor(Math.random() * currentTheme.words.length)];
      spawnComicWord(x, y, word);
      spawnBurstParticles(x, y);
      triggerScreenShake(14);
      playRetroSound("pop");
    };

    // Stating ref for external handles (login callback success explosions)
    triggerInteractionExplosionRef.current = triggerInteractionExplosion;

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      triggerInteractionExplosion(x, y);
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("click", onClick);

    // Render loop
    let lastTime = 0;
    let animFrameId = 0;

    const updateAndRender = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Easing center positions
      state.centerX += (state.targetCenterX - state.centerX) * 0.12;
      state.centerY += (state.targetCenterY - state.centerY) * 0.12;

      state.rotation += 0.005 * state.rotSpeed;
      state.pulseOffset = Math.sin(time * 0.008) * state.pulseIntensity;

      ctx.save();

      // Shake translation offset
      if (state.shaking && state.shakeTimer > 0) {
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        ctx.translate(dx, dy);
        state.shakeTimer--;
        if (state.shakeTimer <= 0) state.shaking = false;
      }

      // Draw Base Radial Gradient
      const maxRadius = Math.max(canvas.width, canvas.height) * 1.2;
      const bgGrad = ctx.createRadialGradient(
        state.centerX, state.centerY, 10,
        state.centerX, state.centerY, maxRadius
      );
      bgGrad.addColorStop(0, currentTheme.bgInner);
      bgGrad.addColorStop(1, currentTheme.bgOuter);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Speed rays
      const { rayCount } = state;
      const angleStep = (Math.PI * 2) / rayCount;

      const rayGrad = ctx.createRadialGradient(
        state.centerX, state.centerY, 20,
        state.centerX, state.centerY, maxRadius
      );
      rayGrad.addColorStop(0, currentTheme.rayInner);
      rayGrad.addColorStop(0.7, currentTheme.rayInner);
      rayGrad.addColorStop(1, currentTheme.rayOuter);
      ctx.fillStyle = rayGrad;

      for (let i = 0; i < rayCount; i++) {
        const baseAngle = i * angleStep + state.rotation;
        const jitter = Math.sin(time * 0.005 + i * 2) * 0.03 * state.pulseIntensity;
        const angle1 = baseAngle + jitter;

        const widthFactor = 0.04 + Math.abs(Math.sin(time * 0.002 + i)) * 0.02 * state.pulseIntensity;
        const angle2 = angle1 + widthFactor;

        const lengthFactor = 0.95 + state.pulseOffset + Math.sin(time * 0.01 + i) * 0.05;
        const rayLength = maxRadius * lengthFactor;

        ctx.beginPath();
        ctx.moveTo(state.centerX, state.centerY);
        ctx.lineTo(state.centerX + Math.cos(angle1) * rayLength, state.centerY + Math.sin(angle1) * rayLength);
        ctx.lineTo(state.centerX + Math.cos(angle2) * rayLength, state.centerY + Math.sin(angle2) * rayLength);
        ctx.closePath();
        ctx.fill();
      }

      // Halftone points
      const spacing = state.dotsDensity;
      ctx.fillStyle = currentTheme.dotColor;

      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          const dx = x - state.centerX;
          const dy = y - state.centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const scaleJitter = 1 + Math.sin(time * 0.01 + x * y) * 0.15 * state.pulseIntensity;
          const normalizedDist = Math.min(distance / (maxRadius * 0.8), 1);
          const baseRadius = normalizedDist * (spacing * 0.28);
          const dotRadius = Math.max(0.1, baseRadius * scaleJitter);

          if (dotRadius > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Lightning bolts
      if (state.sparkDensity > 0 && Math.random() < 0.04 * state.sparkDensity) {
        const startAngle = Math.random() * Math.PI * 2;
        state.lightningBolts.push({
          angle: startAngle,
          segments: 4 + Math.floor(Math.random() * 5),
          width: 2 + Math.random() * 3,
          life: 1.0,
          seed: Math.random()
        });
      }

      ctx.strokeStyle = currentTheme.lightning;
      ctx.shadowColor = currentTheme.lightning;

      for (let b = state.lightningBolts.length - 1; b >= 0; b--) {
        const bolt = state.lightningBolts[b];
        ctx.lineWidth = bolt.width * bolt.life;
        ctx.shadowBlur = 15 * bolt.life;

        ctx.beginPath();
        let curX = state.centerX;
        let curY = state.centerY;
        ctx.moveTo(curX, curY);

        const baseDistance = maxRadius * 0.7;

        for (let s = 1; s <= bolt.segments; s++) {
          const progress = s / bolt.segments;
          const targetDist = progress * baseDistance;

          const angleJitter = (Math.random() - 0.5) * 0.45;
          const targetAngle = bolt.angle + angleJitter;

          const nextX = state.centerX + Math.cos(targetAngle) * targetDist;
          const nextY = state.centerY + Math.sin(targetAngle) * targetDist;

          ctx.lineTo(nextX, nextY);
        }
        ctx.stroke();

        bolt.life -= dt * 4.5;
        if (bolt.life <= 0) {
          state.lightningBolts.splice(b, 1);
        }
      }

      ctx.shadowBlur = 0;

      // Glow center orb
      const focalGrad = ctx.createRadialGradient(
        state.centerX, state.centerY, 0,
        state.centerX, state.centerY, 120 + Math.sin(time * 0.01) * 30
      );
      focalGrad.addColorStop(0, "#ffffff");
      focalGrad.addColorStop(0.3, currentTheme.bgInner);
      focalGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = focalGrad;
      ctx.beginPath();
      ctx.arc(state.centerX, state.centerY, 150, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      animFrameId = requestAnimationFrame(updateAndRender);
    };

    animFrameId = requestAnimationFrame(updateAndRender);

    // Initial load pop-burst
    setTimeout(() => {
      triggerInteractionExplosion(canvas.width / 2, canvas.height / 2, "Maths with Indika");
    }, 450);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("click", onClick);
      cancelAnimationFrame(animFrameId);
    };
  }, [phase]);

  // Handle typing event to release spark lightning
  const handleLoginInputReaction = () => {
    playRetroSound("type");
    const state = canvasStateRef.current;
    state.targetCenterX += (Math.random() - 0.5) * 24;
    state.targetCenterY += (Math.random() - 0.5) * 24;

    if (Math.random() < 0.22) {
      state.lightningBolts.push({
        angle: Math.random() * Math.PI * 2,
        segments: 3 + Math.floor(Math.random() * 3),
        width: 1.5 + Math.random() * 2,
        life: 0.6,
        seed: Math.random()
      });
    }
  };

  // Form Submission handles
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = canvasRef.current?.width || 500;
    const h = canvasRef.current?.height || 500;

    setStatusAlert({ show: true, isSuccess: true, text: "AUTHENTICATING...", emoji: "⏳" });

    let authError = null;
    let authUser = null;

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            whatsapp_number: whatsappNumber,
          }
        }
      });
      authError = error;
      authUser = data.user;
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = error;
      authUser = data.user;
    }

    if (!authError && authUser) {
      setCurrentUser(authUser);
      // Success Scenario
      setReactionImage("https://raw.githubusercontent.com/dulajbandara28-sketch/Rajans-Media-unit/main/correct%20password.png");
      setStatusAlert({
        show: true,
        isSuccess: true,
        text: isSignUp ? "SIGNUP COMPLETE. VERIFYING ROLE..." : "COSMIC SECURITY VERIFIED. CONNECTING MATH MODULES...",
        emoji: "⚡"
      });

      playRetroSound("login");

      // Sequential popping comic bursts in canvas split section
      if (triggerInteractionExplosionRef.current) {
        const expl = triggerInteractionExplosionRef.current;
        setTimeout(() => expl(w / 2, h / 2, "Maths with Indika"), 100);
        setTimeout(() => expl(w / 3, h / 2.5, "SUCCESS!"), 300);
        setTimeout(() => expl(w * 0.7, h * 0.6, "SOLVED!"), 500);
      }

      // Transition to selection page after successful login
      setTimeout(async () => {
        setBlackoutActive(true);
        
        // Role Verification Routing
        const { data: adminData } = await supabase
          .from('admins')
          .select('id')
          .eq('id', authUser.id)
          .single();

        setTimeout(() => {
          if (adminData) {
            setIsAdmin(true);
            setPhase("admin");
          } else {
            setPhase("selection");
          }
          setBlackoutActive(false);
        }, 1200);
      }, 5000);

    } else {
      // Failure Scenario
      setReactionImage("https://raw.githubusercontent.com/dulajbandara28-sketch/Rajans-Media-unit/main/Wrong%20password.png");
      setStatusAlert({
        show: true,
        isSuccess: false,
        text: authError?.message?.toUpperCase() || "COSMIC ACCESS DENIED. WRONG PASSKEY DETECTED!",
        emoji: "⚠️"
      });

      playRetroSound("fail");

      // Screen shaking & fail comic-pop label
      if (canvasStateRef.current) {
        canvasStateRef.current.shaking = true;
        canvasStateRef.current.shakeTimer = 24;
      }

      if (triggerInteractionExplosionRef.current) {
        triggerInteractionExplosionRef.current(w / 2, h / 2, "TRY AGAIN!");
      }

      // Reset feedback status block back after 4.5 seconds
      setTimeout(() => {
        setStatusAlert((prev) => (prev.text.includes("DENIED") ? { ...prev, show: false } : prev));
        setReactionImage("https://raw.githubusercontent.com/dulajbandara28-sketch/Rajans-Media-unit/main/Static.png");
      }, 4500);
    }
  };

  const triggerForgotClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const w = canvasRef.current?.width || 500;
    const h = canvasRef.current?.height || 500;
    if (triggerInteractionExplosionRef.current) {
      triggerInteractionExplosionRef.current(w / 2, h / 2, "REDIRECT!");
    }
    triggerToast("Redirecting to Instructor WhatsApp for password recovery...");
    setTimeout(() => {
      window.open("https://api.whatsapp.com/send/?phone=94713116877&text=Sir%2C+I+forgot+my+password+to+the+web.&type=phone_number&app_absent=0&utm_source=chatgpt.com", "_blank");
    }, 400);
  };

  // ---------------------------------------------------------------------------
  // Phase 3 (Dashboard) Event Handlers & Security Binds
  // ---------------------------------------------------------------------------
  // Auto-render KaTeX on dashboard transition
  useEffect(() => {
    if (phase !== "dashboard") return;

    setTimeout(() => {
      const renderMath = (window as any).renderMathInElement;
      if (renderMath) {
        renderMath(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false
        });
      }
    }, 120);
  }, [phase]);

  // Video Events Sync Hooks
  useEffect(() => {
    if (phase !== "dashboard") return;
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    const onTimeUpdate = () => {
      if (!secureBlackout) {
        setVideoCurrentTime(video.currentTime);
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [phase, secureBlackout]);

  // Security Focus Listeners (Screenshot Safeguards)
  useEffect(() => {
    if (phase !== "dashboard") return;

    const triggerScreenshotBlock = () => {
      if (firstPlayHappened && !secureBlackout) {
        setSecureBlackout(true);
        videoRef.current?.pause();
        setVideoPlaying(false);
        triggerToast("Secure Shield Lock Activated");
      }
    };

    const handleWindowBlur = () => {
      triggerScreenshotBlock();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerScreenshotBlock();
      }
    };

    const handleHardwarePrintScreen = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        // Clear clipboard
        document.execCommand("copy");
        triggerScreenshotBlock();
      }
    };

    const handleKeyDownSecurityBlock = (e: KeyboardEvent) => {
      // Limit printing, console inspect window overlays, and saving
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        triggerScreenshotBlock();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        triggerScreenshotBlock();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault();
        triggerScreenshotBlock();
      }
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keyup", handleHardwarePrintScreen);
    window.addEventListener("keydown", handleKeyDownSecurityBlock);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keyup", handleHardwarePrintScreen);
      window.removeEventListener("keydown", handleKeyDownSecurityBlock);
    };
  }, [phase, secureBlackout, firstPlayHappened]);

  // Dashboard Video Controller Methods
  const togglePlay = () => {
    if (secureBlackout) {
      setSecureBlackout(false);
      triggerToast("System Decrypted & Unlocked");
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => {
          setVideoPlaying(true);
          setFirstPlayHappened(true);
        })
        .catch((err) => {
          console.error("Playback restriction: " + err.message);
        });
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  };

  const skipTime = (amount: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + amount));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (videoMuted) {
      video.muted = false;
      setVideoMuted(false);
      video.volume = videoVolume;
    } else {
      video.muted = true;
      setVideoMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVideoVolume(val);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      if (val === 0) {
        video.muted = true;
        setVideoMuted(true);
      } else {
        video.muted = false;
        setVideoMuted(false);
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVideoCurrentTime(val);
    const video = videoRef.current;
    if (video) {
      video.currentTime = val;
    }
  };

  const handleSpeedChange = (rate: string) => {
    const r = parseFloat(rate);
    setPlaybackSpeed(r);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = r;
      triggerToast(`Speed Rate: ${rate}x`);
    }
  };

  const triggerPiP = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        video.requestPictureInPicture();
      }
    } catch (e) {
      triggerToast("PiP requires browser support.");
    }
  };

  const toggleFullscreen = () => {
    const wrapper = videoWrapperRef.current;
    if (!wrapper) return;

    try {
      if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch((err) => {
          console.error("Fullscreen blocked: " + err.message);
        });
      } else {
        document.exitFullscreen();
      }
    } catch (e) {
      triggerToast("Fullscreen requires user event permissions.");
    }
  };

  const handlePaperRedirect = () => {
    triggerToast("Redirecting to Model Paper Drive...");
    setTimeout(() => {
      window.open("https://drive.google.com/file/d/1vF65nDJfpxT4bvIw1-Vr7MXo5YmlHSgf/view?usp=drivesdk", "_blank");
    }, 400);
  };

  // Helper formatting seconds into clean MM:SS format
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  // 3D Parallax Mouse Handlers
  const handleParallaxMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotY = (x / rect.width - 0.5) * 10;
    const rotX = (y / rect.height - 0.5) * -10;

    card.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`;
    card.style.background = `
      radial-gradient(circle at ${x}px ${y}px, rgba(255, 140, 0, 0.12), transparent 40%),
      linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))
    `;
  };

  const handleParallaxLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    card.style.background = "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))";
  };

  return (
    <div className="w-screen min-h-screen relative overflow-x-hidden md:cursor-none select-none">
      
      {/* High-Grade Intellectual Property Security Shield */}
      <SecurityPlus />
      
      {/* Custom Interactive Cursor Dot & Ring (Desktop only) */}
      <div 
        id="interactive-cursor"
        className="hidden md:block pointer-events-none fixed z-[99999] -translate-x-1/2 -translate-y-1/2 select-none"
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
        }}
      >
        <div className={`rounded-full border border-orange-400 bg-orange-500/10 absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          isHoveringClickable ? "w-10 h-10 border-orange-300 bg-orange-500/20 scale-125" : "w-6 h-6"
        }`} />
        <div className={`w-1.5 h-1.5 rounded-full bg-orange-400 absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
          isHoveringClickable ? "bg-orange-300 scale-150" : ""
        }`} />
      </div>

      {/* Cinematic theatrical blackout shader overlay */}
      <div 
        id="blackout-screen" 
        className={`cinematic-blackout ${blackoutActive ? "blackout-active" : ""}`}
      />

      {/* =======================================================================
          PHASE 1: THE ACADEMIC LOADING SCREEN
          ======================================================================= */}
      {phase === "loading" && (
        <div className="phase-loading-theme relative min-h-screen w-screen flex flex-col justify-between overflow-hidden bg-[#FBFAF8] text-[#1a1a1a]">
          
          <div className="premium-radial-bg" />

          <div className="relative z-20 flex flex-col justify-between h-screen w-full py-8 md:py-12 px-6">
            
            {/* Header Titles with realistic typewriter staggered enters */}
            <div className="text-center w-full max-w-5xl mx-auto select-none mt-8 md:mt-12 flex flex-col items-center">
              <h2 id="title-line-1" className="classy-serif-text text-2xl sm:text-3xl md:text-4xl italic font-normal mb-3 text-orange-500 flex flex-wrap justify-center gap-x-2">
                {"Maths with".split(" ").map((word, wIdx) => (
                  <span key={wIdx} className="inline-block whitespace-nowrap">
                    {word.split("").map((char, i) => (
                      <span
                        key={i}
                        className="typewriter-char select-none"
                        style={{ animationDelay: `${(wIdx * 6 + i) * 0.05}s` }}
                        dangerouslySetInnerHTML={{ __html: char }}
                      />
                    ))}
                  </span>
                ))}
              </h2>
              <h1 id="title-line-2" className="classy-serif-text text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-[#1a1a1a] leading-none mb-1 flex flex-wrap justify-center gap-x-3">
                {"INDIKA RATHINDA".split(" ").map((word, wIdx) => (
                  <span key={wIdx} className="inline-block whitespace-nowrap">
                    {word.split("").map((char, i) => (
                      <span
                        key={i}
                        className="typewriter-char select-none"
                        style={{ animationDelay: `${0.4 + (wIdx * 8 + i) * 0.05}s` }}
                        dangerouslySetInnerHTML={{ __html: char }}
                      />
                    ))}
                  </span>
                ))}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] text-orange-400 font-bold mt-6 select-none animate-pulse">
                Initializing Educational Environment
              </p>
            </div>

            {/* Teacher Presentation Image - elegant editorial cutout style with sunset glow back aura */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl flex justify-center items-end h-[55vh] sm:h-[60vh] md:h-[65vh] pointer-events-none z-10 overflow-visible">
              <div className="absolute bottom-10 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-orange-400 rounded-full filter blur-[100px] opacity-25 z-0" />
              <img
                id="teacher-cutout"
                src="https://raw.githubusercontent.com/dulajbandara28-sketch/Rajans-Media-unit/main/bg%20remvoed.png"
                alt="Indika Rathinda Portrait"
                className="h-full w-auto object-contain select-none transform translate-y-3 scale-110 opacity-100 z-10 transition-all duration-300 pointer-events-none"
                onError={handleTeacherImageFallback}
              />
            </div>

            {/* Portal Progress Loader */}
            <div className="w-full max-w-md mx-auto flex flex-col items-center mt-auto z-30 pb-8 text-[#1a1a1a]">
              <div className="loader-box-border w-full bg-white/90 backdrop-blur border border-orange-200/50 px-6 py-5 shadow-lg rounded-xl">
                <div className="w-full flex justify-between items-center mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]">
                  <span id="loader-status" className="font-sans text-orange-600">{loaderStatus}</span>
                  <span id="loader-percentage" className="font-mono text-orange-500">{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-orange-100/40 relative overflow-hidden rounded-full">
                  <div
                    id="loader-bar"
                    className="loader-accent-bar absolute inset-y-0 left-0 bg-[#1a1a1a] transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Est 2024 copy note from design */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-[#999] select-none text-center font-semibold">
              Combine Maths
            </div>

          </div>
        </div>
      )}

      {/* =======================================================================
          PHASE 2: POP-ART COMIC LOGIN CANVAS
          ======================================================================= */}
      {phase === "login" && (
        <div className="phase-login-theme grid grid-cols-1 lg:grid-cols-2 h-screen w-screen overflow-hidden">
          
          {/* Left Panel: Comic Access UI */}
          <div className="comic-left-container h-full flex flex-col justify-between p-6 sm:p-10 md:p-12 z-30 relative overflow-y-auto">
            
            {/* Halftone backdrop array */}
            <div className="comic-halftone-backdrop absolute inset-0 pointer-events-none" />

            {/* Header Badge */}
            <div className="relative z-10 select-none">
              <div className="flex items-center space-x-2">
                <div 
                  className="comic-header-badge px-4 py-2 text-lg md:text-xl tracking-wider uppercase select-none"
                  style={{ fontFamily: "'Luckiest Guy', cursive" }}
                >
                  Indika.Rathinda
                </div>
              </div>
            </div>

            {/* Visual Debug Box */}
            <div className="mb-4 bg-black text-green-400 p-4 font-mono text-xs z-50 relative border-2 border-green-500 rounded whitespace-pre-wrap max-w-sm mx-auto shadow-lg shadow-green-500/20">
              <span className="text-white font-bold mb-1 block uppercase">System Trace:</span>
              {debugInfo}
            </div>

            {/* Central Form Container */}
            <div className="w-full max-w-sm mx-auto flex flex-col relative z-20 py-6">
              <h1 className="text-3xl sm:text-4xl font-black text-black leading-tight mb-2 tracking-tight uppercase">
                {isSignUp ? "Join the Portal" : "Welcome Hero"}
              </h1>
              <p className="text-xs text-gray-700 mb-6 font-semibold uppercase tracking-wider">
                {isSignUp ? "Sign up to access Maths with Indika" : "Log in to sync with the Maths.IndikaRathinda"}
              </p>

              {/* Secure dynamic interactive status alert box */}
              {statusAlert.show && (
                <div 
                  id="statusAlert" 
                  className={`mb-6 p-4 font-bold text-xs flex items-center space-x-2 animate-bounce ${
                    statusAlert.isSuccess ? "comic-status-alert-success" : "comic-status-alert-error"
                  }`}
                >
                  <span className="text-lg">{statusAlert.emoji}</span>
                  <span className="uppercase tracking-wider leading-tight text-xs font-black">{statusAlert.text}</span>
                </div>
              )}

              <form id="loginForm" onSubmit={handleLoginSubmit} className="space-y-5">
                
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onInput={handleLoginInputReaction}
                      placeholder="Indika Rathinda"
                      className="comic-input-bold w-full"
                    />
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <label className="block text-xs font-black text-black uppercase tracking-wider mb-2 mt-4">
                      WHATSAPP NUMBER
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      onInput={handleLoginInputReaction}
                      placeholder="+94 7X XXX XXXX"
                      className="comic-input-bold w-full"
                    />
                  </div>
                )}

                {/* Email address field */}
                <div>
                  <label className="block text-xs font-black text-black uppercase tracking-wider mb-2">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onInput={handleLoginInputReaction}
                    placeholder="indika@rathinda.com"
                    className="comic-input-bold w-full"
                  />
                </div>

                {/* Password / key field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">
                      SECURE KEY
                    </label>
                    <a 
                      href="#" 
                      onClick={triggerForgotClick} 
                      className="text-xs font-black text-red-600 tracking-wider hover:underline font-bold"
                    >
                      FORGOT?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onInput={handleLoginInputReaction}
                      placeholder="••••••••••••"
                      className="comic-input-bold w-full pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Action primary enter button */}
                <div className="pt-3">
                  <HapticAppleButton 
                    type="submit" 
                    tooltipTitle="SECURE BINDING ENTER"
                    tooltipDesc="Validates G.C.E. A/L specialist credentials and establishes session tunneling."
                    className="comic-btn-bold w-full py-4 text-center cursor-pointer uppercase tracking-wider font-extrabold block"
                  >
                    {isSignUp ? "SIGN UP" : "ENTER"}
                  </HapticAppleButton>
                </div>
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs font-bold text-black hover:underline uppercase tracking-wider"
                  >
                    {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
                  </button>
                </div>

              </form>
            </div>

            {/* Footer balanced spacer */}
            <div className="text-[10px] font-bold text-black uppercase tracking-widest z-10 w-full text-left">
              G.C.E. A/L Combined Mathematics
            </div>

          </div>

          {/* Right Panel: Interactive Comic Speed-Ray Canvas */}
          <div 
            ref={animationContainerRef} 
            id="animationContainer" 
            className="col-span-1 lg:col-span-1 h-full relative overflow-hidden bg-[#0b0b0f] cursor-crosshair"
          >
            {/* Speed-Ray Canvas draws vivid mathematical rays */}
            <canvas ref={canvasRef} id="burstCanvas" className="absolute inset-0 w-full h-full block z-10" />

            {/* Character reaction portrait artwork positioned beautifully as original */}
            <img
              id="reactionImage"
              src={reactionImage}
              alt="Reaction Status Illustration"
              className="absolute bottom-0 left-0 w-full object-contain pointer-events-none select-none transition-all duration-300 z-15"
              style={{ zIndex: 15, maxHeight: "65%" }}
              onError={handleTeacherImageFallback}
            />

            {/* UI floating text particles layer */}
            <div ref={uiOverlayRef} id="uiOverlay" className="absolute inset-0 pointer-events-none z-20 overflow-hidden" />

          </div>

        </div>
      )}

      {/* =======================================================================
          PHASE 2.5: COMBINED MATHEMATICS PREMIUM VIDEO SELECTION LOBBY
          ======================================================================= */}
      {phase === "selection" && (
        <div className={`min-h-screen relative flex flex-col justify-between py-10 px-4 md:px-12 font-sans overflow-hidden transition-all duration-300 ${
          isDarkTheme ? "phase-dashboard-theme text-white bg-[#0a0a0f]" : "bg-[#fbfaf8] text-slate-800"
        }`}>
          
          {/* Animated Ambient Backdrop Orbs */}
          {isDarkTheme && (
            <>
              <div className="ambient-glow glow-orange" />
              <div className="ambient-glow glow-yellow" />
            </>
          )}
          <div className="pixel-grid-layer absolute inset-0 opacity-[0.03] pointer-events-none z-0" />

          <div id="lobby-container" className="w-full max-w-6xl mx-auto z-10 space-y-8 relative">
            
            {/* Header section matching YouTube Premium style */}
            <header className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b ${isDarkTheme ? "border-white/5" : "border-slate-200"}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2.5 h-2.5 bg-orange-400 animate-pulse rounded-full" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold">
                    Interactive Video Lobby
                  </span>
                </div>
                <h1 className={`text-3xl md:text-4xl font-serif italic tracking-tight leading-none font-bold ${isDarkTheme ? "text-white" : "text-slate-900"}`}>
                  Select Revision Session
                  <span className={`text-xs uppercase font-sans tracking-[0.2em] ml-4 font-normal ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}>
                    _ 2027 A/L MATHS LOBBY
                  </span>
                </h1>
                <p className={`text-xs mt-2 italic font-serif ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}>
                  Access comprehensive model paper analyses prepared specifically for Advanced Level classrooms.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button 
                    onClick={() => setPhase("admin")}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                  >
                    Admin Panel
                  </button>
                )}
                <ThemeToggle 
                  isDark={isDarkTheme} 
                  onToggle={() => setIsDarkTheme(!isDarkTheme)} 
                  playAudio={playRetroSound}
                />
                <div className="border border-orange-500/30 bg-orange-500/10 text-orange-400 px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold flex items-center gap-2 rounded-xl backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                  Active Revision Library V2
                </div>
              </div>
            </header>

            {/* Subtitle / Lobby Intro Panel */}
            <div className="glass-panel-dark p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-25 filter grayscale-[100%] brightness-[0.4] group-hover:grayscale-[0%] group-hover:brightness-[0.65] group-hover:opacity-45 transition-all duration-[750ms] ease-out pointer-events-none" 
                style={{ backgroundImage: `url('https://raw.githubusercontent.com/dulajbandara28-sketch/Rajans-Media-unit/main/Static.png')` }} 
              />
              <div className="card-orb-amber" style={{ top: "-40px", right: "-40px", width: "150px", height: "150px" }} />
              <div className="relative z-10">
                <h2 className="text-xl font-serif text-white font-bold tracking-tight">Combined Mathematics Video Platform</h2>
                <p className="text-xs text-slate-200 mt-1 max-w-2xl font-serif italic">
                  Prepare for your examinations with real-time video lectures, structural paper solutions, and live doubts clearing. Hover over active sessions to display core syllabus targets.
                </p>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-[10px] uppercase tracking-[0.15em] font-extrabold text-slate-300">Instructor:</span>
                <span className="glass-pill-amber text-[10px] font-bold">Indika Rathninda</span>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-[1400px] mx-auto auto-rows-fr relative z-20">
              {revisionVideos.map((vid) => {
                const isLocked = vid.isLocked;
                const isVid1 = vid.id === 1;
                
                return (
                  <TiltCard
                    key={vid.id}
                    isLocked={isLocked}
                    onMouseEnter={() => {
                      if (isVid1) {
                        setHoveredVideo(1);
                        playRetroSound("type");
                      } else {
                        setHoveredVideo(vid.id);
                      }
                    }}
                    onMouseLeave={() => setHoveredVideo(null)}
                    onClick={() => {
                      if (!isLocked) {
                        setActiveVideoUrl(vid.video_id && vid.video_id.trim() !== '' ? vid.video_id.trim() : DEFAULT_VIDEO_URL);
                        setVideoPlaying(false);
                        setVideoCurrentTime(0);
                        setPhase("dashboard");
                        triggerToast(`Launching ${vid.title} Environment`);
                      } else {
                        triggerToast(`🔒 ${vid.title} is Coming Soon!`);
                      }
                    }}
                    className={`p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 relative overflow-hidden group min-h-[350px] border ${
                      isDarkTheme 
                        ? (isLocked 
                            ? "border-white/5 bg-slate-950/20 opacity-60 hover:opacity-85" 
                            : "border-orange-500/20 bg-slate-950/40 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10")
                        : (isLocked 
                            ? "border-slate-200 bg-white opacity-60 hover:opacity-85" 
                            : "border-slate-200/80 bg-white hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/5")
                    }`}
                  >
                    {isDarkTheme && (
                      <div className="card-orb-amber" style={{ bottom: "-30px", right: "-30px", width: "130px", height: "130px" }} />
                    )}
                    
                    {/* Inner content */}
                    <div className="relative z-10 flex flex-col justify-between h-full w-full gap-4">
                      
                      {/* Top Header Badge Row */}
                      <div className="flex justify-between items-center w-full">
                        <span className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] font-extrabold rounded-full ${
                          isLocked 
                            ? (isDarkTheme ? "bg-white/5 text-slate-550 border border-white/5" : "bg-slate-100 text-slate-500 border border-slate-200") 
                            : "bg-orange-500/15 text-orange-400 border border-orange-500/30 animate-pulse"
                        }`}>
                          {isLocked ? "Soon" : vid.badge}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500 tracking-wider">
                          {isLocked ? "LOCKED" : "REV-01"}
                        </span>
                      </div>

                      {/* Main Course Info */}
                      <div className="space-y-2 py-1">
                        <p className="text-[10px] text-orange-400/80 uppercase font-sans font-bold tracking-[0.2em]">
                          Combined Mathematics
                        </p>
                        <h3 className={`text-xl font-serif font-bold tracking-tight transition-colors duration-300 ${isDarkTheme ? "text-white" : "text-slate-800"}`}>
                          {vid.title}
                        </h3>
                        
                        {/* Syllabus lists */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {vid.topics.map((t, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded text-[8.5px] font-mono uppercase tracking-wider ${isDarkTheme ? "bg-white/5 text-slate-300" : "bg-slate-100/90 text-slate-700"}`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Hoverable Interactive Description Component */}
                      {isVid1 && (
                        <div 
                          className={`p-3.5 border rounded-xl transition-all duration-300 ${
                            isDarkTheme 
                              ? "bg-orange-500/5 border-orange-500/10" 
                              : "bg-orange-500/[0.03] border-orange-200"
                          } ${
                            hoveredVideo === 1 
                              ? "opacity-100 scale-[1.01]" 
                              : "opacity-45"
                          }`}
                        >
                          <p className="text-[9px] uppercase font-bold text-orange-400 mb-1 tracking-widest flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
                            Session Syllabus Targets:
                          </p>
                          <p className={`text-[11px] leading-relaxed font-serif italic ${isDarkTheme ? "text-slate-200" : "text-slate-700"}`}>
                            {hoveredVideo === 1 
                              ? vid.description
                              : vid.description.slice(0, 92) + "..."
                            }
                          </p>
                        </div>
                      )}

                      {/* Non-active cards custom details */}
                      {!isVid1 && (
                        <div className={`p-3.5 border rounded-xl flex items-center justify-between ${
                          isDarkTheme ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
                        }`}>
                          <div>
                            <p className={`text-[9px] uppercase font-bold tracking-widest ${isDarkTheme ? "text-slate-400" : "text-slate-550"}`}>Syllabus Access</p>
                            <p className={`text-[11px] italic mt-0.5 ${isDarkTheme ? "text-slate-500" : "text-slate-600"}`}>Advanced integration, calculus & static mechanics soon.</p>
                          </div>
                          <Lock className="h-3.5 w-3.5 text-slate-550" />
                        </div>
                      )}

                      {/* Bottom duration & interactive trigger row */}
                      <div className={`pt-2.5 border-t flex justify-between items-center w-full mt-2 ${
                        isDarkTheme ? "border-white/5" : "border-slate-200/60"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold ${isDarkTheme ? "text-slate-500" : "text-slate-440"}`}>Duration:</span>
                          <span className={`font-mono text-[11px] font-bold ${isLocked ? "text-slate-500" : "text-orange-400"}`}>
                            {vid.duration}
                          </span>
                        </div>
                        
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isLocked 
                            ? (isDarkTheme ? "border-white/5 text-slate-500" : "border-slate-200 text-slate-400") 
                            : "border-orange-500/30 text-orange-400 bg-orange-500/10 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 group-hover:scale-110"
                        }`}>
                          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                        </div>
                      </div>

                    </div>
                  </TiltCard>
                );
              })}
            </div>

            {/* Lobby Footer */}
            <footer className={`flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest pt-6 border-t gap-2 relative z-10 w-full mt-6 ${
              isDarkTheme ? "text-slate-500 border-white/5" : "text-slate-600 border-slate-200"
            }`}>
              <div>
                &copy; Est. 2024 Combined Mathematics by Indika Rathninda. All content is secure and proprietary.
              </div>
              <div>
                <span className="text-orange-400/65">G.C.E. Advanced Level Specialist — Sri Lanka</span>
              </div>
            </footer>

          </div>
        </div>
      )}

      {/* =======================================================================
          PHASE 3: HIGH-POLISH COMBINED MATHS WORKSPACE DASHBOARD
          ======================================================================= */}
      {phase === "dashboard" && (
        <div className={`min-h-screen relative flex flex-col justify-between py-10 px-4 md:px-12 font-sans overflow-hidden transition-all duration-300 ${
          isDarkTheme ? "phase-dashboard-theme text-white bg-[#0a0a0f]" : "bg-[#fbfaf8] text-slate-800"
        }`}>
          
          <div id="app-container" className="w-full max-w-6xl mx-auto z-10 space-y-8 relative">
            
            {/* Elegant Header Branding Row */}
            <header className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b ${isDarkTheme ? "border-white/5" : "border-slate-200"}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-2.5 h-2.5 bg-orange-400 animate-ping rounded-full" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-semibold">
                    Combined Mathematics Revision
                  </span>
                </div>
                <h1 className={`text-3xl md:text-4xl font-serif italic tracking-tight leading-none font-bold ${isDarkTheme ? "text-white" : "text-slate-900"}`}>
                  Maths with Indika
                  <span className={`text-xs uppercase font-sans tracking-[0.2em] ml-4 font-normal ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}>
                    _ Est. 2024
                  </span>
                </h1>
                <p className={`text-xs mt-2 italic font-serif ${isDarkTheme ? "text-slate-400" : "text-slate-600"}`}>
                  "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding."
                </p>
              </div>
 
              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle 
                  isDark={isDarkTheme} 
                  onToggle={() => setIsDarkTheme(!isDarkTheme)} 
                  playAudio={playRetroSound}
                />
                <button 
                  onClick={() => {
                    playRetroSound("pop");
                    setPhase("selection");
                    if (videoPlaying) {
                      videoRef.current?.pause();
                      setVideoPlaying(false);
                    }
                  }}
                  className={`border px-4 py-2 text-[10px] uppercase tracking-[0.25em] font-bold flex items-center gap-2 rounded-xl backdrop-blur-md cursor-pointer transition-all ${
                    isDarkTheme 
                      ? "border-white/10 hover:border-orange-500/30 bg-white/5 hover:bg-orange-500/10 text-slate-300 hover:text-orange-400" 
                      : "border-slate-300 hover:border-orange-500/20 bg-white hover:bg-slate-50 text-slate-700 hover:text-orange-500"
                  }`}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to Lobby
                </button>

              </div>
            </header>
 
            {/* Main Workspace Layout (Desktop Only) */}
            <main className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Responsive Video Player Frame */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                
                {/* Editorial Classy Frame with custom liquid glassism */}
                <div 
                  ref={videoWrapperRef}
                  id="video-frame-wrapper" 
                  className="liquid-glass-wrapper p-3 relative group shadow-xl overflow-hidden rounded-2xl border border-white/5 bg-slate-900/30"
                  onContextMenu={(e) => {
                    e.preventDefault();
                    triggerToast("Right-Click Restrained on Video Feed");
                  }}
                >
                  <div className="pixel-grid-layer absolute inset-0 opacity-[0.03] pointer-events-none z-5" />
                  <div className="card-orb-amber" style={{ top: "-50px", left: "-50px", width: "150px", height: "150px" }} />

                  {/* Watermark grid overlay - styled beautifully */}
                  <div 
                    id="secure-watermark" 
                    className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none z-20 opacity-10 select-none text-[8px] text-white tracking-[0.2em] font-mono uppercase items-center justify-items-center"
                  >
                    <div>INDIKA RATHINDA</div> <div>IP: PROTECTED</div> <div>2027 REVISION</div>
                    <div>DO NOT CAPTURE</div> <div className="text-orange-400 font-bold scale-105">REVISION SECURE</div> <div>MATHS SANDBOX</div>
                    <div>CONFIDENTIAL</div> <div>COMBINED MATHS</div> <div>G.C.E. A/L</div>
                  </div>

                  {/* Secure blurred overlay protection screen with Editorial looks */}
                  <div 
                    id="security-blackout-overlay" 
                    onClick={() => {
                      setSecureBlackout(false);
                      triggerToast("System Decrypted & Unlocked");
                    }}
                    className={`absolute inset-0 bg-[#09090d]/95 z-40 flex-col items-center justify-center gap-4 text-center p-8 rounded-none border border-white/10 ${
                      secureBlackout ? "flex animate-fade-in" : "hidden"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center animate-bounce">
                      <Lock className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-[0.15em] font-sans uppercase">
                      SCREEN CAPTURE SAFEGUARD ACTIVE
                    </h3>
                    <p className="text-xs text-slate-355 max-w-md leading-relaxed font-serif italic">
                      The Combined Mathematics revision feed has been temporarily blacked out. The system has automatically locked down because browser window focus was shifted or screen capturing was registered.
                    </p>
                    <div className="mt-3 text-[10px] text-white uppercase tracking-[0.25em] font-bold bg-orange-500 hover:bg-orange-400 px-5 py-3 rounded-xl cursor-pointer transition-all">
                      Click here to resume revision stream
                    </div>
                  </div>

                  {/* Actual Video Frame */}
                  <div className="relative rounded-xl overflow-hidden bg-black/95 aspect-video z-0" id="video-container">
                    <video 
                      ref={desktopVideoRef}
                      id="main-video" 
                      onClick={togglePlay}
                      className="w-full h-full object-cover rounded-xl cursor-pointer" 
                      playsInline 
                      preload="auto"
                      src={activeVideoUrl}
                      disablePictureInPicture
                      disableRemotePlayback
                      controlsList="nodownload noplaybackrate nofullscreen"
                      crossOrigin="anonymous"
                    >
                    </video>

                    {/* Lens reflection shine */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none mix-blend-color-dodge bg-gradient-to-br from-white/5 via-transparent to-transparent" />

                    {/* Editorial media controls bar */}
                    <div 
                      id="media-controls-deck" 
                      className={`absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-3 z-30 transition-all duration-300 ease-out ${
                        !videoPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0"
                      }`}
                    >
                      {/* Timeline progression bar */}
                      <div className="flex items-center gap-3">
                        <span id="current-time-lbl" className="text-[10px] font-mono text-slate-300">
                          {formatTime(videoCurrentTime)}
                        </span>
                        <div className="flex-grow relative flex items-center">
                          <input 
                            type="range" 
                            id="progress-bar" 
                            min="0" 
                            max={isNaN(videoDuration) ? 100 : videoDuration} 
                            value={videoCurrentTime}
                            onChange={handleProgressChange}
                            className="w-full h-1 bg-white/20 appearance-none bg-white/10 cursor-pointer outline-none amber-slider rounded-full" 
                          />
                          <div 
                            id="progress-fill" 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full pointer-events-none" 
                            style={{ width: `${videoDuration ? (videoCurrentTime / videoDuration) * 100 : 0}%` }}
                          />
                        </div>
                        <span id="duration-lbl" className="text-[10px] font-mono text-slate-300">
                          {formatTime(videoDuration)}
                        </span>
                      </div>

                      {/* Commands and deck parameters */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-3">
                          
                          {/* Play or Pause */}
                          <button 
                            id="btn-play-pause" 
                            onClick={togglePlay} 
                            className="p-2.5 rounded-full bg-orange-500 text-white hover:bg-orange-400 transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20 border-none cursor-pointer outline-none"
                          >
                            {!videoPlaying ? (
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="6,4 20,12 6,20" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="5" y="4" width="4" height="16" />
                                <rect x="15" y="4" width="4" height="16" />
                              </svg>
                            )}
                          </button>

                          {/* Skip Retrograde */}
                          <button 
                            onClick={() => skipTime(-10)} 
                            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded" 
                            title="Rewind 10s"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                            </svg>
                          </button>

                          {/* Skip Fast Forward */}
                          <button 
                            onClick={() => skipTime(10)} 
                            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded" 
                            title="Forward 10s"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                            </svg>
                          </button>

                        </div>

                        {/* Volume Adjuster */}
                        <div className="flex items-center gap-2">
                          <button onClick={toggleMute} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded">
                            {videoMuted ? (
                              <VolumeX className="h-4 w-4 text-red-500" />
                            ) : (
                              <Volume2 className="h-4 w-4 text-slate-100" />
                            )}
                          </button>
                          <input 
                            type="range" 
                            id="volume-bar" 
                            min="0" 
                            max="1" 
                            step="0.05" 
                            value={videoMuted ? 0 : videoVolume} 
                            onChange={handleVolumeChange}
                            className="w-16 md:w-20 h-1 bg-white/20 outline-none cursor-pointer amber-slider rounded-full" 
                          />
                        </div>

                        {/* Special controls: speed select, PiP & Fullscreen panel */}
                        <div className="flex items-center gap-2">
                          <select 
                            id="speed-selector" 
                            value={playbackSpeed}
                            onChange={(e) => handleSpeedChange(e.target.value)}
                            className="bg-black/40 backdrop-blur-md text-[10px] text-white border border-white/10 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer focus:border-orange-500/50"
                          >
                            <option value="0.5">0.5x</option>
                            <option value="1">1.0x</option>
                            <option value="1.25">1.25x</option>
                            <option value="1.5">1.5x</option>
                            <option value="2">2.0x</option>
                          </select>

                          <button onClick={triggerPiP} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded" title="Picture in Picture">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>

                          <button onClick={toggleFullscreen} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer rounded" title="Fullscreen">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5 5" />
                            </svg>
                          </button>

                          <button 
                            onClick={() => {
                              playRetroSound("pop");
                              if (videoPlaying) {
                                videoRef.current?.pause();
                                setVideoPlaying(false);
                              }
                              setPhase("lab");
                            }} 
                            className="p-2 text-orange-450 hover:text-orange-300 hover:bg-orange-500/10 transition-colors cursor-pointer rounded flex items-center justify-center" 
                            title="Interactive Subtitles Lab"
                          >
                            <Beaker className="h-4.5 w-4.5 active:scale-95 transition-all" />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Information Meta Editorial Sideboard */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                <div 
                  className="glass-panel-dark p-8 flex flex-col gap-6 relative overflow-hidden" 
                >
                  <div className="card-orb-amber" style={{ bottom: "-40px", right: "-40px", width: "120px", height: "120px" }} />
                  <div className="relative z-10">
                    <span className="border border-orange-500/30 text-[9px] text-orange-400 font-sans px-3 py-1 uppercase tracking-[0.2em] font-bold bg-orange-500/10 rounded-full">
                      2027 A/L Revision
                    </span>
                    <h2 className="text-2xl font-serif text-white leading-tight font-bold mt-5">
                      Revision Video 1
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-serif italic">
                      Combined Mathematics — Model Paper Review
                    </p>
                  </div>

                  <div className="h-[1px] bg-white/5 relative z-10" />

                  {/* Editorial structured parameters breakdown */}
                  <div className="space-y-4 text-xs relative z-10">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 uppercase tracking-wider text-[9.5px] font-medium">Instructor</span>
                      <span className="text-white font-serif font-bold flex items-center gap-1.5 text-xs">
                        <Check className="h-3 w-3 text-orange-400" /> Indika Rathninda
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 uppercase tracking-wider text-[9.5px] font-medium">Total Duration</span>
                      <span className="font-serif italic text-xs font-semibold text-white">1 Hour 45 Mins</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 uppercase tracking-wider text-[9.5px] font-medium">Target Session</span>
                      <span className="font-sans text-[10.5px] uppercase font-bold text-orange-400 tracking-wider">Model Exam Paper</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-400 uppercase tracking-wider text-[9.5px] font-medium">Codec Protocol</span>
                      <span className="font-mono text-[10px] text-orange-300">High Definition V2</span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/5 relative z-10" />

                  {/* Editorial paper retrieve button */}
                  <div className="pt-2 relative z-10">
                    <HapticAppleButton 
                      onClick={handlePaperRedirect} 
                      tooltipTitle="SECURE EXAM DECODE"
                      tooltipDesc="Decrypts the 5-Question G.C.E. A/L Model Exam PDF prepared by Indika Rathninda."
                      className="w-full bg-orange-500 text-white hover:bg-orange-400 py-4 px-6 flex items-center justify-center gap-3 cursor-pointer select-none text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-lg shadow-orange-500/20 block"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Download className="h-4 w-4 text-white shrink-0" />
                        Download Exam Paper
                      </div>
                    </HapticAppleButton>
                  </div>

                </div>

              </div>

            </main>

            {/* Mobile optimized custom viewport layout */}
            
            {/* Mobile Video Player - visible only on small screens */}
            <div className="block lg:hidden w-full rounded-2xl overflow-hidden border border-white/10 bg-black/95 relative"
              onContextMenu={(e) => {
                e.preventDefault();
                triggerToast("Right-Click Restrained on Video Feed");
              }}
            >
              {/* Mobile watermark */}
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-20 opacity-10 select-none text-[7px] text-white tracking-[0.2em] font-mono uppercase items-center justify-items-center">
                <div>INDIKA RATHINDA</div> <div>PROTECTED</div>
                <div>DO NOT CAPTURE</div> <div>REVISION SECURE</div>
              </div>
              <video 
                ref={mobileVideoRef}
                className="w-full aspect-video object-cover" 
                playsInline 
                preload="auto"
                src={activeVideoUrl}
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noplaybackrate nofullscreen"
                crossOrigin="anonymous"
                onClick={togglePlay}
              >
              </video>
            </div>

            <PhoneCodeThrouver 
              onBackToLobby={() => {
                playRetroSound("pop");
                setPhase("selection");
                if (videoPlaying) {
                  videoRef.current?.pause();
                  setVideoPlaying(false);
                }
              }}
              videoPlaying={videoPlaying}
              onTogglePlay={togglePlay}
              currentTime={videoCurrentTime}
              duration={videoDuration}
              onSeek={(time) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  setVideoCurrentTime(time);
                }
              }}
              isMuted={videoMuted}
              onToggleMute={toggleMute}
              onPaperRedirect={handlePaperRedirect}
              playAudio={playRetroSound}
            />

            {/* Lower Area: Model Question Syllabus Blocks */}
            <div className="w-full space-y-8">
              
              <div 
                className="glass-panel-dark p-8 md:p-10 relative overflow-hidden"
              >
                <div className="card-orb-amber" style={{ top: "-30px", left: "-30px", width: "150px", height: "150px" }} />
                <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-orange-400 font-bold">2027 A/L • COMBINED MATHEMATICS</span>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">CODE: Rev-AL-27</div>
                </div>

                <h3 className="text-3xl font-serif text-white font-normal leading-tight tracking-tight mb-4 relative z-10">
                  Model Examination Intelligence Overview
                </h3>

                <p className="text-slate-300 font-serif leading-relaxed text-sm max-w-4xl relative z-10">
                  This is a carefully prepared <span className="font-sans font-bold text-orange-400">5-question Combined Mathematics model exam paper</span> for the 2027 G.C.E. Advanced Level examination, prepared by <span className="underline decoration-1 decoration-orange-400">Indika Rathninda</span>. The paper has a total time allocation of <span className="font-sans font-bold text-orange-400">1 hour and 45 minutes</span>.
                </p>

                <div className="h-[1px] bg-white/5 my-8 relative z-10" />

                {/* Question syllabus list with LaTeX expressions */}
                <h4 className="text-[11px] uppercase tracking-[0.25em] text-orange-400 font-bold mb-6 relative z-10">
                  Target Assessment Sectors:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">

                  {/* Section 01 */}
                  <TiltCard className="glass-panel-dark p-6 flex flex-col justify-between relative overflow-hidden group h-full">
                    <div className="card-orb-amber" style={{ top: "-40px", right: "-40px" }} />
                    <div className="relative z-10">
                      <span className="text-[9.5px] font-bold text-orange-400 tracking-wider block mb-2 font-mono">SECTION 01</span>
                      <h5 className="text-white font-serif font-bold text-base mb-3 leading-tight">Quadratic Equations & Factors</h5>
                      <p className="text-xs text-slate-300 leading-relaxed mb-6 font-serif">
                        Analysis of linear factors, roots of quadratic expressions, and structural theorems.
                      </p>
                    </div>
                    <div className="text-[11px] bg-black/40 py-3.5 px-3 border border-white/5 font-mono text-center text-orange-300 rounded-lg relative z-10">
                      {"ax² + bx + c = 0 → x = [-b ± √(b² - 4ac)] / 2a"}
                    </div>
                  </TiltCard>

                  {/* Section 02 */}
                  <TiltCard className="glass-panel-dark p-6 flex flex-col justify-between relative overflow-hidden group h-full">
                    <div className="card-orb-amber" style={{ top: "-40px", right: "-40px" }} />
                    <div className="relative z-10">
                      <span className="text-[9.5px] font-bold text-orange-400 tracking-wider block mb-2 font-mono">SECTION 02</span>
                      <h5 className="text-white font-serif font-bold text-base mb-3 leading-tight">Trigonometric Limits & Logarithms</h5>
                      <p className="text-xs text-slate-300 leading-relaxed mb-6 font-serif">
                        Verification of standard limits, proof validation, and logarithmic equations.
                      </p>
                    </div>
                    <div className="text-[11px] bg-black/40 py-3.5 px-3 border border-white/5 font-mono text-center text-orange-300 rounded-lg relative z-10">
                      {"lim₀ (sin θ)/θ = 1  AND  log(xy) = log(x) + log(y)"}
                    </div>
                  </TiltCard>

                  {/* Section 03 */}
                  <TiltCard className="glass-panel-dark p-6 flex flex-col justify-between relative overflow-hidden group h-full">
                    <div className="card-orb-amber" style={{ top: "-40px", right: "-40px" }} />
                    <div className="relative z-10">
                      <span className="text-[9.5px] font-bold text-orange-400 tracking-wider block mb-2 font-mono">SECTION 03</span>
                      <h5 className="text-white font-serif font-bold text-base mb-3 leading-tight">Kinematics & Graph Analysis</h5>
                      <p className="text-xs text-slate-300 leading-relaxed mb-6 font-serif">
                        Uniform acceleration systems modeled through graphical velocity-time analysis.
                      </p>
                    </div>
                    <div className="text-[11px] bg-black/40 py-3.5 px-3 border border-white/5 font-mono text-center text-orange-300 rounded-lg relative z-10">
                      {"v = u + at  AND  s = ut + ½at²"}
                    </div>
                  </TiltCard>

                  {/* Section 04 */}
                  <TiltCard className="glass-panel-dark p-6 flex flex-col justify-between relative overflow-hidden group h-full">
                    <div className="card-orb-amber" style={{ top: "-40px", right: "-40px" }} />
                    <div className="relative z-10">
                      <span className="text-[9.5px] font-bold text-orange-400 tracking-wider block mb-2 font-mono">SECTION 04</span>
                      <h5 className="text-white font-serif font-bold text-base mb-3 leading-tight">Coplanar Vector Equilibrium</h5>
                      <p className="text-xs text-slate-300 leading-relaxed mb-6 font-serif">
                        System resolution of forces in coplanar layouts and rigid body moment balancing.
                      </p>
                    </div>
                    <div className="text-[11px] bg-black/40 py-3.5 px-3 border border-white/5 font-mono text-center text-orange-300 rounded-lg relative z-10">
                      {"∑ F = 0  AND  ∑ τ = 0"}
                    </div>
                  </TiltCard>

                  {/* Section 05 */}
                  <TiltCard className="glass-panel-dark p-6 flex flex-col justify-between relative overflow-hidden group h-full">
                    <div className="card-orb-amber" style={{ top: "-40px", right: "-40px" }} />
                    <div className="relative z-10">
                      <span className="text-[9.5px] font-bold text-orange-400 tracking-wider block mb-2 font-mono">SECTION 05</span>
                      <h5 className="text-white font-serif font-bold text-base mb-3 leading-tight">Sine & Cosine Trigonometry</h5>
                      <p className="text-xs text-slate-300 leading-relaxed mb-6 font-serif">
                        Application of rules to triangles to compute structural dimensions and geometric lengths.
                      </p>
                    </div>
                    <div className="text-[11px] bg-black/40 py-3.5 px-3 border border-white/5 font-mono text-center text-orange-300 rounded-lg relative z-10">
                      {"a² = b² + c² - 2bc cos A"}
                    </div>
                  </TiltCard>

                  {/* Safeguards Card */}
                  <TiltCard className="glass-panel-dark p-6 flex flex-col justify-between font-sans relative overflow-hidden group h-full">
                    <div className="card-orb-amber" style={{ top: "-40px", right: "-40px" }} />
                    <div className="relative z-10">
                      <span className="text-[9px] font-bold text-amber-500 tracking-wider block mb-2 font-mono">CRITICAL REMINDER</span>
                      <h5 className="text-white font-serif font-bold text-base mb-3 leading-tight">Calculation Auditing</h5>
                      <p className="text-xs text-slate-300 leading-relaxed font-serif italic mb-6">
                        Students are strongly reminded to carefully check derivations, boundary constraints, and algebraic calculations before finalizing.
                      </p>
                    </div>
                    <div className="text-[9px] text-orange-400 font-extrabold bg-orange-500/10 px-2.5 py-2.5 border border-orange-500/20 text-center mt-2 uppercase tracking-wider relative z-10 rounded-lg">
                      Double-check calculations continuously.
                    </div>
                  </TiltCard>

                </div>
              </div>

              {/* Dynamic WhatsApp Query Link Card - beautiful premium glass card */}
              <div className="glass-panel-dark p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="card-orb-amber" style={{ top: "-30px", left: "-30px" }} />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 shrink-0 rounded-xl">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif font-bold text-white tracking-tight">Any doubts or questions?</h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl font-serif italic mt-1">
                      If you encounter any doubts, mechanical system questions, or formulas in the 2027 A/L syllabus, connect directly with Indika Rathninda on WhatsApp for detailed feedback.
                    </p>
                  </div>
                </div>

                <a 
                  href="https://wa.me/94713116877?text=%E0%B7%83%E0%B6%BB%E0%B7%8A%20%E0%B6%B8%E0%B6%A7%20%E0%B6%B4%E0%B7%8A%E2%80%8D%E0%B6%BB%E0%B7%81%E0%B7%8A%E0%B6%B1%E0%B6%BA%E0%B6%9A%E0%B7%8A%20%E0%B6%AD%E0%B7%92%E0%B6%BA%E0%B7%99%E0%B6%B1%E0%B7%80%E0%B7%8F" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-4 bg-orange-500 hover:bg-orange-400 text-white transition-all font-bold text-xs tracking-widest uppercase flex items-center gap-2 shrink-0 cursor-pointer relative z-10 rounded-xl shadow-lg shadow-orange-500/20"
                >
                  Ask On WhatsApp
                  <ChevronRight className="h-3.5 w-3.5 text-white" />
                </a>
              </div>

            </div>

            {/* Dashboard Footer */}
            <footer className="flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest pt-6 border-t border-white/5 gap-2 relative z-10 w-full">
              <div>
                &copy;  Combined Mathematics by Indika Rathninda. All content is secure and proprietary.
              </div>
              <div className="flex gap-4">
                <span className="text-orange-400/65">G.C.E. Advanced Level Specialist — Sri Lanka</span>
              </div>
            </footer>

          </div>

        </div>
      )}

      {phase === "lab" && (
        <AnimatedSubsLabs 
          onBack={() => {
            playRetroSound("pop");
            setPhase("dashboard");
          }} 
          playAudio={playRetroSound} 
        />
      )}

      {/* Floating alert toast notifications - styled to glass aesthetic */}
      <div 
        id="toast" 
        className={`fixed bottom-6 right-6 bg-black/80 backdrop-blur-md border border-orange-500/30 py-3.5 px-5 flex items-center gap-3.5 z-50 rounded-xl shadow-xl transition-all duration-500 ease-out ${
          toast.show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
        }`}
      >
        <span className="text-orange-400 font-bold text-xs">🛡️</span>
        <span id="toast-msg" className="text-xs uppercase tracking-[0.12em] font-extrabold text-white">
          {toast.msg}
        </span>
      </div>

      {/* =======================================================================
          PHASE X: ADMIN PANEL
          ======================================================================= */}
      {phase === "admin" && (
        <AdminControlPanel onViewStudentSite={() => setPhase("selection")} />
      )}

    </div>
  );
}
