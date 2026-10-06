import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageSquare,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Copy,
  Check
} from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import voiceService from "../../services/voiceService";
import VoiceTutorModal from "../voice/VoiceTutorModal";
import Spinner from "../common/Spinner";
import { useAuth } from "../../context/useAuth";
import MarkdownRenderer from "../common/MarkdownRenderer";
import toast from "react-hot-toast";

const ChatInterface = ({ documentId: propDocId, documentTitle }) => {
  const { id: paramDocId } = useParams();
  const documentId = propDocId || paramDocId;

  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Voice States
  const [isMicListening, setIsMicListening] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const historyData = await aiService.getChatHistory(documentId);
        setHistory(historyData || []);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        setHistory([]);
      } finally {
        setInitialLoading(false);
      }
    };

    if (documentId) {
      fetchChatHistory();
    }
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  // Clean up speech on component unmount
  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    if (isMicListening) {
      voiceService.stopListening();
      setIsMicListening(false);
    }

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      const assistantMessage = {
        role: "assistant",
        content: response.answer || response.data?.answer || "No response received.",
        timestamp: new Date(),
        relevantChunks: response.relevantChunks,
      };
      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error: ", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle mic for STT directly in chat input
  const handleToggleMic = () => {
    if (isMicListening) {
      voiceService.stopListening();
      setIsMicListening(false);
    } else {
      const success = voiceService.startListening({
        onStart: () => setIsMicListening(true),
        onTranscript: ({ interim, final, text }) => {
          if (text) {
            setMessage(text);
          }
        },
        onEnd: () => setIsMicListening(false),
        onError: () => {
          setIsMicListening(false);
          toast.error("Microphone access failed or not supported in this browser.");
        },
      });

      if (!success) {
        toast.error("Speech recognition is not supported in this browser.");
      }
    }
  };

  // Speak assistant message aloud
  const handleToggleSpeakMessage = (content, index) => {
    if (speakingIndex === index) {
      voiceService.stopSpeaking();
      setSpeakingIndex(null);
    } else {
      voiceService.stopSpeaking();
      setSpeakingIndex(index);
      voiceService.speak(content, {
        onEnd: () => setSpeakingIndex(null),
        onError: () => setSpeakingIndex(null),
      });
    }
  };

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";
    const isSpeakingThis = speakingIndex === index;

    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-4 ${isUser ? "justify-end" : ""}`}
      >
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        )}

        <div
          className={`max-w-lg p-4 rounded-2xl shadow-sm relative group ${
            isUser
              ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-br-md"
              : "bg-white border border-slate-200/60 text-slate-800 rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.content}</p>
          ) : (
            <>
              <div className="prose prose-sm max-w-none prose-slate">
                <MarkdownRenderer content={msg.content} />
              </div>

              {/* Message Quick Action Tools: Voice & Copy */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSpeakMessage(msg.content, index)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      isSpeakingThis
                        ? "bg-emerald-50 text-emerald-600 font-semibold"
                        : "hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isSpeakingThis ? (
                      <>
                        <VolumeX className="size-3.5 text-emerald-600 animate-pulse" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="size-3.5 text-slate-500" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => handleCopyMessage(msg.content, index)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Copy text"
                >
                  {copiedIndex === index ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0 shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-sm text-slate-500 font-medium mt-2">
          Loading conversation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Top Banner with Voice Tutor Launcher */}
      <div className="px-5 py-3 border-b border-slate-200/60 bg-linear-to-r from-slate-50 via-white to-emerald-50/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            AI Study Assistant
          </span>
        </div>

        {/* Voice Tutor Button */}
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Headphones className="size-3.5" />
          <span>Launch Voice Tutor</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-linear-to-br from-slate-50/50 via-white/50 to-slate-50/50">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <MessageSquare
                className="w-8 h-8 text-emerald-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              Ask anything about this document! You can type below or use the Voice Tutor for hands-free audio studying.
            </p>
            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Headphones className="size-4" />
              Try Hands-free Voice Mode
            </button>
          </div>
        ) : (
          history.map(renderMessage)
        )}
        <div ref={messageEndRef} />
        {loading && (
          <div className="flex items-center gap-3 my-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2 mx-4 py-3 px-4 rounded-2xl rounded-bl-md bg-white border border-slate-200/60 shadow-sm">
              <div className="flex gap-1.5 items-center">
                <span
                  className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
                <span className="text-xs text-slate-400 font-medium ml-2">
                  AI is analyzing...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200/60 bg-white/90">
        <form className="flex items-center gap-2 sm:gap-3" onSubmit={handleSendMessage}>
          {/* Speech to text Mic Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            title={isMicListening ? "Stop voice listening" : "Speak your question"}
            className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isMicListening
                ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/25"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-emerald-600"
            }`}
          >
            {isMicListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isMicListening
                ? "Listening... Speak your question..."
                : "Ask anything about this document..."
            }
            className={`flex-1 h-11 px-4 border-2 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-0 focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10 ${
              isMicListening
                ? "border-rose-400 bg-rose-50/20"
                : "border-slate-200 bg-slate-50/50"
            }`}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shrink-0 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-1.5 font-semibold text-sm cursor-pointer"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* Voice Tutor Modal */}
      <VoiceTutorModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        documentId={documentId}
        documentTitle={documentTitle}
      />
    </div>
  );
};

export default ChatInterface;
