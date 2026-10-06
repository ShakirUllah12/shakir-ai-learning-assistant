import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Send,
  RotateCcw,
  Settings,
  Headphones,
  Check,
  ChevronDown
} from "lucide-react";
import VoiceVisualizer from "./VoiceVisualizer";
import voiceService from "../../services/voiceService";
import aiService from "../../services/aiService";
import toast from "react-hot-toast";

const VoiceTutorModal = ({ isOpen, onClose, documentId, documentTitle }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [history, setHistory] = useState([]);
  const [autoListen, setAutoListen] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [textInput, setTextInput] = useState("");

  const conversationEndRef = useRef(null);

  // Initialize available voices
  useEffect(() => {
    if (isOpen) {
      const voices = voiceService.getVoices();
      setAvailableVoices(voices);

      // Welcome voice greeting if starting empty session
      if (history.length === 0) {
        const greeting = `Hello! I'm your AI Voice Tutor for ${documentTitle || "your document"}. What would you like to explore today?`;
        setHistory([{ role: "assistant", content: greeting, timestamp: new Date() }]);
        voiceService.speak(greeting, {
          rate: speechRate,
          onStart: () => setIsSpeaking(true),
          onEnd: () => {
            setIsSpeaking(false);
            if (autoListen) {
              setTimeout(() => startVoiceInput(), 500);
            }
          },
        });
      }
    } else {
      voiceService.stopSpeaking();
      voiceService.stopListening();
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, interimTranscript]);

  const startVoiceInput = () => {
    if (isThinking || isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    }

    setTranscript("");
    setInterimTranscript("");

    const success = voiceService.startListening({
      onStart: () => setIsListening(true),
      onTranscript: ({ interim, final, text }) => {
        setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          handleUserVoiceSubmit(final);
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
      onError: (err) => {
        setIsListening(false);
        console.warn("STT Error:", err);
      },
    });

    if (!success) {
      toast.error("Microphone access is required or not supported in this browser.");
    }
  };

  const stopVoiceInput = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleUserVoiceSubmit = async (questionText) => {
    if (!questionText || !questionText.trim()) return;

    voiceService.stopListening();
    setIsListening(false);
    setInterimTranscript("");
    setTranscript("");

    const userMsg = {
      role: "user",
      content: questionText.trim(),
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      let aiAnswer = "";
      if (documentId) {
        const res = await aiService.chat(documentId, questionText);
        aiAnswer = res?.answer || res?.data?.answer || "I reviewed your document, but couldn't generate a clear answer.";
      } else {
        aiAnswer = "I'm ready! Please open a specific document to study its contents in depth.";
      }

      const assistantMsg = {
        role: "assistant",
        content: aiAnswer,
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, assistantMsg]);
      setIsThinking(false);

      // Speak AI Answer aloud
      voiceService.speak(aiAnswer, {
        rate: speechRate,
        onStart: () => setIsSpeaking(true),
        onEnd: () => {
          setIsSpeaking(false);
          // In Hands-free mode, start listening again after brief pause!
          if (autoListen) {
            setTimeout(() => {
              startVoiceInput();
            }, 600);
          }
        },
        onError: () => {
          setIsSpeaking(false);
        },
      });
    } catch (err) {
      console.error("AI Voice Chat Error:", err);
      setIsThinking(false);
      const errorMsg = "Sorry, I had trouble retrieving that answer. Could you ask again?";
      setHistory((prev) => [
        ...prev,
        { role: "assistant", content: errorMsg, timestamp: new Date() },
      ]);
      voiceService.speak(errorMsg, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      });
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const text = textInput;
    setTextInput("");
    handleUserVoiceSubmit(text);
  };

  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleReplayMessage = (content) => {
    voiceService.stopSpeaking();
    voiceService.stopListening();
    setIsListening(false);

    voiceService.speak(content, {
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleVoiceChange = (e) => {
    const idx = parseInt(e.target.value);
    setSelectedVoiceIndex(idx);
    if (availableVoices[idx]) {
      voiceService.setVoice(availableVoices[idx]);
    }
  };

  const handleRateChange = (newRate) => {
    setSpeechRate(newRate);
    voiceService.setRate(newRate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[750px] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Headphones className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  AI Voice Tutor
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  LIVE CONVERSATION
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {documentTitle || "Hands-Free Voice Study Companion"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Voice Settings"
              className={`p-2 rounded-xl transition-colors ${
                showSettings
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Settings className="size-4.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Voice Settings Drawer */}
        {showSettings && (
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800/80 text-xs space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-slate-400 font-medium block mb-1">
                  Synthetic Voice:
                </label>
                <select
                  value={selectedVoiceIndex}
                  onChange={handleVoiceChange}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {availableVoices.map((v, idx) => (
                    <option key={idx} value={idx}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Speed Rate:
                </label>
                <div className="flex items-center gap-1.5">
                  {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        speechRate === rate
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-4">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoListen}
                    onChange={(e) => setAutoListen(e.target.checked)}
                    className="accent-emerald-500 size-4 rounded"
                  />
                  <span>Hands-free auto-listen</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Central Visualizer Section */}
        <div className="shrink-0 bg-linear-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/60 pt-2 pb-4">
          <VoiceVisualizer
            isListening={isListening}
            isSpeaking={isSpeaking}
            state={isThinking ? "thinking" : isListening ? "listening" : isSpeaking ? "speaking" : "idle"}
          />

          {/* Quick Mic Control Bar */}
          <div className="flex items-center justify-center gap-4 mt-1">
            {!isListening ? (
              <button
                onClick={startVoiceInput}
                className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <Mic className="size-5" />
                <span>Tap to Speak</span>
              </button>
            ) : (
              <button
                onClick={stopVoiceInput}
                className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-rose-500/25 active:scale-95 transition-all cursor-pointer animate-pulse"
              >
                <MicOff className="size-5" />
                <span>Stop Listening</span>
              </button>
            )}

            {isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="inline-flex items-center gap-2 px-4 h-12 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-2xl transition-colors cursor-pointer"
              >
                <VolumeX className="size-4.5" />
                <span>Mute Voice</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/60">
          {history.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-emerald-500/10">
                    <Sparkles className="size-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-br-xs shadow-md shadow-emerald-500/10"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs"
                  }`}
                >
                  <p>{msg.content}</p>
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>AI Voice Tutor</span>
                      <button
                        onClick={() => handleReplayMessage(msg.content)}
                        className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        <Volume2 className="size-3.5" />
                        Listen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Interim Real-time Speech Preview */}
          {interimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 italic animate-pulse">
                "{interimTranscript}..."
              </div>
            </div>
          )}

          <div ref={conversationEndRef} />
        </div>

        {/* Quick Voice Suggestions / Text Fallback Input */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800/80 space-y-3">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              "Summarize key concepts",
              "Quiz me verbally",
              "Explain simply",
              "What is the main topic?"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleUserVoiceSubmit(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer"
              >
                💬 {prompt}
              </button>
            ))}
          </div>

          {/* Text input fallback */}
          <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Or type your question here..."
              className="flex-1 h-10 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isThinking}
              className="h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-semibold transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VoiceTutorModal;
