import { useRef, useState, useCallback } from 'react';

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
const synth = window.speechSynthesis || null;

export function useVoice({ onTranscript }) {
    const recognitionRef = useRef(null);
    const [voiceStatus, setVoiceStatus] = useState('idle'); // idle | listening | speaking | error
    const [isRecognitionSupported] = useState(!!SpeechRecognitionAPI);
    const [isSynthSupported] = useState(!!synth);

    const speak = useCallback((text) => {
        if (!synth || !text) return;
        synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.95;
        utter.pitch = 1;
        utter.onstart = () => setVoiceStatus('speaking');
        utter.onend = () => setVoiceStatus('idle');
        utter.onerror = () => setVoiceStatus('idle');
        synth.speak(utter);
    }, []);

    const stopSpeaking = useCallback(() => {
        if (synth) { synth.cancel(); setVoiceStatus('idle'); }
    }, []);

    const startListening = useCallback(() => {
        if (!SpeechRecognitionAPI) return;
        if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch { } }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setVoiceStatus('listening');
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            if (onTranscript) onTranscript(transcript);
            setVoiceStatus('idle');
        };
        recognition.onerror = (e) => {
            console.error('SpeechRecognition error:', e.error);
            setVoiceStatus(e.error === 'not-allowed' ? 'error' : 'idle');
        };
        recognition.onend = () => {
            if (voiceStatus === 'listening') setVoiceStatus('idle');
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [onTranscript, voiceStatus]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { }
        }
        setVoiceStatus('idle');
    }, []);

    const cleanup = useCallback(() => {
        stopSpeaking();
        stopListening();
    }, [stopSpeaking, stopListening]);

    return {
        speak, stopSpeaking,
        startListening, stopListening,
        voiceStatus, isRecognitionSupported, isSynthSupported,
        cleanup
    };
}
