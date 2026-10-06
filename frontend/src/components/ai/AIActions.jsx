import { useParams } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  Download
} from "lucide-react";
import aiService from "../../services/aiService";
import voiceService from "../../services/voiceService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import { useState, useEffect } from "react";
import Modal from "../common/Modal";

const AIActions = ({ documentId: propDocId, documentTitle }) => {
  const { id: paramDocId } = useParams();
  const documentId = propDocId || paramDocId;

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  // Voice States
  const [isSpeakingModal, setIsSpeakingModal] = useState(false);
  const [isConceptMicActive, setIsConceptMicActive] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      voiceService.stopListening();
    };
  }, []);

  const handleCloseModal = () => {
    voiceService.stopSpeaking();
    setIsSpeakingModal(false);
    setIsModalOpen(false);
  };

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");

    try {
      const data = await aiService.generateSummary(documentId);
      const summaryText = data?.summary || data?.data?.summary || data;
      setModalTitle("Executive Summary");
      setModalContent(summaryText);
      setIsModalOpen(true);
    } catch (error) {
      toast.error(error.message || "Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    if (e) e.preventDefault();
    if (!concept.trim()) {
      toast.error("Please enter a concept to explain");
      return;
    }

    if (isConceptMicActive) {
      voiceService.stopListening();
      setIsConceptMicActive(false);
    }

    setLoadingAction("explain");

    try {
      const data = await aiService.explainConcept(documentId, concept);
      const explanationText = data?.explanation || data?.data?.explanation || data;
      setModalTitle(`Concept Explanation: "${concept}"`);
      setModalContent(explanationText);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      toast.error(error.message || "Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleVoiceInModal = () => {
    if (isSpeakingModal) {
      voiceService.stopSpeaking();
      setIsSpeakingModal(false);
    } else {
      setIsSpeakingModal(true);
      voiceService.speak(modalContent, {
        onStart: () => setIsSpeakingModal(true),
        onEnd: () => setIsSpeakingModal(false),
        onError: () => setIsSpeakingModal(false),
      });
    }
  };

  const handleToggleConceptMic = () => {
    if (isConceptMicActive) {
      voiceService.stopListening();
      setIsConceptMicActive(false);
    } else {
      const ok = voiceService.startListening({
        onStart: () => setIsConceptMicActive(true),
        onTranscript: ({ interim, final, text }) => {
          if (text) setConcept(text);
        },
        onEnd: () => setIsConceptMicActive(false),
        onError: () => {
          setIsConceptMicActive(false);
          toast.error("Microphone speech recognition failed.");
        },
      });
      if (!ok) {
        toast.error("Microphone recognition not supported in this browser.");
      }
    }
  };

  const handleCopyModalContent = () => {
    navigator.clipboard.writeText(modalContent);
    setHasCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    const blob = new Blob([modalContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${modalTitle.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Notes downloaded!");
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  AI Study Tools & Actions
                </h3>
                <p className="text-xs text-slate-500">
                  Powered by Advanced LLM & Voice Narration
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Generate Summary */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200 ">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                    <BookOpen
                      className="w-4 h-4 text-blue-600"
                      strokeWidth={2}
                    />
                  </div>
                  <h4 className="font-semibold text-slate-900">
                    Document Executive Summary
                  </h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Extract core thesis, key insights, and actionable study points with audio narration support.
                </p>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="shrink-0 h-11 px-5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                {loadingAction === "summary" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    <span>Generate Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Explain Concept */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200 ">
            <form onSubmit={handleExplainConcept}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center ">
                  <Lightbulb
                    strokeWidth={2}
                    className="w-4 h-4 text-amber-600 "
                  />
                </div>
                <h4 className="font-semibold text-slate-900">
                  Concept Breakdown & Deep Explanation
                </h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Ask the AI to dissect any formula, term, or concept from this document. Type or speak your topic:
              </p>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Voice speech-to-text mic for concept */}
                <button
                  type="button"
                  onClick={handleToggleConceptMic}
                  title="Speak concept"
                  className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isConceptMicActive
                      ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                >
                  {isConceptMicActive ? <MicOff className="size-4.5" /> : <Mic className="size-4.5" />}
                </button>

                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder={
                    isConceptMicActive
                      ? "Listening... Speak the concept name..."
                      : "e.g. 'Backpropagation' or 'CAP Theorem'"
                  }
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-0 focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
                  disabled={loadingAction === "explain"}
                />

                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className="shrink-0 h-11 px-5 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                >
                  {loadingAction === "explain" ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Explaining...
                    </span>
                  ) : (
                    "Explain"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Result Modal with Voice Audio Player & Note Actions */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
      >
        <div className="space-y-4">
          {/* Action Toolbar on Modal */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {/* Audio Voice Player Toggle */}
            <button
              onClick={handleToggleVoiceInModal}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSpeakingModal
                  ? "bg-emerald-500 text-white shadow-sm animate-pulse"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isSpeakingModal ? (
                <>
                  <VolumeX className="size-4" />
                  <span>Stop Voice Reading</span>
                </>
              ) : (
                <>
                  <Volume2 className="size-4 text-emerald-600" />
                  <span>Listen Aloud (Voice)</span>
                </>
              )}
            </button>

            {/* Copy & Download Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyModalContent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {hasCopied ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5 text-slate-500" />
                )}
                <span>{hasCopied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleDownloadNotes}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Download className="size-3.5 text-slate-500" />
                <span>Save .md</span>
              </button>
            </div>
          </div>

          {/* Content Reader */}
          <div className="max-h-[50vh] overflow-y-auto prose prose-sm max-w-none prose-slate pr-2">
            <MarkdownRenderer content={modalContent} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIActions;
