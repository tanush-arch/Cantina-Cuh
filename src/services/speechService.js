// Speech Synthesis & Recognition Service

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isRecognizing = false;
    this.speechCallbacks = {
      onStart: null,
      onEnd: null,
      onError: null,
      onPause: null,
      onResume: null,
    };
  }

  isSynthesisSupported() {
    return !!(typeof window !== 'undefined' && window.speechSynthesis);
  }

  isRecognitionSupported() {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Get available browser voices
  getVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  // Stop any ongoing speech
  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Pause speech
  pauseSpeaking() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  // Resume speech
  resumeSpeaking() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  // Speak text with specified options
  speak(text, { rate = 1.0, lang = 'en-US', onStart, onEnd, onError } = {}) {
    if (!this.synth || !text) return;

    // Cancel current speaking before starting new
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = lang;

    // Pick matching voice if available
    const voices = this.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      if (onError) onError(event);
    };

    this.synth.speak(utterance);
  }

  // Initialize Speech Recognition
  initRecognition({ lang = 'en-US', onResult, onError, onEnd, onStart }) {
    if (!this.isRecognitionSupported()) {
      return null;
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onstart = () => {
      this.isRecognizing = true;
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript.trim();
        if (onResult) onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      this.isRecognizing = false;
      if (onError) onError(event);
    };

    recognition.onend = () => {
      this.isRecognizing = false;
      if (onEnd) onEnd();
    };

    this.recognition = recognition;
    return recognition;
  }

  startListening({ lang = 'en-US', onResult, onError, onEnd, onStart }) {
    this.stopSpeaking(); // Avoid recording browser speech synthesis

    if (this.recognition && this.isRecognizing) {
      this.recognition.abort();
    }

    const rec = this.initRecognition({ lang, onResult, onError, onEnd, onStart });
    if (!rec) {
      if (onError) onError({ error: 'not-supported', message: 'Speech Recognition not supported in this browser' });
      return;
    }

    try {
      rec.start();
    } catch (err) {
      if (onError) onError(err);
    }
  }

  stopListening() {
    if (this.recognition && this.isRecognizing) {
      this.recognition.stop();
      this.isRecognizing = false;
    }
  }
}

export const speechService = new SpeechService();
