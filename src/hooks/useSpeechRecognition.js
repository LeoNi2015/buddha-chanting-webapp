import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = ({ onMatch }) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState(null);
    const [transcript, setTranscript] = useState('');

    const recognitionRef = useRef(null);
    const processedCountRef = useRef(0); // Track matches in current session

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true; // Enable interim results for instant feedback
        recognition.lang = 'zh-CN'; // Default to Chinese for Nianfo, or 'en-US'

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            processedCountRef.current = 0; // Reset processed count for new session
        };

        recognition.onend = () => {
            // Auto-restart if it stops unexpectedly while we want it to listen
            if (isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    setIsListening(false);
                }
            } else {
                setIsListening(false);
            }
            processedCountRef.current = 0; // Reset on end/restart
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone permission denied.");
                setIsListening(false);
            }
        };

        recognition.onresult = (event) => {
            // Combine all results (interim + final) to get the full picture of current session
            let fullTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                fullTranscript += event.results[i][0].transcript;
            }

            // We need to look at the WHOLE transcript of this session to count correctly,
            // but event.results accumulates.
            // Actually, for continuous=true, event.results contains all results for the session.
            // We should reconstruct the full text from event.results[0] to [length-1].

            let sessionTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                sessionTranscript += event.results[i][0].transcript;
            }

            setTranscript(sessionTranscript); // Update UI with what we hear

            // Count total occurrences in the entire session transcript
            let totalCount = 0;

            // STRICT PHRASE COUNTING (For precise timing on "Fo")
            // We count full occurrences of "阿弥陀佛". 
            // Since we use interimResults, this will trigger exactly when the "Fo" character is recognized.

            const chineseMatches = sessionTranscript.match(/阿弥陀佛/g);
            if (chineseMatches) totalCount += chineseMatches.length;

            // English variants
            const englishMatches = sessionTranscript.match(/amitabha|amituofo|omitofo/ig);
            if (englishMatches) totalCount += englishMatches.length;

            // Calculate new matches since last check
            const newMatches = totalCount - processedCountRef.current;

            if (newMatches > 0 && onMatch) {
                for (let i = 0; i < newMatches; i++) {
                    onMatch();
                }
                processedCountRef.current = totalCount; // Update processed count
            }
        };


        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [onMatch, isListening]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { isListening, startListening, stopListening, error, transcript };
};
