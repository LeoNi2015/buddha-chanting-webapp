import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = ({ onMatch }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [transcript, setTranscript] = useState('');

    const recognitionRef = useRef(null);
    const processedCountRef = useRef(0);
    const onMatchRef = useRef(onMatch);
    const shouldListenRef = useRef(false); // Track if we INTEND to listen

    // Update the ref whenever onMatch changes so the event handler sees the latest version
    useEffect(() => {
        onMatchRef.current = onMatch;
    }, [onMatch]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            processedCountRef.current = 0;
        };

        recognition.onend = () => {
            // Only restart if we still intend to listen (auto-restart for continuous)
            if (shouldListenRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    // Ignore errors on restart
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
            processedCountRef.current = 0;
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone permission denied.");
                shouldListenRef.current = false;
                setIsListening(false);
            }
        };

        recognition.onresult = (event) => {
            let sessionTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                sessionTranscript += event.results[i][0].transcript;
            }

            setTranscript(sessionTranscript);

            let totalCount = 0;
            const chineseMatches = sessionTranscript.match(/阿弥陀佛/g);
            if (chineseMatches) totalCount += chineseMatches.length;

            const englishMatches = sessionTranscript.match(/amitabha|amituofo|omitofo/ig);
            if (englishMatches) totalCount += englishMatches.length;

            const newMatches = totalCount - processedCountRef.current;

            if (newMatches > 0 && onMatchRef.current) {
                for (let i = 0; i < newMatches; i++) {
                    onMatchRef.current();
                }
                processedCountRef.current = totalCount;
            }
        };

        recognitionRef.current = recognition;

        return () => {
            // Cleanup on unmount
            shouldListenRef.current = false;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []); // Only run once on mount

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                shouldListenRef.current = true;
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            shouldListenRef.current = false;
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return { isListening, startListening, stopListening, error, transcript };
};
