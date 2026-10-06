// Professional Web Speech & Audio Service for AI Learning Assistant
// Provides resilient Speech-to-Text (STT) and Natural Text-to-Speech (TTS)

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    this.isListening = false;
    this.isSpeaking = false;
    this.audioCtx = null;
    this.selectedVoice = null;
    this.speechRate = 1.0;
    this.speechPitch = 1.0;
    this.currentUtteranceQueue = [];
    this.onSpeakingStateChange = null;

    if (typeof window !== "undefined") {
      this.initRecognition();
      this.initVoices();
    }
  }

  // --- AUDIO FEEDBACK SOUNDS (Web Audio API synthesis - zero external assets needed) ---
  getAudioContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playChime(type = "start") {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "start") {
        // High pleasant double-tone
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "stop") {
        // Soft descending tone
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === "success") {
        // Success chord
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio cue failure should never block UI
    }
  }

  // --- SPEECH RECOGNITION (STT) ---
  isSTTSupported() {
    return (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    );
  }

  initRecognition() {
    if (!this.isSTTSupported()) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = "en-US";
  }

  startListening({ onTranscript, onStart, onEnd, onError, lang = "en-US" }) {
    if (!this.isSTTSupported()) {
      if (onError) {
        onError({
          message:
            "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
        });
      }
      return false;
    }

    // Stop speaking if currently speaking
    this.stopSpeaking();

    // Re-initialize for fresh event hooks
    this.initRecognition();
    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.playChime("start");
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (onTranscript) {
        onTranscript({
          interim: interimTranscript,
          final: finalTranscript,
          text: (finalTranscript || interimTranscript).trim(),
        });
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this.playChime("stop");
      if (onError) onError(event);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.playChime("stop");
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Speech recognition start failed:", err);
      if (onError) onError(err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  // --- TEXT TO SPEECH (TTS) ---
  isTTSSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  initVoices() {
    if (!this.isTTSSupported()) return;

    const populateVoices = () => {
      const voices = this.getVoices();
      if (!this.selectedVoice && voices.length > 0) {
        // Preferred natural voices: Google, Samantha, Natural, Microsoft
        const preferred = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Online"))
        ) || voices.find((v) => v.lang.startsWith("en")) || voices[0];

        this.selectedVoice = preferred;
      }
    };

    populateVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  getVoices() {
    if (!this.isTTSSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  setVoice(voice) {
    this.selectedVoice = voice;
  }

  setRate(rate) {
    this.speechRate = Math.min(2.0, Math.max(0.5, rate));
  }

  setPitch(pitch) {
    this.speechPitch = Math.min(2.0, Math.max(0.5, pitch));
  }

  // Clean Markdown, math, code blocks, and URLs for natural speaking
  cleanTextForSpeech(text) {
    if (!text) return "";
    return text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "Code omitted.")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove image and markdown links [text](url) -> text
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      // Remove header symbols (#, ##, etc.)
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold and italics
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove bullet points / blockquotes
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*>\s+/gm, "")
      // Remove URLs
      .replace(/https?:\/\/\S+/g, "link")
      // Clean excessive spaces and newlines
      .replace(/\s+/g, " ")
      .trim();
  }

  // Split long texts into natural sentence chunks to avoid browser 15s freeze bug
  splitIntoSentences(text) {
    if (!text) return [];
    const cleaned = this.cleanTextForSpeech(text);
    // Split on full stops, question marks, exclamation marks, or newlines
    const regex = /[^.!?]+[.!?]+|\s*[^.!?]+$/g;
    const matches = cleaned.match(regex);
    if (!matches) return [cleaned];
    return matches.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  speak(text, { onStart, onEnd, onBoundary, onError, rate, pitch, voice } = {}) {
    if (!this.isTTSSupported()) {
      if (onError) onError(new Error("Speech synthesis is not supported."));
      return;
    }

    // Stop any existing speech
    this.stopSpeaking();

    const sentences = this.splitIntoSentences(text);
    if (sentences.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    this.isSpeaking = true;
    if (this.onSpeakingStateChange) this.onSpeakingStateChange(true);
    if (onStart) onStart();

    let currentIndex = 0;

    const speakNextSentence = () => {
      if (!this.isSpeaking) return;

      if (currentIndex >= sentences.length) {
        this.isSpeaking = false;
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
        if (onEnd) onEnd();
        return;
      }

      const sentence = sentences[currentIndex];
      const utterance = new SpeechSynthesisUtterance(sentence);

      const activeVoice = voice || this.selectedVoice;
      if (activeVoice) {
        utterance.voice = activeVoice;
      }

      utterance.rate = rate !== undefined ? rate : this.speechRate;
      utterance.pitch = pitch !== undefined ? pitch : this.speechPitch;

      utterance.onboundary = (e) => {
        if (onBoundary) onBoundary(e);
      };

      utterance.onend = () => {
        currentIndex++;
        speakNextSentence();
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis utterance error:", e);
        this.isSpeaking = false;
        if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
        if (onError) onError(e);
      };

      this.currentUtteranceQueue.push(utterance);
      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  }

  pauseSpeaking() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  resumeSpeaking() {
    if (this.synth && this.isSpeaking) {
      this.synth.resume();
    }
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtteranceQueue = [];
    }
    this.isSpeaking = false;
    if (this.onSpeakingStateChange) this.onSpeakingStateChange(false);
  }
}

export const voiceService = new VoiceService();
export default voiceService;
