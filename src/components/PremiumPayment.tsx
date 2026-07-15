import React, { useState, useRef } from "react";

interface PremiumPaymentProps {
  isDarkTheme?: boolean;
}

export default function PremiumPayment({ isDarkTheme = true }: PremiumPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAccount = () => {
    const text = "4424420004917795";
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
    document.body.removeChild(textArea);
  };

  return (
    <>
      {/* Pay Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center gap-2.5 text-white font-bold rounded-2xl cursor-pointer outline-none px-5 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
        }}
      >
        <svg
          className="w-5 h-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]">
          Pay Fee
        </span>
      </button>

      {/* Checkout Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-3xl p-8 text-white shadow-2xl relative"
            style={{
              background: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              animation: "fadeInPayment 0.3s ease-out forwards",
            }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                Lesson Access
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Package Info */}
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Package</span>
                <span className="text-white font-medium">4 Lessons</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Price</span>
                <span className="text-emerald-400 font-bold">1000 LKR</span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 mb-6">
              <p className="font-bold text-slate-300 text-xs mb-1">Bank Details</p>
              <p className="font-mono text-emerald-400 text-sm">Pan Asia Bank</p>
              <p className="font-mono text-emerald-400 text-sm">I.S.B.Rathninda</p>
              <div className="flex items-center justify-between mt-1">
                <p className="font-mono text-emerald-400 text-sm">
                  4424 4200 0491 7795
                </p>
                <button
                  onClick={copyAccount}
                  className="text-slate-500 hover:text-white transition-colors p-1.5 bg-white/5 rounded-lg hover:bg-white/10"
                >
                  {copied ? (
                    <span className="text-[10px] font-bold text-emerald-400">Copied!</span>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2">Kandy City Center Branch</p>
            </div>

            {/* Instructions */}
            <p className="text-slate-400 text-xs leading-relaxed mb-6 italic">
              Send the 1000 LKR to the bank account and send a receipt to the
              WhatsApp number. These details are required for the lesson box
              videos.
            </p>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/94713116877"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.591 5.52 0 10.02-4.5 10.02-10.02 0-5.52-4.5-10.02-10.02-10.02-5.52 0-10.02 4.5-10.02 10.02 0 1.956.566 3.815 1.548 5.466l-.75 2.744 2.805-.725z" />
              </svg>
              Send Receipt via WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Keyframes for modal animation */}
      <style>{`
        @keyframes fadeInPayment {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
