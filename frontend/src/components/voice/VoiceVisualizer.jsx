import React from "react";
import { Mic, Volume2, Sparkles, Brain } from "lucide-react";

/**
 * State: 'idle' | 'listening' | 'thinking' | 'speaking'
 */
const VoiceVisualizer = ({ state = "idle", isListening = false, isSpeaking = false }) => {
  const currentState = isListening
    ? "listening"
    : isSpeaking
    ? "speaking"
    : state;

  return (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      {/* Outer Glow Halo */}
      <div className="relative flex items-center justify-center">
        {/* Animated Background Rings */}
        {currentState === "listening" && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
            <div className="absolute w-48 h-48 rounded-full bg-teal-500/10 animate-pulse duration-700" />
          </>
        )}

        {currentState === "speaking" && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-teal-500/20 animate-ping duration-1000" />
            <div className="absolute w-44 h-44 rounded-full bg-cyan-500/15 animate-pulse duration-500" />
          </>
        )}

        {currentState === "thinking" && (
          <div className="absolute w-40 h-40 rounded-full border-2 border-emerald-400/40 border-t-transparent animate-spin duration-1000" />
        )}

        {/* Central Orb */}
        <div
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
            currentState === "listening"
              ? "bg-linear-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/50 scale-110"
              : currentState === "speaking"
              ? "bg-linear-to-tr from-teal-500 to-cyan-500 shadow-teal-500/50 scale-105"
              : currentState === "thinking"
              ? "bg-linear-to-tr from-amber-500 to-emerald-500 shadow-amber-500/40 animate-pulse"
              : "bg-linear-to-tr from-slate-700 to-slate-800 shadow-slate-900/30"
          }`}
        >
          {currentState === "listening" ? (
            <Mic className="size-10 text-white animate-pulse" strokeWidth={2.5} />
          ) : currentState === "speaking" ? (
            <Volume2 className="size-10 text-white animate-bounce" strokeWidth={2.5} />
          ) : currentState === "thinking" ? (
            <Brain className="size-10 text-white animate-spin" strokeWidth={2.5} />
          ) : (
            <Sparkles className="size-10 text-slate-300" strokeWidth={2} />
          )}
        </div>
      </div>

      {/* Dynamic Sound Wave Bars */}
      <div className="flex items-center gap-1.5 h-12 mt-6">
        {[
          { h: "h-3", anim: "animate-[pulse_0.6s_ease-in-out_infinite]" },
          { h: "h-6", anim: "animate-[pulse_0.4s_ease-in-out_infinite_0.1s]" },
          { h: "h-9", anim: "animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" },
          { h: "h-5", anim: "animate-[pulse_0.35s_ease-in-out_infinite_0.15s]" },
          { h: "h-8", anim: "animate-[pulse_0.45s_ease-in-out_infinite_0.25s]" },
          { h: "h-11", anim: "animate-[pulse_0.55s_ease-in-out_infinite_0.05s]" },
          { h: "h-7", anim: "animate-[pulse_0.4s_ease-in-out_infinite_0.3s]" },
          { h: "h-10", anim: "animate-[pulse_0.5s_ease-in-out_infinite_0.1s]" },
          { h: "h-5", anim: "animate-[pulse_0.35s_ease-in-out_infinite_0.2s]" },
          { h: "h-8", anim: "animate-[pulse_0.45s_ease-in-out_infinite_0.05s]" },
          { h: "h-4", anim: "animate-[pulse_0.6s_ease-in-out_infinite_0.15s]" },
        ].map((bar, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              currentState === "listening" || currentState === "speaking"
                ? `bg-linear-to-t from-emerald-500 to-teal-400 ${bar.h} ${bar.anim}`
                : currentState === "thinking"
                ? "bg-slate-400 h-2 animate-pulse"
                : "bg-slate-300 h-1.5"
            }`}
          />
        ))}
      </div>

      {/* Status Label */}
      <div className="mt-3 text-center">
        <p
          className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${
            currentState === "listening"
              ? "text-emerald-500 animate-pulse"
              : currentState === "speaking"
              ? "text-teal-500"
              : currentState === "thinking"
              ? "text-amber-500"
              : "text-slate-400"
          }`}
        >
          {currentState === "listening"
            ? "Listening to you... Speak now"
            : currentState === "speaking"
            ? "AI Tutor is speaking..."
            : currentState === "thinking"
            ? "AI Tutor is thinking..."
            : "Tap mic to start conversational study"}
        </p>
      </div>
    </div>
  );
};

export default VoiceVisualizer;
