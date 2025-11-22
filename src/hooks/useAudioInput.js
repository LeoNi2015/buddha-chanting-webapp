import { useState, useEffect, useRef, useCallback } from 'react';

export const useAudioInput = ({
    threshold = 15, // Volume threshold (0-100)
    cooldown = 100, // Cooldown in ms between counts (Reduced for rapid chanting)
    onBeat
}) => {
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const [error, setError] = useState(null);

    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const streamRef = useRef(null);
    const rafIdRef = useRef(null);
    const lastBeatTimeRef = useRef(0);
    const isTriggeredRef = useRef(false); // For hysteresis

    const processAudio = useCallback(() => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume (RMS-like)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // Normalize to roughly 0-100
        const normalizedVolume = Math.min(100, (average / 255) * 100 * 2); // Boosted slightly
        setVolume(normalizedVolume);

        // Beat detection logic (Schmitt Trigger / Hysteresis)
        // We want to detect the *start* of a sound, and then wait for it to drop significantly
        // before allowing another count. This prevents "Aaaaa" from counting multiple times.

        // TUNING:
        // Higher lowerThreshold (0.8) = Resets easier = Better for rapid chanting (less merging)
        // Lower lowerThreshold (0.5) = Resets harder = Better for preventing double counts on long vowels
        const lowerThreshold = threshold * 0.8;
        const now = Date.now();

        if (!isTriggeredRef.current) {
            // We are currently "silent"
            if (normalizedVolume > threshold && (now - lastBeatTimeRef.current > cooldown)) {
                // Rising edge detected!
                isTriggeredRef.current = true;
                if (onBeat) {
                    onBeat();
                }
                lastBeatTimeRef.current = now;
            }
        } else {
            // We are currently "loud" (in a beat)
            if (normalizedVolume < lowerThreshold) {
                // Falling edge detected - sound has finished/dropped enough
                isTriggeredRef.current = false;
            }
        }

        rafIdRef.current = requestAnimationFrame(processAudio);
    }, [threshold, cooldown, onBeat]);

    const startListening = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            // Reset state
            isTriggeredRef.current = false;
            setIsListening(true);
            processAudio();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check permissions.");
            setIsListening(false);
        }
    };

    const stopListening = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
        }
        setIsListening(false);
        setVolume(0);
    };

    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    return { isListening, volume, startListening, stopListening, error };
};
