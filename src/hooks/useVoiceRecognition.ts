/**
 * Voice Recognition Hook
 *
 * Uses the Web Speech API (SpeechRecognition) for real-time voice-to-text
 * transcription. Configured for Colombian Spanish (es-CO).
 *
 * Features:
 * - Continuous recognition with interim results
 * - Auto-stop after 30s of silence
 * - Error handling (permission denied, not supported, network)
 * - Append mode (transcript accumulates across sessions)
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Browser compatibility declarations
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export interface UseVoiceRecognitionReturn {
  /** Whether the mic is actively listening */
  isListening: boolean;
  /** Finalized transcript text (accumulated across sessions) */
  transcript: string;
  /** In-progress interim text (updates in real-time while speaking) */
  interimTranscript: string;
  /** Error message if recognition failed */
  error: string | null;
  /** Whether the browser supports Speech Recognition */
  isSupported: boolean;
  /** Start listening for voice input */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Clear all transcript text */
  resetTranscript: () => void;
}

const SILENCE_TIMEOUT_MS = 30_000;

export function useVoiceRecognition(lang = 'es-CO'): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isStoppingRef = useRef(false);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      // Auto-stop after prolonged silence
      if (recognitionRef.current && !isStoppingRef.current) {
        isStoppingRef.current = true;
        recognitionRef.current.stop();
      }
    }, SILENCE_TIMEOUT_MS);
  }, [clearSilenceTimer]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current && !isStoppingRef.current) {
      isStoppingRef.current = true;
      recognitionRef.current.stop();
    }
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado en este navegador');
      return;
    }

    setError(null);
    setInterimTranscript('');
    isStoppingRef.current = false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      resetSilenceTimer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resetSilenceTimer();

      let finalPart = '';
      let interimPart = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalPart += text;
        } else {
          interimPart += text;
        }
      }

      if (finalPart) {
        setTranscript(prev => {
          const separator = prev && !prev.endsWith(' ') ? ' ' : '';
          return prev + separator + finalPart.trim();
        });
      }

      setInterimTranscript(interimPart);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      clearSilenceTimer();

      const errorMessages: Record<string, string> = {
        'not-allowed': 'Permiso de micrófono denegado. Habilite el acceso al micrófono.',
        'no-speech': 'No se detectó voz. Intente de nuevo.',
        'audio-capture': 'No se encontró micrófono. Verifique su dispositivo.',
        'network': 'Error de red. Verifique su conexión a internet.',
        'aborted': '',
      };

      const msg = errorMessages[event.error] || `Error de reconocimiento: ${event.error}`;
      if (msg) setError(msg);
      setIsListening(false);
    };

    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
      setInterimTranscript('');
      isStoppingRef.current = false;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setError('No se pudo iniciar el reconocimiento de voz');
    }
  }, [isSupported, lang, resetSilenceTimer, clearSilenceTimer]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        isStoppingRef.current = true;
        recognitionRef.current.abort();
      }
    };
  }, [clearSilenceTimer]);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
